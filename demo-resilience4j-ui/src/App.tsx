import React from 'react';
import { TransactionCumulativeCompare } from './TransactionCumulativeCompare';

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
            <main className="max-w-6xl mx-auto space-y-8">
                {/* Visual Charts Component */}
                <TransactionCumulativeCompare />
            </main>
        </div>
    );
};

export default App;