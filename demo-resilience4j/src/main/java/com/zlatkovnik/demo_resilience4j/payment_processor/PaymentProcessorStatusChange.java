package com.zlatkovnik.demo_resilience4j.payment_processor;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PaymentProcessorStatusChange {
    private int newStatus;
    private LocalDateTime timestamp;
}
