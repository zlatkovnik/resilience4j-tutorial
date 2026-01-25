package com.zlatkovnik.demo_resilience4j.payment;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String API_URL = "http://localhost:8080/external-api/deposit";
    private final PaymentDeadLetterQueue paymentDeadLetterQueue;
    private final List<DepositRequest> processedDepositRequests = Collections.synchronizedList(new ArrayList<>());

    private final CircuitBreakerRegistry circuitBreakerRegistry;
    private io.github.resilience4j.circuitbreaker.CircuitBreaker paymentCircuitBreaker;
    private AtomicInteger callsPreventedByCircuitBreaker = new AtomicInteger(0);

    @PostConstruct
    public void init() {
        paymentCircuitBreaker = circuitBreakerRegistry.circuitBreaker("paymentCB");
        paymentCircuitBreaker.getEventPublisher().onCallNotPermitted(event -> callsPreventedByCircuitBreaker.incrementAndGet());
    }

    @CircuitBreaker(name = "paymentCB", fallbackMethod = "depositFallback")
    public void deposit(DepositRequest depositRequest) {
        restTemplate.postForEntity(API_URL, depositRequest, String.class);
        depositRequest.setProcessedTimestamp(LocalDateTime.now());
        processedDepositRequests.add(depositRequest);
        log.info("Transaction {} successful", depositRequest.getTransactionId());
    }

    public void depositFallback(DepositRequest depositRequest, Exception e) {
        log.error("Transaction {} failed, placing in dql", depositRequest.getTransactionId());
        paymentDeadLetterQueue.add(depositRequest);
        throw new PaymentException("Transaction {} failed", e);
    }

    public List<DepositRequest> getProcessedDepositRequests() {
        return processedDepositRequests.stream().toList();
    }

    public Integer getCallsPreventedByCircuitBreaker() {
        return callsPreventedByCircuitBreaker.get();
    }
}