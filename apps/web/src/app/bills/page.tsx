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
import { getBills, createBill, updateBill, markBillPaid, deleteBill, getAccounts } from "@/lib/api";
import { SearchBar } from "@/components/search-bar";

export default function BillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [allBills, setAllBills] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    try {
      const status = filter === "all" ? undefined : filter;
      const [billsData, accountsData] = await Promise.all([
        getBills(status),
        getAccounts(),
      ]);
      setAllBills(billsData as any[]);
      filterBills(billsData as any[], searchQuery);
      setAccounts(accountsData as any[]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterBills(data: any[], query: string) {
    if (!query.trim()) {
      setBills(data);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = data.filter((bill) => {
      return (
        bill.vendor?.toLowerCase().includes(lowerQuery) ||
        bill.billNumber?.toLowerCase().includes(lowerQuery) ||
        bill.description?.toLowerCase().includes(lowerQuery) ||
        bill.amount?.toString().includes(lowerQuery) ||
        bill.status?.toLowerCase().includes(lowerQuery)
      );
    });
    setBills(filtered);
  }

  useEffect(() => {
    filterBills(allBills, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  async function handleSave(data: any) {
    try {
      if (editingBill) {
        await updateBill(editingBill.id, data);
      } else {
        await createBill(data);
      }
      await loadData();
      setIsDialogOpen(false);
      setEditingBill(null);
    } catch (error) {
      console.error("Failed to save bill:", error);
      alert("Failed to save bill");
    }
  }

  async function handleMarkPaid(id: string) {
    try {
      await markBillPaid(id);
      await loadData();
    } catch (error) {
      console.error("Failed to mark bill as paid:", error);
      alert("Failed to mark bill as paid");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    try {
      await deleteBill(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete bill:", error);
      alert("Failed to delete bill");
    }
  }

  const unpaidBills = bills.filter(b => b.status === "unpaid" || b.status === "overdue");
  const totalUnpaid = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bills</h1>
          {totalUnpaid > 0 && (
            <p className="text-muted-foreground mt-1">
              Total Unpaid: <span className="font-semibold text-destructive">${totalUnpaid.toFixed(2)}</span>
            </p>
          )}
        </div>
        <Button onClick={() => { setEditingBill(null); setIsDialogOpen(true); }}>
          + Add Bill
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          All
        </Button>
        <Button variant={filter === "unpaid" ? "default" : "outline"} onClick={() => setFilter("unpaid")}>
          Unpaid
        </Button>
        <Button variant={filter === "overdue" ? "default" : "outline"} onClick={() => setFilter("overdue")}>
          Overdue
        </Button>
        <Button variant={filter === "paid" ? "default" : "outline"} onClick={() => setFilter("paid")}>
          Paid
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar
          placeholder="Search bills by vendor, bill number, description, amount, or status..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Bill Number</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No bills found
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>{bill.vendor}</TableCell>
                  <TableCell>{bill.billNumber || "-"}</TableCell>
                  <TableCell>${bill.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm ${
                      bill.status === "paid" ? "bg-green-100 text-green-800" :
                      bill.status === "overdue" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {bill.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {bill.status !== "paid" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkPaid(bill.id)}
                        className="mr-2"
                      >
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingBill(bill); setIsDialogOpen(true); }}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(bill.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isDialogOpen && (
        <BillDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          bill={editingBill}
          accounts={accounts}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function BillDialog({ open, onOpenChange, bill, accounts, onSave }: any) {
  const [formData, setFormData] = useState({
    vendor: "",
    billNumber: "",
    description: "",
    amount: "",
    accountId: "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "",
  });

  useEffect(() => {
    if (bill) {
      setFormData({
        vendor: bill.vendor || "",
        billNumber: bill.billNumber || "",
        description: bill.description || "",
        amount: bill.amount?.toString() || "",
        accountId: bill.accountId || "",
        dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: bill.notes || "",
      });
    } else {
      setFormData({
        vendor: "",
        billNumber: "",
        description: "",
        amount: "",
        accountId: "",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: "",
      });
    }
  }, [bill, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
    });
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${open ? "" : "hidden"}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{bill ? "Edit Bill" : "Add Bill"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vendor *</label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bill Number</label>
            <input
              type="text"
              value={formData.billNumber}
              onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date *</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account</label>
            <select
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select account...</option>
              {accounts.filter((a: any) => a.type === 'expense').map((account: any) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

