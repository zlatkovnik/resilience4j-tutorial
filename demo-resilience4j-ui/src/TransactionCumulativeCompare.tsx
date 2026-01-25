import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceArea,
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
  safeProcessedWithAndWithoutDelay: number;
  safeProcessedWithDelay: number;
  unsafeProcessed: number;
  safeUnprocessed: number;
  unsafeUnprocessed: number;
  safeHandledWithDelay: number;
};

type ServerStatusChange = {
  newStatus: 0 | 1;
  timestamp: string;
};

type ServerDowntime = {
  from: number;
  to: number;
};



const fetchTransactions = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url);
  return res.json();
};

const fetchServerStatusChanges = async (url: string): Promise<ServerStatusChange[]> => {
  const res = await fetch(url);
  return res.json();
};

export const TransactionCumulativeCompare: React.FC = () => {
  const [data, setData] = useState<CumulativeDataPoint[]>([]);
  const [downtime, setDowntime] = useState<ServerDowntime[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [safeRes, unsafeRes, serverStatusChangesRes] = await Promise.all([
        fetchTransactions("http://localhost:8080/api/payment/status"),
        fetchTransactions("http://localhost:8080/api/payment/status/unsafe"),
        fetchServerStatusChanges("http://localhost:8080/external-api/downtime"),
      ]);

      const downtimes: ServerDowntime[] = [];
      for (let i = 0; i < serverStatusChangesRes.length; i++) {
        const change = serverStatusChangesRes[i];
        const nextChange = serverStatusChangesRes[i + 1];
        if (change && change.newStatus === 0 && nextChange && nextChange.newStatus === 1) {
          const downtime = { from: new Date(change.timestamp).getTime(), to: new Date(nextChange.timestamp).getTime() };
          downtimes.push(downtime);
        } else if (change && change.newStatus === 0 && !nextChange) {
          const downtime = { from: new Date(change.timestamp).getTime(), to: Date.now() };
          downtimes.push(downtime);
        }
      }
      setDowntime(downtimes);

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

      let safeProcessedWithDelay = 0;
      let unsafeProcessed = 0;
      let safeUnprocessed = 0;
      let unsafeUnprocessed = 0;
      let safeHandledWithDelay = 0;
      let safeProcessedWithAndWithoutDelay = 0;

      const cumulative: CumulativeDataPoint[] = [];

      for (const tx of sorted) {
        const delay =
          tx.processedTimestamp != null ? tx.processedTimestamp - tx.timestamp : null;

        if (tx.type === "safe") {
          if (tx.processedTimestamp) {
            if (delay! > 1000) safeHandledWithDelay++;
            else safeProcessedWithDelay++;
          } else {
            safeUnprocessed++;
          }
        } else {
          if (tx.processedTimestamp) {
            unsafeProcessed++;
          } else {
            unsafeUnprocessed++;
          }
        }

        safeProcessedWithAndWithoutDelay = safeProcessedWithDelay + safeHandledWithDelay;

        cumulative.push({
          time: tx.timestamp,
          safeProcessedWithAndWithoutDelay,
          safeProcessedWithDelay,
          unsafeProcessed,
          safeUnprocessed,
          unsafeUnprocessed,
          safeHandledWithDelay,
        });
      }

      setData(cumulative);
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px" }}>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={data}>
          <CartesianGrid stroke="#444" strokeDasharray="3 3" />
          {/* <ReferenceArea
            x1={Date.now() - 60_000}
            x2={Date.now() - 30_000}
            fill="rgba(255,0,0,0.35)"
          /> */}
          {downtime.map((d, i) =>
            d.to ? (
              <ReferenceArea
                key={i}
                x1={d.from}
                x2={d.to}
                fill="rgba(255,0,0,0.35)"
              />
            ) : null
          )}
          <XAxis
            dataKey="time"
            type="number"
            domain={["auto", "auto"]}
            tick={{ fill: "#ccc" }}
            tickFormatter={(t) => new Date(t).toLocaleTimeString()}
          />
          <YAxis
            tick={{ fill: "#ccc" }}
            label={{ value: "Cumulative count", angle: -90, position: "insideLeft", fill: "#ccc" }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#333", border: "1px solid #555", color: "#fff" }}
            formatter={(value?: string, name?: string) => [value, name]}
            labelFormatter={(label) => new Date(label).toLocaleTimeString()}
          />

          {/* Lines with your colors */}
          <Line
            type="monotone"
            dataKey="safeProcessedWithAndWithoutDelay"
            stroke="#0496C7"
            name="Safe processed"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="safeProcessedWithDelay"
            stroke="#32CD32"
            name="Safe processed"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="unsafeProcessed"
            stroke="#006400"
            name="Unsafe processed"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="safeUnprocessed"
            stroke="#FF6B6B"
            name="Safe unprocessed"
            dot={false}
            strokeDasharray="5 2"
          />
          <Line
            type="monotone"
            dataKey="unsafeUnprocessed"
            stroke="#8B0000"
            name="Unsafe unprocessed"
            dot={false}
            strokeDasharray="5 2"
          />
          <Line
            type="monotone"
            dataKey="safeHandledWithDelay"
            stroke="#FFA500"
            name="Safe handled with delay"
            dot={false}
            strokeDasharray="3 3"
          />


        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
