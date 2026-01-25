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
    private final UnsafePaymentService unsafePaymentService;

    private boolean isBurstMode = false;
    private long burstEndTime = 0;

    @Scheduled(fixedDelay = 50)
    public void runWorker() {
        long now = System.currentTimeMillis();

        if (isBurstMode) {
            if (now < burstEndTime) {
                executeDeposit();
            } else {
                isBurstMode = false;
                System.out.println(">>> BURST MODE ENDED");
            }
        } else {
            if (Math.random() < 0.005) {
                startBurst();
            } else {
                executeNormalFlow(now);
            }
        }
    }

    private long lastNormalRun = 0;

    private void executeNormalFlow(long now) {
        if (now - lastNormalRun >= 2000) {
            executeDeposit();
            lastNormalRun = now;
        }
    }

    private void startBurst() {
        System.out.println(">>> BURST MODE STARTED!");
        isBurstMode = true;
        burstEndTime = System.currentTimeMillis() + 5000;
    }

    private void executeDeposit() {
        String txId = "TXN-" + idGenerator.getAndIncrement();
        DepositRequest req = new DepositRequest(txId, LocalDateTime.now(), null);
        try { paymentService.deposit(req); } catch (Exception ignored) {}
        DepositRequest unsafeDepositRequest = new DepositRequest(txId, LocalDateTime.now(), null);
        try { unsafePaymentService.deposit(unsafeDepositRequest); } catch (Exception ignored) {}
    }
}