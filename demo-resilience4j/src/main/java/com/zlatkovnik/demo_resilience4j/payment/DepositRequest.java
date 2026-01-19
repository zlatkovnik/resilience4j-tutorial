package com.zlatkovnik.demo_resilience4j.payment;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class DepositRequest {
    private String transactionId;
    private LocalDateTime timestamp;
    private LocalDateTime processedTimestamp;
}
