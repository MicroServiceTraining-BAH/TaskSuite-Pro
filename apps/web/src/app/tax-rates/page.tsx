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
import { getTaxRates, createTaxRate, updateTaxRate, deleteTaxRate } from "@/lib/api";

export default function TaxRatesPage() {
  const [taxRates, setTaxRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getTaxRates();
      setTaxRates(data as any[]);
    } catch (error) {
      console.error("Failed to load tax rates:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data: any) {
    try {
      if (editingRate) {
        await updateTaxRate(editingRate.id, data);
      } else {
        await createTaxRate(data);
      }
      await loadData();
      setIsDialogOpen(false);
      setEditingRate(null);
    } catch (error) {
      console.error("Failed to save tax rate:", error);
      alert("Failed to save tax rate");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this tax rate?")) return;
    try {
      await deleteTaxRate(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete tax rate:", error);
      alert("Failed to delete tax rate");
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tax Rates</h1>
        <Button onClick={() => { setEditingRate(null); setIsDialogOpen(true); }}>
          + Add Tax Rate
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taxRates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No tax rates found
                </TableCell>
              </TableRow>
            ) : (
              taxRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>{rate.name}</TableCell>
                  <TableCell>{(rate.rate * 100).toFixed(2)}%</TableCell>
                  <TableCell>{rate.isDefault ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm ${
                      rate.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {rate.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingRate(rate); setIsDialogOpen(true); }}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(rate.id)}
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
        <TaxRateDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          rate={editingRate}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TaxRateDialog({ open, onOpenChange, rate, onSave }: any) {
  const [formData, setFormData] = useState({
    name: "",
    rate: "",
    description: "",
    isDefault: false,
    isActive: true,
  });

  useEffect(() => {
    if (rate) {
      setFormData({
        name: rate.name || "",
        rate: rate.rate ? (rate.rate * 100).toString() : "",
        description: rate.description || "",
        isDefault: rate.isDefault || false,
        isActive: rate.isActive !== undefined ? rate.isActive : true,
      });
    } else {
      setFormData({
        name: "",
        rate: "",
        description: "",
        isDefault: false,
        isActive: true,
      });
    }
  }, [rate, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...formData,
      rate: parseFloat(formData.rate) / 100, // Convert percentage to decimal
    });
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${open ? "" : "hidden"}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{rate ? "Edit Tax Rate" : "Add Tax Rate"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Sales Tax, GST, VAT"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rate (%) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="8.00"
              required
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
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isDefault" className="text-sm font-medium">Set as default</label>
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

