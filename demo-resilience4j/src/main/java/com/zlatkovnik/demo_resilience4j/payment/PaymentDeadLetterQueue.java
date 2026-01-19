package com.zlatkovnik.demo_resilience4j.payment;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
public class PaymentDeadLetterQueue {

    private final Queue<DepositRequest> queue = new ConcurrentLinkedQueue<>();

    public void add(DepositRequest depositRequest) {
        queue.add(depositRequest);
    }

    public DepositRequest pollOne() {
        return queue.poll();
    }

    public List<DepositRequest> getAll() {
        return queue.stream().toList();
    }

    public boolean isEmpty() {
        return queue.isEmpty();
    }
}