package com.zlatkovnik.demo_resilience4j.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentStatusController {

    private final PaymentDeadLetterQueue paymentDeadLetterQueue;
    private final PaymentService paymentService;

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        HashMap<String, Object> responseData = new HashMap<>();
        responseData.put("processedDepositRequests", paymentService.getProcessedDepositRequests());
        responseData.put("unprocessedDepositRequests", paymentDeadLetterQueue.getAll());
        return responseData;
    }
}
