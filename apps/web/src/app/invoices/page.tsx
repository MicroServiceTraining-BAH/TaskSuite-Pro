"use client";

import { useState, useEffect } from "react";
import { Button, Spinner } from "@tasksuite/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tasksuite/ui";
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, markInvoicePaid } from "@/lib/api";
import { InvoiceDialog } from "@/components/invoices/invoice-dialog";
import { SearchBar } from "@/components/search-bar";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInvoices() {
    try {
      const data = await getInvoices() as any[];
      setAllInvoices(data);
      filterInvoices(data, searchQuery);
    } catch (error) {
      console.error("Failed to load invoices:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterInvoices(data: any[], query: string) {
    if (!query.trim()) {
      setInvoices(data);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = data.filter((invoice) => {
      return (
        invoice.invoiceNumber?.toLowerCase().includes(lowerQuery) ||
        invoice.client?.name?.toLowerCase().includes(lowerQuery) ||
        invoice.status?.toLowerCase().includes(lowerQuery) ||
        invoice.amount?.toString().includes(lowerQuery)
      );
    });
    setInvoices(filtered);
  }

  useEffect(() => {
    filterInvoices(allInvoices, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  async function handleCreate(data: any) {
    setSaving(true);
    try {
      await createInvoice(data);
      await loadInvoices();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create invoice:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, data: any) {
    setSaving(true);
    try {
      await updateInvoice(id, data);
      await loadInvoices();
      setIsDialogOpen(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error("Failed to update invoice:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await deleteInvoice(id);
      await loadInvoices();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
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
    return (
      <div className="container mx-auto p-6 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 rounded-lg bg-muted" />
          <div className="h-9 w-28 rounded-lg bg-muted" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="h-4 w-1/6 rounded bg-muted" />
              <div className="ml-auto h-6 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button onClick={() => {
          setEditingInvoice(null);
          setIsDialogOpen(true);
        }}>
          Add Invoice
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar
          placeholder="Search invoices by number, client, status, or amount..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Mobile: Card view, Desktop: Table view */}
      <div className="block lg:hidden space-y-4">
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No invoices found</div>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{invoice.invoiceNumber}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {invoice.client?.name || "-"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">${invoice.amount.toFixed(2)}</div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    invoice.status === "paid" ? "bg-green-100 text-green-800" :
                    invoice.status === "overdue" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
              {invoice.dueDate && (
                <div className="text-sm text-muted-foreground">
                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 min-w-[80px]"
                  onClick={() => {
                    setEditingInvoice(invoice);
                    setIsDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 min-w-[80px]"
                  onClick={() => handleDelete(invoice.id)}
                >
                  Delete
                </Button>
                {invoice.status !== "paid" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-[100px]"
                    onClick={() => handleMarkPaid(invoice.id)}
                  >
                    Mark Paid
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden lg:block rounded-lg border overflow-x-auto">
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingInvoice(invoice);
                          setIsDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
                      >
                        Delete
                      </Button>
                      {invoice.status !== "paid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkPaid(invoice.id)}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InvoiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        invoice={editingInvoice}
        onSave={(data) => {
          if (editingInvoice) {
            handleUpdate(editingInvoice.id, data);
          } else {
            handleCreate(data);
          }
        }}
        saving={saving}
      />
    </div>
  );
}

