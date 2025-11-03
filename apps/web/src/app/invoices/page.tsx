"use client";

import { useState, useEffect } from "react";
import { Button } from "@tasksuite/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tasksuite/ui";
import { getInvoices, markInvoicePaid } from "@/lib/api";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      const data = await getInvoices() as any[];
      setInvoices(data);
    } catch (error) {
      console.error("Failed to load invoices:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkPaid(id: string) {
    try {
      await markInvoicePaid(id);
      await loadInvoices();
    } catch (error) {
      console.error("Failed to mark invoice as paid:", error);
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Invoices</h1>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.client?.name || "-"}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.status !== "paid" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkPaid(invoice.id)}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

