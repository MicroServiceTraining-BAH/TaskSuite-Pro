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
import { getEstimateTemplates, getClients, getTaxRates, getServiceTypes } from "@/lib/api";
import { ServiceTypeEstimateBuilder } from "./service-type-estimate-builder";

interface EstimateDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  estimate?: any;
  onSave: (data: any) => void;
  saving?: boolean;
  error?: string | null;
}

export function EstimateDialog({
  open,
  onOpenChange,
  estimate,
  onSave,
  saving = false,
  error,
}: EstimateDialogProps) {
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    amount: "",
    taxRate: "",
    status: "draft",
    serviceTypeId: "",
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
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadTemplates();
      loadClients();
      loadServiceTypes();
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
        serviceTypeId: estimate.serviceTypeId || "",
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
      setSelectedTemplateId("");
    } else {
      setFormData({
        clientId: "",
        title: "",
        description: "",
        amount: "",
        taxRate: "",
        status: "draft",
        serviceTypeId: "",
        sendEmail: false,
        sendText: false,
      });
      setLineItems([]);
      setUseLineItems(false);
      setSelectedTemplateId("");
    }
    setErrors({});
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

  async function loadServiceTypes() {
    try {
      const data = await getServiceTypes();
      setServiceTypes((data as any[]).filter((st: any) => st.isActive));
    } catch (error) {
      console.error("Failed to load service types:", error);
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

  const selectedServiceType = serviceTypes.find((st) => st.id === formData.serviceTypeId);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errs: Record<string, string> = {};
    if (!formData.clientId) errs.clientId = "Please select a client";
    if (!formData.title.trim()) errs.title = "Title is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const submitData: any = {
      ...formData,
      taxRate: parseFloat(formData.taxRate) || 0,
      // Keep serviceTypeId or remove if empty
      serviceTypeId: formData.serviceTypeId || undefined,
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

    onSave(submitData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{estimate ? "Edit Estimate" : "Create Estimate"}</DialogTitle>
          <DialogDescription>
            {estimate ? "Update estimate information" : "Create a new estimate"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 px-4 sm:px-6">
            <div className="grid gap-6 py-6">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">
                {error}
              </div>
            )}

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
              <Label htmlFor="clientId" className="text-base font-medium">
                Client <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => {
                  setFormData({ ...formData, clientId: value });
                  if (errors.clientId) setErrors({ ...errors, clientId: "" });
                }}
              >
                <SelectTrigger id="clientId" aria-invalid={!!errors.clientId}>
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
              {errors.clientId && <p className="text-sm text-destructive">{errors.clientId}</p>}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="title" className="text-base font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, title: event.target.value });
                  if (errors.title) setErrors({ ...errors, title: "" });
                }}
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Service Type — dynamic from company */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="serviceTypeId" className="text-base font-medium">Service Type</Label>
                {serviceTypes.length === 0 && (
                  <a href="/settings/service-types" className="text-xs text-primary hover:underline">
                    + Create service types
                  </a>
                )}
              </div>
              <Select
                value={formData.serviceTypeId || "none"}
                onValueChange={(value) => {
                  const stId = value === "none" ? "" : value;
                  setFormData({ ...formData, serviceTypeId: stId });
                  // Reset line items when service type changes
                  setLineItems([]);
                  setUseLineItems(false);
                }}
              >
                <SelectTrigger id="serviceTypeId">
                  <SelectValue placeholder="Select service type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (manual pricing)</SelectItem>
                  {serviceTypes.map((st) => (
                    <SelectItem key={st.id} value={st.id}>
                      {st.name}
                    </SelectItem>
                  ))}
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

            {/* If service type selected and has pricing items, show the builder */}
            {selectedServiceType && (selectedServiceType.pricingItems || []).length > 0 && (
              <div className="grid gap-3">
                <Label className="text-base font-medium">
                  Select Items — {selectedServiceType.name}
                </Label>
                <ServiceTypeEstimateBuilder
                  pricingItems={selectedServiceType.pricingItems || []}
                  onUpdate={(data) => {
                    setFormData({ ...formData, amount: data.amount.toString() });
                    setLineItems(data.lineItems.map((item: any) => ({
                      description: item.name,
                      quantity: item.quantity.toString(),
                      unitPrice: item.unitPrice.toString(),
                      taxRate: "",
                    })));
                    setUseLineItems(true);
                  }}
                  initialSelected={
                    estimate?.lineItems?.map((li: any) => ({
                      id: li.id,
                      name: li.description,
                      unitPrice: li.unitPrice,
                      quantity: li.quantity,
                    })) || []
                  }
                />
              </div>
            )}

            {/* Manual pricing section — shown when no service type or service type has no items */}
            {(!selectedServiceType || (selectedServiceType.pricingItems || []).length === 0) && (
              <>
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
              </>
            )}

            {/* Estimated total when service type builder is active */}
            {selectedServiceType && (selectedServiceType.pricingItems || []).length > 0 && (
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
