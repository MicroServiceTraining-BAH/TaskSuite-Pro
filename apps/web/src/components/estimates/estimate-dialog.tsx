"use client";

import React, { useState, useEffect } from "react";
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
import { Button, Spinner } from "@tasksuite/ui";
import { Checkbox } from "@tasksuite/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tasksuite/ui";
import { getEstimateTemplates, getClients, getTaxRates } from "@/lib/api";
import { CleaningEstimateBuilder } from "./cleaning-estimate-builder";
import { FlooringEstimateBuilder } from "./flooring-estimate-builder";

interface EstimateDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  estimate?: any;
  onSave: (data: any) => void;
  saving?: boolean;
}

export function EstimateDialog({
  open,
  onOpenChange,
  estimate,
  onSave,
  saving = false,
}: EstimateDialogProps) {
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    amount: "",
    taxRate: "",
    status: "draft",
    estimateType: "", // "cleaning" or "flooring"
    sendEmail: false,
    sendText: false,
  });
  const [lineItems, setLineItems] = useState<Array<{
    description: string;
    quantity: string;
    unitPrice: string;
    taxRate: string;
  }>>([]);
  const [useLineItems, setUseLineItems] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [taxRates, setTaxRates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    if (open) {
      loadTemplates();
      loadClients();
      loadTaxRates();
    }
  }, [open]);

  useEffect(() => {
    if (estimate) {
      setFormData({
        clientId: estimate.clientId || "",
        title: estimate.title || "",
        description: estimate.description || "",
        amount: estimate.amount?.toString() || "",
        taxRate: estimate.taxRate?.toString() || "",
        status: estimate.status || "draft",
        estimateType: estimate.estimateType || "",
        sendEmail: false,
        sendText: false,
      });
      if (estimate.lineItems && estimate.lineItems.length > 0) {
        setLineItems(estimate.lineItems.map((item: any) => ({
          description: item.description || "",
          quantity: item.quantity?.toString() || "1",
          unitPrice: item.unitPrice?.toString() || "",
          taxRate: item.taxRate?.toString() || "",
        })));
        setUseLineItems(true);
      } else {
        setLineItems([]);
        setUseLineItems(false);
      }
      setMetadata(estimate.metadata || null);
      setSelectedTemplateId("");
    } else {
      setFormData({
        clientId: "",
        title: "",
        description: "",
        amount: "",
        taxRate: "",
        status: "draft",
        estimateType: "",
        sendEmail: false,
        sendText: false,
      });
      setLineItems([]);
      setUseLineItems(false);
      setMetadata(null);
      setSelectedTemplateId("");
    }
  }, [estimate, open]);

  async function loadTemplates() {
    try {
      const data = await getEstimateTemplates();
      setTemplates(data as any[]);
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  }

  async function loadClients() {
    try {
      const data = await getClients();
      setClients(data as any[]);
    } catch (error) {
      console.error("Failed to load clients:", error);
    }
  }

  async function loadTaxRates() {
    try {
      const data = await getTaxRates(true);
      setTaxRates(data as any[]);
    } catch (error) {
      console.error("Failed to load tax rates:", error);
    }
  }

  function addLineItem() {
    setLineItems([...lineItems, { description: "", quantity: "1", unitPrice: "", taxRate: "" }]);
  }

  function removeLineItem(index: number) {
    setLineItems(lineItems.filter((_, i) => i !== index));
  }

  function updateLineItem(index: number, field: string, value: string) {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  }

  function calculateTotal() {
    if (!useLineItems || lineItems.length === 0) {
      return parseFloat(formData.amount) || 0;
    }
    const defaultTaxRate = parseFloat(formData.taxRate) || 0;
    return lineItems.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const itemTotal = quantity * unitPrice;
      const taxRate = parseFloat(item.taxRate) || defaultTaxRate;
      const tax = itemTotal * taxRate;
      return total + itemTotal + tax;
    }, 0);
  }

  function handleTemplateChange(templateId: string) {
    if (templateId === "none") {
      setSelectedTemplateId("");
      return;
    }
    setSelectedTemplateId(templateId);
    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setFormData({
          ...formData,
          title: template.title,
          description: template.description || "",
          amount: template.amount?.toString() || "",
        });
      }
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formData.estimateType) {
      alert("Please select a service type");
      return;
    }

    const submitData: any = {
      ...formData,
      taxRate: parseFloat(formData.taxRate) || 0,
    };

    if (useLineItems && lineItems.length > 0) {
      submitData.lineItems = lineItems.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity) || 1,
        unitPrice: parseFloat(item.unitPrice) || 0,
        taxRate: parseFloat(item.taxRate) || parseFloat(formData.taxRate) || 0,
      }));
      submitData.amount = calculateTotal();
    } else {
      submitData.amount = parseFloat(formData.amount) || 0;
    }

    // Include metadata if available
    if (metadata) {
      submitData.metadata = metadata;
    }

    onSave(submitData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{estimate ? "Edit Estimate" : "Create Estimate"}</DialogTitle>
          <DialogDescription>
            {estimate ? "Update estimate information" : "Create a new estimate from a template or from scratch"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 px-4 sm:px-6">
            <div className="grid gap-6 py-6">
            {!estimate && templates.length > 0 && (
              <div className="grid gap-3">
                <Label htmlFor="template" className="text-base">Template (Optional)</Label>
                <Select value={selectedTemplateId || undefined} onValueChange={handleTemplateChange}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None - Create from scratch</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-3">
              <Label htmlFor="clientId" className="text-base font-medium">Client *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="title" className="text-base font-medium">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, title: event.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="estimateType" className="text-base font-medium">Service Type *</Label>
              <Select
                value={formData.estimateType}
                onValueChange={(value) => {
                  setFormData({ ...formData, estimateType: value });
                  setUseLineItems(false);
                  setLineItems([]);
                  setMetadata(null);
                }}
              >
                <SelectTrigger id="estimateType">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Cleaning Service</SelectItem>
                  <SelectItem value="flooring">Flooring Installation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description" className="text-base font-medium">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, description: event.target.value })
                }
              />
            </div>

            {formData.estimateType === "cleaning" && (
              <CleaningEstimateBuilder
                onUpdate={(data) => {
                  setFormData({ ...formData, amount: data.amount.toString() });
                  setLineItems(data.lineItems.map((item: any) => ({
                    description: item.description,
                    quantity: item.quantity.toString(),
                    unitPrice: item.unitPrice.toString(),
                    taxRate: "",
                  })));
                  setUseLineItems(true);
                  setMetadata(data.metadata || null);
                }}
                initialData={estimate?.estimateType === "cleaning" && estimate?.metadata ? estimate.metadata : undefined}
              />
            )}

            {formData.estimateType === "flooring" && (
              <FlooringEstimateBuilder
                onUpdate={(data) => {
                  setFormData({ ...formData, amount: data.amount.toString() });
                  setLineItems(data.lineItems.map((item: any) => ({
                    description: item.description,
                    quantity: item.quantity.toString(),
                    unitPrice: item.unitPrice.toString(),
                    taxRate: "",
                  })));
                  setUseLineItems(true);
                  setMetadata(data.metadata || null);
                }}
                initialData={estimate?.estimateType === "flooring" && estimate?.metadata ? estimate.metadata : undefined}
              />
            )}

            {!formData.estimateType && (
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="useLineItems"
                    checked={useLineItems}
                    onChange={(e) => setUseLineItems(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="useLineItems">Use line items</Label>
                </div>
              </div>
            )}

            {useLineItems ? (
              <div className="grid gap-6 border rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    + Add Item
                  </Button>
                </div>
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="col-span-1 sm:col-span-4">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                        placeholder="Item description"
                        required
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Tax Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(e) => updateLineItem(index, "taxRate", e.target.value)}
                        placeholder="0.08"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="w-full sm:w-auto"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {lineItems.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No line items. Click "Add Item" to add one.
                  </p>
                )}
                <div className="border-t pt-4 mt-2">
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="amount" className="text-base font-medium">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, amount: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="taxRate" className="text-base font-medium">Tax Rate (optional)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, taxRate: event.target.value })
                    }
                    placeholder="0.08 for 8%"
                  />
                </div>
              </>
            )}
            <div className="grid gap-3">
              <Label htmlFor="status" className="text-base font-medium">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!estimate && (
              <div className="grid gap-4 pt-2 border-t">
                <Label className="text-base font-medium">Notifications</Label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendEmail"
                      checked={formData.sendEmail}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        setFormData({ ...formData, sendEmail: checked === true })
                      }
                    />
                    <Label htmlFor="sendEmail" className="text-sm font-normal cursor-pointer">
                      Send email notification
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendText"
                      checked={formData.sendText}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        setFormData({ ...formData, sendText: checked === true })
                      }
                    />
                    <Label htmlFor="sendText" className="text-sm font-normal cursor-pointer">
                      Send text message notification
                    </Label>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

