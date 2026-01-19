package com.zlatkovnik.demo_resilience4j.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@RequiredArgsConstructor
public class PaymentSimulatorWorker {

    private final AtomicInteger idGenerator = new AtomicInteger(0);

    private final PaymentService paymentService;

    @Scheduled(fixedDelayString = "#{T(java.util.concurrent.ThreadLocalRandom).current().nextInt(1000, 3001)}")
    public void runWorker() {
        String txId = "TXN-" + idGenerator.getAndIncrement();
        DepositRequest depositRequest = new DepositRequest(txId, LocalDateTime.now(), null);
        paymentService.deposit(depositRequest);
    }
}
