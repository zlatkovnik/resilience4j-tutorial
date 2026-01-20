import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Transaction = {
  transactionId: string;
  timestamp: string;
  processedTimestamp: string | null;
};

type ApiResponse = {
  processedDepositRequests: Transaction[];
  unprocessedDepositRequests: Transaction[];
};

type CumulativeDataPoint = {
  time: number;
  safePassed: number;
  safeFailedHandled: number;
  safeFailedNotHandled: number;
  unsafePassed: number;
  unsafeFailedHandled: number;
  unsafeFailedNotHandled: number;
};

const fetchTransactions = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url);
  return res.json();
};

export const TransactionCumulativeCompare: React.FC = () => {
  const [data, setData] = useState<CumulativeDataPoint[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [safeRes, unsafeRes] = await Promise.all([
        fetchTransactions("http://localhost:8080/api/payment/status"),
        fetchTransactions("http://localhost:8080/api/payment/status/unsafe"),
      ]);

      const processTransactions = (
        txs: Transaction[],
        type: "safe" | "unsafe"
      ) =>
        txs.map((tx) => ({
          transactionId: tx.transactionId,
          timestamp: new Date(tx.timestamp).getTime(),
          processedTimestamp: tx.processedTimestamp
            ? new Date(tx.processedTimestamp).getTime()
            : null,
          type,
        }));

      const allTxs = [
        ...processTransactions(safeRes.processedDepositRequests, "safe"),
        ...processTransactions(safeRes.unprocessedDepositRequests, "safe"),
        ...processTransactions(unsafeRes.processedDepositRequests, "unsafe"),
        ...processTransactions(unsafeRes.unprocessedDepositRequests, "unsafe"),
      ];

      const sorted = allTxs.sort((a, b) => a.timestamp - b.timestamp);

      let safePassed = 0,
        safeFailedHandled = 0,
        safeFailedNotHandled = 0;
      let unsafePassed = 0,
        unsafeFailedHandled = 0,
        unsafeFailedNotHandled = 0;

      const cumulative: CumulativeDataPoint[] = [];

      for (const tx of sorted) {
        const delay =
          tx.processedTimestamp != null ? tx.processedTimestamp - tx.timestamp : null;

        if (tx.type === "safe") {
          if (tx.processedTimestamp) {
            if (delay! > 1000) safeFailedHandled++;
            else safePassed++;
          } else {
            safeFailedNotHandled++;
          }
        } else {
          if (tx.processedTimestamp) {
            if (delay! > 1000) unsafeFailedHandled++;
            else unsafePassed++;
          } else {
            unsafeFailedNotHandled++;
          }
        }

        cumulative.push({
          time: tx.timestamp,
          safePassed,
          safeFailedHandled,
          safeFailedNotHandled,
          unsafePassed,
          unsafeFailedHandled,
          unsafeFailedNotHandled,
        });
      }

      setData(cumulative);
    };

    // Initial load
    loadData();

    // Set interval to reload every 5 seconds
    const interval = setInterval(loadData, 5000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          type="number"
          domain={["auto", "auto"]}
          tickFormatter={(t) => new Date(t).toLocaleTimeString()}
        />
        <YAxis
          label={{ value: "Cumulative count", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          formatter={(value: any, name: string) => [value, name]}
          labelFormatter={(label) => new Date(label).toLocaleTimeString()}
        />

        {/* SAFE */}
        <Line type="monotone" dataKey="safePassed" stroke="green" name="Safe Passed" dot={false} />
        <Line
          type="monotone"
          dataKey="safeFailedHandled"
          stroke="orange"
          name="Safe Failed → handled"
          dot={false}
          strokeDasharray="5 5"
        />
        <Line
          type="monotone"
          dataKey="safeFailedNotHandled"
          stroke="red"
          name="Safe Failed → not handled"
          dot={false}
          strokeDasharray="2 2"
        />

        {/* UNSAFE */}
        <Line
          type="monotone"
          dataKey="unsafePassed"
          stroke="#008000"
          name="Unsafe Passed"
          dot={false}
          strokeDasharray="5 2"
        />
        <Line
          type="monotone"
          dataKey="unsafeFailedHandled"
          stroke="#FFA500"
          name="Unsafe Failed → handled"
          dot={false}
          strokeDasharray="5 5"
        />
        <Line
          type="monotone"
          dataKey="unsafeFailedNotHandled"
          stroke="#FF0000"
          name="Unsafe Failed → not handled"
          dot={false}
          strokeDasharray="2 2"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
