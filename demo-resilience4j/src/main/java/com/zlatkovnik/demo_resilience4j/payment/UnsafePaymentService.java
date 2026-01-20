package com.zlatkovnik.demo_resilience4j.payment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UnsafePaymentService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String API_URL = "http://localhost:8080/external-api/deposit";
    private final List<DepositRequest> failedDepositRequests = Collections.synchronizedList(new ArrayList<>());
    private final List<DepositRequest> processedDepositRequests = Collections.synchronizedList(new ArrayList<>());

    public void deposit(DepositRequest depositRequest) {
        try {
            restTemplate.postForEntity(API_URL, depositRequest, String.class);
        } catch (Exception e) {
            failedDepositRequests.add(depositRequest);
            return;
        }
        depositRequest.setProcessedTimestamp(LocalDateTime.now());
        processedDepositRequests.add(depositRequest);
        log.info("Transaction {} successful", depositRequest.getTransactionId());
    }


    public List<DepositRequest> getProcessedDepositRequests() {
        return processedDepositRequests.stream().toList();
    }

    public List<DepositRequest> getFailedDepositRequests() {
        return failedDepositRequests.stream().toList();
    }
}