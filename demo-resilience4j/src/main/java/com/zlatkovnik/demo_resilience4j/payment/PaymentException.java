package com.zlatkovnik.demo_resilience4j.payment;

public class PaymentException extends RuntimeException {

    public PaymentException(String message, Throwable cause) {
        super(message, cause);
    }
}
