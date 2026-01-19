export interface DepositRequest {
    transactionId: string;
    timestamp: number;
    amount?: number; // Optional metadata
}

export type PaymentStatus = 'SUCCESS' | 'PENDING_DLQ';

export interface TimelineEvent extends DepositRequest {
    status: PaymentStatus;
}

export interface ApiResponse {
    processedDepositRequests: DepositRequest[];
    unprocessedDepositRequests: DepositRequest[];
}