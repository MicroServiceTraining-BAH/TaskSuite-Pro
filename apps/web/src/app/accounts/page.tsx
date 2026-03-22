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
import { getAccounts, createAccount, updateAccount, deleteAccount } from "@/lib/api";
import { SearchBar } from "@/components/search-bar";

const ACCOUNT_TYPES = ["income", "expense", "asset", "liability", "equity"] as const;

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [allAccounts, setAllAccounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    try {
      const type = filter === "all" ? undefined : filter;
      const data = await getAccounts(type);
      setAllAccounts(data as any[]);
      filterAccounts(data as any[], searchQuery);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterAccounts(data: any[], query: string) {
    if (!query.trim()) {
      setAccounts(data);
      return;
    }
    const lowerQuery = query.toLowerCase();
    setAccounts(data.filter((account) =>
      account.name?.toLowerCase().includes(lowerQuery) ||
      account.code?.toLowerCase().includes(lowerQuery) ||
      account.type?.toLowerCase().includes(lowerQuery) ||
      account.description?.toLowerCase().includes(lowerQuery)
    ));
  }

  useEffect(() => {
    filterAccounts(allAccounts, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  async function handleSave(data: any) {
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, data);
      } else {
        await createAccount(data);
      }
      await loadData();
      setIsDialogOpen(false);
      setEditingAccount(null);
    } catch (error: any) {
      alert(error.message || "Failed to save account");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this account? Expenses linked to it will become uncategorized.")) return;
    try {
      await deleteAccount(id);
      await loadData();
    } catch (error) {
      alert("Failed to delete account");
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold">Chart of Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage accounts used to categorize income, expenses, assets, liabilities, and equity.
          </p>
        </div>
        <Button onClick={() => { setEditingAccount(null); setIsDialogOpen(true); }}>
          + Add Account
        </Button>
      </div>

      <div className="mt-4 mb-4 flex flex-wrap gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          All
        </Button>
        {ACCOUNT_TYPES.map((type) => (
          <Button
            key={type}
            size="sm"
            variant={filter === type ? "default" : "outline"}
            onClick={() => setFilter(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      <div className="mb-4">
        <SearchBar
          placeholder="Search accounts by name, code, type, or description..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No accounts found. Click "Add Account" to create your first one.
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono text-sm">{account.code || "-"}</TableCell>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <span className="capitalize">{account.type}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{account.description || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      account.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {account.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingAccount(account); setIsDialogOpen(true); }}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(account.id)}
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
        <AccountDialog
          open={isDialogOpen}
          onOpenChange={(open: boolean) => { setIsDialogOpen(open); if (!open) setEditingAccount(null); }}
          account={editingAccount}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function AccountDialog({ open, onOpenChange, account, onSave }: any) {
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    code: "",
    description: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || "",
        type: account.type || "expense",
        code: account.code || "",
        description: account.description || "",
        isActive: account.isActive !== undefined ? account.isActive : true,
      });
    } else {
      setFormData({ name: "", type: "expense", code: "", description: "", isActive: true });
    }
    setErrors({});
  }, [account, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? "Edit Account" : "Add Account"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="acc-name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="acc-name"
              value={formData.name}
              onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: "" }); }}
              placeholder="e.g. Office Supplies"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="acc-type">Type <span className="text-destructive">*</span></Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger id="acc-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="acc-code">Account Code</Label>
            <Input
              id="acc-code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. 5000"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="acc-desc">Description</Label>
            <Input
              id="acc-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="acc-active"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="acc-active" className="font-normal cursor-pointer">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : account ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
