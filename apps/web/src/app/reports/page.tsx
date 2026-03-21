"use client";

import { useState, useEffect } from "react";
import { Card } from "@tasksuite/ui";
import { getReportsSummary, getProfitLoss, getCashFlow, getBalanceSheet } from "@/lib/api";

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<string>("summary");
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      const data = await getReportsSummary();
      setSummary(data);
    } catch (error) {
      console.error("Failed to load summary:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadReport() {
    try {
      setLoading(true);
      let data;
      if (reportType === "profit-loss") {
        data = await getProfitLoss(startDate, endDate);
      } else if (reportType === "cash-flow") {
        data = await getCashFlow(startDate, endDate);
      } else if (reportType === "balance-sheet") {
        data = await getBalanceSheet(endDate);
      }
      setReportData(data);
    } catch (error) {
      console.error("Failed to load report:", error);
      alert("Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Financial Reports</h1>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Monthly Revenue</h3>
            <p className="text-2xl font-bold">${summary.monthly?.revenue?.toFixed(2) || "0.00"}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Monthly Expenses</h3>
            <p className="text-2xl font-bold">${summary.monthly?.expenses?.toFixed(2) || "0.00"}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Monthly Net Income</h3>
            <p className={`text-2xl font-bold ${(summary.monthly?.netIncome || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${summary.monthly?.netIncome?.toFixed(2) || "0.00"}
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Cash Balance</h3>
            <p className="text-2xl font-bold">${summary.balanceSheet?.cash?.toFixed(2) || "0.00"}</p>
          </Card>
        </div>
      )}

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Generate Report</h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="summary">Summary</option>
              <option value="profit-loss">Profit & Loss</option>
              <option value="cash-flow">Cash Flow</option>
              <option value="balance-sheet">Balance Sheet</option>
            </select>
          </div>
          {reportType !== "summary" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              {reportType !== "balance-sheet" && (
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}
              <button
                onClick={loadReport}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Generate Report
              </button>
            </>
          )}
        </div>
      </Card>

      {reportData && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {reportType === "profit-loss" && "Profit & Loss Statement"}
            {reportType === "cash-flow" && "Cash Flow Statement"}
            {reportType === "balance-sheet" && "Balance Sheet"}
          </h2>
          <pre className="bg-muted p-4 rounded overflow-auto">
            {JSON.stringify(reportData, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}

