package com.zlatkovnik.demo_resilience4j.payment_processor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@RestController
@RequestMapping("/external-api")
@Slf4j
public class PaymentProcessorController {

    private final AtomicBoolean isAvailable = new AtomicBoolean(true);
    private final Random random = new Random();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public PaymentProcessorController() {
        startFailureCycle();
    }

    private void startFailureCycle() {
        // Every 20-40 seconds, trigger a "downtime window"
        long nextWindowDelay = 20 + random.nextInt(20);

        scheduler.schedule(() -> {
            isAvailable.set(false);
            int downtimeDuration = 5 + random.nextInt(6); // 5 to 10 seconds
            log.info(">>> MOCK API CRASHING for {}s <<<", downtimeDuration);

            // Schedule the recovery
            scheduler.schedule(() -> {
                isAvailable.set(true);
                log.info(">>> MOCK API RECOVERED <<<");
                startFailureCycle(); // Start the next cycle
            }, downtimeDuration, TimeUnit.SECONDS);

        }, nextWindowDelay, TimeUnit.SECONDS);
    }

    @PostMapping("/deposit")
    public ResponseEntity<String> simulateDeposit(@RequestBody String transactionId) {
        if (!isAvailable.get()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("System is currently down for maintenance.");
        }

        return ResponseEntity.ok("Success: " + transactionId);
    }
}