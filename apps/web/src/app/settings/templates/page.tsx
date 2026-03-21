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
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  getEstimateTemplates,
  createEstimateTemplate,
  updateEstimateTemplate,
  deleteEstimateTemplate,
  getInvoiceTemplates,
  createInvoiceTemplate,
  updateInvoiceTemplate,
  deleteInvoiceTemplate,
} from "@/lib/api";

export default function TemplatesPage() {
  const [estimateTemplates, setEstimateTemplates] = useState<any[]>([]);
  const [invoiceTemplates, setInvoiceTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"estimates" | "invoices">("estimates");
  
  // Estimate template dialog
  const [isEstimateDialogOpen, setIsEstimateDialogOpen] = useState(false);
  const [editingEstimateTemplate, setEditingEstimateTemplate] = useState<any>(null);
  const [estimateFormData, setEstimateFormData] = useState({
    name: "",
    title: "",
    description: "",
    amount: "",
  });
  const [savingEstimate, setSavingEstimate] = useState(false);

  // Invoice template dialog
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [editingInvoiceTemplate, setEditingInvoiceTemplate] = useState<any>(null);
  const [invoiceFormData, setInvoiceFormData] = useState({
    name: "",
    invoiceNumber: "",
    amount: "",
    dueDateDays: "",
  });
  const [savingInvoice, setSavingInvoice] = useState(false);

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTemplates() {
    try {
      const [estimates, invoices] = await Promise.all([
        getEstimateTemplates(),
        getInvoiceTemplates(),
      ]);
      setEstimateTemplates(estimates as any[]);
      setInvoiceTemplates(invoices as any[]);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  }

  // Estimate template handlers
  function openEstimateDialog(template?: any) {
    if (template) {
      setEditingEstimateTemplate(template);
      setEstimateFormData({
        name: template.name || "",
        title: template.title || "",
        description: template.description || "",
        amount: template.amount?.toString() || "",
      });
    } else {
      setEditingEstimateTemplate(null);
      setEstimateFormData({
        name: "",
        title: "",
        description: "",
        amount: "",
      });
    }
    setIsEstimateDialogOpen(true);
  }

  async function handleSaveEstimateTemplate() {
    setSavingEstimate(true);
    try {
      const data = {
        ...estimateFormData,
        amount: parseFloat(estimateFormData.amount) || 0,
        description: estimateFormData.description || null,
      };
      if (editingEstimateTemplate) {
        await updateEstimateTemplate(editingEstimateTemplate.id, data);
      } else {
        await createEstimateTemplate(data);
      }
      await loadTemplates();
      setIsEstimateDialogOpen(false);
    } catch (error) {
      console.error("Failed to save estimate template:", error);
    } finally {
      setSavingEstimate(false);
    }
  }

  async function handleDeleteEstimateTemplate(id: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteEstimateTemplate(id);
      await loadTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  }

  // Invoice template handlers
  function openInvoiceDialog(template?: any) {
    if (template) {
      setEditingInvoiceTemplate(template);
      setInvoiceFormData({
        name: template.name || "",
        invoiceNumber: template.invoiceNumber || "",
        amount: template.amount?.toString() || "",
        dueDateDays: template.dueDateDays?.toString() || "",
      });
    } else {
      setEditingInvoiceTemplate(null);
      setInvoiceFormData({
        name: "",
        invoiceNumber: "",
        amount: "",
        dueDateDays: "",
      });
    }
    setIsInvoiceDialogOpen(true);
  }

  async function handleSaveInvoiceTemplate() {
    setSavingInvoice(true);
    try {
      const data = {
        ...invoiceFormData,
        amount: parseFloat(invoiceFormData.amount) || 0,
        invoiceNumber: invoiceFormData.invoiceNumber || null,
        dueDateDays: invoiceFormData.dueDateDays ? parseInt(invoiceFormData.dueDateDays) : null,
      };
      if (editingInvoiceTemplate) {
        await updateInvoiceTemplate(editingInvoiceTemplate.id, data);
      } else {
        await createInvoiceTemplate(data);
      }
      await loadTemplates();
      setIsInvoiceDialogOpen(false);
    } catch (error) {
      console.error("Failed to save invoice template:", error);
    } finally {
      setSavingInvoice(false);
    }
  }

  async function handleDeleteInvoiceTemplate(id: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteInvoiceTemplate(id);
      await loadTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Templates</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "estimates"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("estimates")}
        >
          Estimate Templates
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "invoices"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("invoices")}
        >
          Invoice Templates
        </button>
      </div>

      {/* Estimate Templates */}
      {activeTab === "estimates" && (
        <div>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => openEstimateDialog()}>Add Estimate Template</Button>
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimateTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No estimate templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  estimateTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.title}</TableCell>
                      <TableCell>${template.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEstimateDialog(template)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEstimateTemplate(template.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Invoice Templates */}
      {activeTab === "invoices" && (
        <div>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => openInvoiceDialog()}>Add Invoice Template</Button>
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date (Days)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No invoice templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoiceTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.invoiceNumber || "-"}</TableCell>
                      <TableCell>${template.amount.toFixed(2)}</TableCell>
                      <TableCell>{template.dueDateDays || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openInvoiceDialog(template)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvoiceTemplate(template.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Estimate Template Dialog */}
      <Dialog open={isEstimateDialogOpen} onOpenChange={setIsEstimateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEstimateTemplate ? "Edit Estimate Template" : "Create Estimate Template"}
            </DialogTitle>
            <DialogDescription>
              {editingEstimateTemplate
                ? "Update template information"
                : "Create a reusable estimate template"}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 px-4 sm:px-6">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={estimateFormData.name}
                  onChange={(e) =>
                    setEstimateFormData({ ...estimateFormData, name: e.target.value })
                  }
                  placeholder="e.g., Standard Kitchen Clean"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={estimateFormData.title}
                  onChange={(e) =>
                    setEstimateFormData({ ...estimateFormData, title: e.target.value })
                  }
                  placeholder="e.g., Kitchen Cleaning Estimate"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={estimateFormData.description}
                  onChange={(e) =>
                    setEstimateFormData({ ...estimateFormData, description: e.target.value })
                  }
                  placeholder="e.g., Full kitchen deep clean"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={estimateFormData.amount}
                  onChange={(e) =>
                    setEstimateFormData({ ...estimateFormData, amount: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEstimateDialogOpen(false)}
              disabled={savingEstimate}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEstimateTemplate} disabled={savingEstimate} className="w-full sm:w-auto">
              {savingEstimate ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Template Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInvoiceTemplate ? "Edit Invoice Template" : "Create Invoice Template"}
            </DialogTitle>
            <DialogDescription>
              {editingInvoiceTemplate
                ? "Update template information"
                : "Create a reusable invoice template"}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 px-4 sm:px-6">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="invoice-name">Template Name *</Label>
                <Input
                  id="invoice-name"
                  value={invoiceFormData.name}
                  onChange={(e) =>
                    setInvoiceFormData({ ...invoiceFormData, name: e.target.value })
                  }
                  placeholder="e.g., Standard Service Invoice"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invoice-number">Invoice Number Prefix (Optional)</Label>
                <Input
                  id="invoice-number"
                  value={invoiceFormData.invoiceNumber}
                  onChange={(e) =>
                    setInvoiceFormData({ ...invoiceFormData, invoiceNumber: e.target.value })
                  }
                  placeholder="e.g., INV-"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invoice-amount">Amount *</Label>
                <Input
                  id="invoice-amount"
                  type="number"
                  step="0.01"
                  value={invoiceFormData.amount}
                  onChange={(e) =>
                    setInvoiceFormData({ ...invoiceFormData, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due-date-days">Due Date (Days from Creation)</Label>
                <Input
                  id="due-date-days"
                  type="number"
                  value={invoiceFormData.dueDateDays}
                  onChange={(e) =>
                    setInvoiceFormData({ ...invoiceFormData, dueDateDays: e.target.value })
                  }
                  placeholder="e.g., 30"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInvoiceDialogOpen(false)}
              disabled={savingInvoice}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveInvoiceTemplate} disabled={savingInvoice} className="w-full sm:w-auto">
              {savingInvoice ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

