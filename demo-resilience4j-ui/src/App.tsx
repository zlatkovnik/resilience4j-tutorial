import React from "react";
import "./App.css";
import { TransactionCumulativeCompare } from "./TransactionCumulativeCompare";

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Transaction Dashboard</h1>
      </header>
      <main className="chart-container">
        <TransactionCumulativeCompare />
      </main>
    </div>
  );
};

export default App;
