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
import { getInvoiceTemplates, getClients, getJobs } from "@/lib/api";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  invoice?: any;
  onSave: (data: any) => void;
  saving?: boolean;
  error?: string | null;
}

export function InvoiceDialog({
  open,
  onOpenChange,
  invoice,
  onSave,
  saving = false,
  error,
}: InvoiceDialogProps) {
  const [formData, setFormData] = useState({
    clientId: "",
    jobId: "",
    invoiceNumber: "",
    amount: "",
    dueDate: "",
    status: "pending",
    sendEmail: false,
    sendText: false,
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadTemplates();
      loadClients();
      loadJobs();
    }
  }, [open]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        clientId: invoice.clientId || "",
        jobId: invoice.jobId || "",
        invoiceNumber: invoice.invoiceNumber || "",
        amount: invoice.amount?.toString() || "",
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : "",
        status: invoice.status || "pending",
        sendEmail: false,
        sendText: false,
      });
      setSelectedTemplateId("");
    } else {
      setFormData({
        clientId: "",
        jobId: "",
        invoiceNumber: "",
        amount: "",
        dueDate: "",
        status: "pending",
        sendEmail: false,
        sendText: false,
      });
      setSelectedTemplateId("");
    }
    setErrors({});
  }, [invoice, open]);

  async function loadTemplates() {
    try {
      const data = await getInvoiceTemplates();
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

  async function loadJobs() {
    try {
      const data = await getJobs();
      setJobs(data as any[]);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    }
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
        const dueDate = template.dueDateDays
          ? new Date(Date.now() + template.dueDateDays * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          : "";
        setFormData({
          ...formData,
          invoiceNumber: template.invoiceNumber || "",
          amount: template.amount?.toString() || "",
          dueDate: dueDate,
        });
      }
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errs: Record<string, string> = {};
    if (!formData.clientId) errs.clientId = "Please select a client";
    if (!formData.invoiceNumber.trim()) errs.invoiceNumber = "Invoice number is required";
    if (!formData.amount) errs.amount = "Amount is required";
    else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0) {
      errs.amount = "Enter a valid amount";
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      jobId: formData.jobId || null,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
    });
  }

  const filteredJobs = formData.clientId
    ? jobs.filter((job) => job.clientId === formData.clientId)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
          <DialogDescription>
            {invoice ? "Update invoice information" : "Create a new invoice from a template or from scratch"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 px-4 sm:px-6">
            <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">
                {error}
              </div>
            )}
            {!invoice && templates.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="template">Template (Optional)</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="clientId">Client <span className="text-destructive">*</span></Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => {
                  setFormData({ ...formData, clientId: value, jobId: "" });
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
            <div className="grid gap-2">
              <Label htmlFor="jobId">Job (Optional)</Label>
              <Select
                value={formData.jobId || undefined}
                onValueChange={(value) => setFormData({ ...formData, jobId: value === "none" ? "" : value })}
                disabled={!formData.clientId}
              >
                <SelectTrigger id="jobId">
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {filteredJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invoiceNumber">Invoice Number <span className="text-destructive">*</span></Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, invoiceNumber: event.target.value });
                  if (errors.invoiceNumber) setErrors({ ...errors, invoiceNumber: "" });
                }}
                aria-invalid={!!errors.invoiceNumber}
              />
              {errors.invoiceNumber && <p className="text-sm text-destructive">{errors.invoiceNumber}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount <span className="text-destructive">*</span></Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, amount: event.target.value });
                  if (errors.amount) setErrors({ ...errors, amount: "" });
                }}
                aria-invalid={!!errors.amount}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, dueDate: event.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!invoice && (
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

