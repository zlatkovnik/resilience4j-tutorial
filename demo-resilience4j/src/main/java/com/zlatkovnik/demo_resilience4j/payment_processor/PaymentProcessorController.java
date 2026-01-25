package com.zlatkovnik.demo_resilience4j.payment_processor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
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
    private final List<PaymentProcessorStatusChange> statusChanges = Collections.synchronizedList(new ArrayList<>());

    public PaymentProcessorController() {
        startFailureCycle();
    }

    private void startFailureCycle() {
        // 30 to 50 seconds
        long nextWindowDelay = 30 + random.nextInt(21);

        scheduler.schedule(() -> {
            isAvailable.set(false);
            int downtimeDuration = 10 + random.nextInt(11); // 10 to 20 seconds
            log.info(">>> MOCK API CRASHING for {}s <<<", downtimeDuration);
            statusChanges.add(new PaymentProcessorStatusChange(0, LocalDateTime.now()));

            // Schedule the recovery
            scheduler.schedule(() -> {
                isAvailable.set(true);
                log.info(">>> MOCK API RECOVERED <<<");
                statusChanges.add(new PaymentProcessorStatusChange(1, LocalDateTime.now()));
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

    @GetMapping("/downtime")
    public ResponseEntity<List<PaymentProcessorStatusChange>> getDowntime() {
        return ResponseEntity.ok(statusChanges);
    }
}