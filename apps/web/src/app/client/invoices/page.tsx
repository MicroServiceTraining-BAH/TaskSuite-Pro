"use client";

import { useEffect, useState } from "react";
import { getClientInvoices } from "@/lib/api";
import { Card } from "@tasksuite/ui";

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getClientInvoices();
        setInvoices(data as any[]);
      } catch (error) {
        console.error("Failed to load invoices:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  const totalPending = invoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Invoices</h1>

      {totalPending > 0 && (
        <Card className="p-4 mb-6 bg-yellow-50">
          <p className="font-semibold">
            Total Outstanding: ${totalPending.toFixed(2)}
          </p>
        </Card>
      )}

      {invoices.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground">No invoices found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{invoice.invoiceNumber}</h3>
                  {invoice.job && (
                    <p className="text-muted-foreground mt-1">{invoice.job.title}</p>
                  )}
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-sm ${
                      invoice.status === "paid" ? "bg-green-100 text-green-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${invoice.amount.toFixed(2)}</p>
                  {invoice.dueDate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Due {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  {invoice.paidAt && (
                    <p className="text-sm text-green-600 mt-1">
                      Paid {new Date(invoice.paidAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

