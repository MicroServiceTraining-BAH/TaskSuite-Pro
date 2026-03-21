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
import { getAccounts, createAccount, updateAccount, deleteAccount } from "@/lib/api";
import { SearchBar } from "@/components/search-bar";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [allAccounts, setAllAccounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
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
    const filtered = data.filter((account) => {
      return (
        account.name?.toLowerCase().includes(lowerQuery) ||
        account.code?.toLowerCase().includes(lowerQuery) ||
        account.type?.toLowerCase().includes(lowerQuery) ||
        account.description?.toLowerCase().includes(lowerQuery)
      );
    });
    setAccounts(filtered);
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
    } catch (error) {
      console.error("Failed to save account:", error);
      alert("Failed to save account");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      await deleteAccount(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account");
    }
  }

  const accountTypes = ["income", "expense", "asset", "liability", "equity"];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Chart of Accounts</h1>
        <Button onClick={() => { setEditingAccount(null); setIsDialogOpen(true); }}>
          + Add Account
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          All
        </Button>
        {accountTypes.map((type) => (
          <Button
            key={type}
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No accounts found
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.code || "-"}</TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>{account.type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm ${
                      account.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
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
          onOpenChange={setIsDialogOpen}
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
      setFormData({
        name: "",
        type: "expense",
        code: "",
        description: "",
        isActive: true,
      });
    }
  }, [account, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${open ? "" : "hidden"}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{account ? "Edit Account" : "Add Account"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="asset">Asset</option>
              <option value="liability">Liability</option>
              <option value="equity">Equity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., 5000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium">Active</label>
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

