import React, { useMemo } from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector
} from 'recharts';

// Types matching your Java Backend
interface DepositRequest {
    transactionId: string;
    timestamp: number;
}

interface ApiResponse {
    processedDepositRequests: DepositRequest[];
    unprocessedDepositRequests: DepositRequest[];
}

const COLORS = ['#22c55e', '#f59e0b']; // Success Green, DLQ Amber

const ResilienceDashboard: React.FC<{ data: ApiResponse }> = ({ data }) => {
    
    // 1. Transform data for the Time-Series Chart (10s buckets)
    const timeData = useMemo(() => {
        const bucketSize = 10000;
        const timeline: Record<number, { time: string; success: number; dlq: number }> = {};

        const process = (items: DepositRequest[], type: 'success' | 'dlq') => {
            items.forEach(item => {
                const bucket = Math.floor(item.timestamp / bucketSize) * bucketSize;
                if (!timeline[bucket]) {
                    timeline[bucket] = { 
                        time: new Date(bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
                        success: 0, dlq: 0 
                    };
                }
                timeline[bucket][type]++;
            });
        };

        process(data.processedDepositRequests, 'success');
        process(data.unprocessedDepositRequests, 'dlq');

        return Object.values(timeline).sort((a, b) => a.time.localeCompare(b.time)).slice(-15); // Show last 15 intervals
    }, [data]);

    // 2. Transform data for the Pie Chart
    const pieData = useMemo(() => [
        { name: 'Processed', value: data.processedDepositRequests.length },
        { name: 'In DLQ', value: data.unprocessedDepositRequests.length },
    ], [data]);

    return (
        <div className="p-6 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight">Payment System Monitor</h2>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-mono border border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 h-80 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-xs font-semibold mb-4 uppercase tracking-wider">Throughput vs. Backlog</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={timeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Bar dataKey="success" name="Successful" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="dlq" name="DLQ Size" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Distribution Pie Chart */}
                <div className="h-80 bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
                    <p className="text-slate-400 text-xs font-semibold mb-4 uppercase tracking-wider w-full text-left">Overall Ratio</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%" cy="45%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">{data.processedDepositRequests.length + data.unprocessedDepositRequests.length}</p>
                        <p className="text-slate-400 text-xs uppercase">Total Attempts</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResilienceDashboard;