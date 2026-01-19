package com.zlatkovnik.demo_resilience4j.payment;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
@Slf4j
public class PaymentDeadLetterHandler {

    private final CircuitBreakerRegistry registry;
    private final PaymentDeadLetterQueue deadLetterQueue;
    private final PaymentService paymentService;

    private final ExecutorService recoveryExecutor = Executors.newSingleThreadExecutor();

    public PaymentDeadLetterHandler(CircuitBreakerRegistry registry,
                                    PaymentDeadLetterQueue deadLetterQueue,
                                    PaymentService paymentService) {
        this.registry = registry;
        this.deadLetterQueue = deadLetterQueue;
        this.paymentService = paymentService;
        registerListener();
    }

    private void registerListener() {
        CircuitBreaker cb = registry.circuitBreaker("paymentCB");
        cb.getEventPublisher().onStateTransition(event -> {
            if (event.getStateTransition() == CircuitBreaker.StateTransition.HALF_OPEN_TO_CLOSED) {
                log.info("Circuit RECOVERED. Scheduling async DLQ flush...");
                recoveryExecutor.submit(this::flushDeadLettersWithRateLimit);
            }
        });
    }

    private void flushDeadLettersWithRateLimit() {
        while (!deadLetterQueue.isEmpty()) {
            if (registry.circuitBreaker("paymentCB").getState() != CircuitBreaker.State.CLOSED) {
                break;
            }

            DepositRequest depositRequest = deadLetterQueue.pollOne();
            if (depositRequest == null) break;

            try {
                log.info("Retry from DQL for {}", depositRequest.getTransactionId());
                paymentService.deposit(depositRequest);
                Thread.sleep(100);
            } catch (Exception e) {
                // Fallback in PaymentService will put it back in the queue
            }
        }
    }
}