import React, { useState, useEffect } from 'react';
import ResilienceDashboard from './ResilienceDashboard';

// Types to match your backend
interface DepositRequest {
    transactionId: string;
    timestamp: number;
}

interface ApiResponse {
    processedDepositRequests: DepositRequest[];
    unprocessedDepositRequests: DepositRequest[];
}

const App: React.FC = () => {
    const [data, setData] = useState<ApiResponse>({
        processedDepositRequests: [],
        unprocessedDepositRequests: []
    });
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/payment/status');
            if (!response.ok) throw new Error('Backend unreachable');
            
            const result: ApiResponse = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError("Connection to Payment Service lost. Retrying...");
            console.error(err);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchData();

        // Setup polling interval (every 2 seconds)
        const interval = setInterval(fetchData, 2000);

        // Cleanup on unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
            <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">
                        PAYMENT<span className="text-green-500">OPS</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Resilience4j Real-time Monitoring</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm animate-pulse">
                        {error}
                    </div>
                )}
            </header>

            <main className="max-w-6xl mx-auto space-y-8">
                {/* Visual Charts Component */}
                <ResilienceDashboard data={data} />
            </main>
        </div>
    );
};

export default App;