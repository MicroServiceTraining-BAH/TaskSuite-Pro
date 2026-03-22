"use client";

import { useState, useEffect } from "react";
import { Button } from "@tasksuite/ui";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tasksuite/ui";
import { Input } from "@tasksuite/ui";
import { Label } from "@tasksuite/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tasksuite/ui";
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
import Link from "next/link";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    setExpenses(data.filter((expense) =>
      expense.description?.toLowerCase().includes(lowerQuery) ||
      expense.vendor?.toLowerCase().includes(lowerQuery) ||
      expense.amount?.toString().includes(lowerQuery) ||
      expense.paymentMethod?.toLowerCase().includes(lowerQuery)
    ));
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
    } catch (error: any) {
      alert(error.message || "Failed to save expense");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await deleteExpense(id);
      await loadData();
    } catch (error) {
      alert("Failed to delete expense");
    }
  }

  const expenseAccounts = accounts.filter((a) => a.type === "expense");

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Button onClick={() => { setEditingExpense(null); setIsDialogOpen(true); }}>
          + Add Expense
        </Button>
      </div>

      {accounts.length === 0 && !loading && (
        <div className="mb-4 p-4 border border-amber-200 bg-amber-50 rounded-lg text-sm text-amber-800">
          <strong>No accounts found.</strong> You can still log expenses, but for proper categorization{" "}
          <Link href="/accounts" className="underline font-medium hover:text-amber-900">
            create expense accounts
          </Link>{" "}
          first.
        </div>
      )}

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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.vendor || "-"}</TableCell>
                  <TableCell>
                    <span className={expense.account ? "" : "text-muted-foreground text-sm"}>
                      {expense.account?.name || "Uncategorized"}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {expense.paymentMethod
                      ? expense.paymentMethod.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
                      : "-"}
                  </TableCell>
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
          onOpenChange={(open: boolean) => { setIsDialogOpen(open); if (!open) setEditingExpense(null); }}
          expense={editingExpense}
          accounts={expenseAccounts}
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
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || "",
        vendor: expense.vendor || "",
        amount: expense.amount?.toString() || "",
        accountId: expense.accountId || "",
        date: expense.date
          ? new Date(expense.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        paymentMethod: expense.paymentMethod || "",
        notes: expense.notes || "",
      });
    } else {
      setFormData({
        description: "",
        vendor: "",
        amount: "",
        accountId: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "",
        notes: "",
      });
    }
    setErrors({});
  }, [expense, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!formData.description.trim()) errs.description = "Description is required";
    if (!formData.amount) errs.amount = "Amount is required";
    else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0) errs.amount = "Enter a valid amount";
    if (!formData.date) errs.date = "Date is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      await onSave({
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        accountId: formData.accountId || undefined,
        paymentMethod: formData.paymentMethod || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: "" }); }}
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input
              id="vendor"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              placeholder="e.g. Office Depot"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount <span className="text-destructive">*</span></Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => { setFormData({ ...formData, amount: e.target.value }); if (errors.amount) setErrors({ ...errors, amount: "" }); }}
              aria-invalid={!!errors.amount}
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="accountId">Account</Label>
              {accounts.length === 0 && (
                <a href="/accounts" className="text-xs text-primary hover:underline">
                  + Create accounts
                </a>
              )}
            </div>
            <Select
              value={formData.accountId || "none"}
              onValueChange={(value) => setFormData({ ...formData, accountId: value === "none" ? "" : value })}
            >
              <SelectTrigger id="accountId">
                <SelectValue placeholder="Select account..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorized</SelectItem>
                {accounts.map((account: any) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code ? `${account.code} - ` : ""}{account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => { setFormData({ ...formData, date: e.target.value }); if (errors.date) setErrors({ ...errors, date: "" }); }}
              aria-invalid={!!errors.date}
            />
            {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod || "none"}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value === "none" ? "" : value })}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select method..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not specified</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
