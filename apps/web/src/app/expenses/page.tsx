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
import { getExpenses, createExpense, updateExpense, deleteExpense, getAccounts } from "@/lib/api";
import { SearchBar } from "@/components/search-bar";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [expensesData, accountsData] = await Promise.all([
        getExpenses(),
        getAccounts(),
      ]);
      setAllExpenses(expensesData as any[]);
      filterExpenses(expensesData as any[], searchQuery);
      setAccounts(accountsData as any[]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterExpenses(data: any[], query: string) {
    if (!query.trim()) {
      setExpenses(data);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = data.filter((expense) => {
      return (
        expense.description?.toLowerCase().includes(lowerQuery) ||
        expense.vendor?.toLowerCase().includes(lowerQuery) ||
        expense.amount?.toString().includes(lowerQuery) ||
        expense.paymentMethod?.toLowerCase().includes(lowerQuery)
      );
    });
    setExpenses(filtered);
  }

  useEffect(() => {
    filterExpenses(allExpenses, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  async function handleSave(data: any) {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, data);
      } else {
        await createExpense(data);
      }
      await loadData();
      setIsDialogOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error("Failed to save expense:", error);
      alert("Failed to save expense");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await deleteExpense(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete expense:", error);
      alert("Failed to delete expense");
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Button onClick={() => { setEditingExpense(null); setIsDialogOpen(true); }}>
          + Add Expense
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar
          placeholder="Search expenses by description, vendor, amount, or payment method..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.vendor || "-"}</TableCell>
                  <TableCell>{expense.account?.name || "Uncategorized"}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{expense.paymentMethod || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingExpense(expense); setIsDialogOpen(true); }}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
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
        <ExpenseDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          expense={editingExpense}
          accounts={accounts}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ExpenseDialog({ open, onOpenChange, expense, accounts, onSave }: any) {
  const [formData, setFormData] = useState({
    description: "",
    vendor: "",
    amount: "",
    accountId: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "",
    notes: "",
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || "",
        vendor: expense.vendor || "",
        amount: expense.amount?.toString() || "",
        accountId: expense.accountId || "",
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: expense.paymentMethod || "",
        notes: expense.notes || "",
      });
    } else {
      setFormData({
        description: "",
        vendor: "",
        amount: "",
        accountId: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: "",
        notes: "",
      });
    }
  }, [expense, open]);

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
        <h2 className="text-xl font-bold mb-4">{expense ? "Edit Expense" : "Add Expense"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
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
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select method...</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
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

