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

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  client?: any;
  onSave: (data: any) => void;
  saving?: boolean;
  error?: string | null;
}

export function ClientDialog({ open, onOpenChange, client, onSave, saving = false, error }: ClientDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
      });
    } else {
      setFormData({ name: "", email: "", phone: "", address: "" });
    }
    setErrors({});
  }, [client, open]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Enter a valid email address";
    }
    if (formData.phone && formData.phone.length > 20) {
      errs.phone = "Phone must be 20 characters or fewer";
    }
    return errs;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(formData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add Client"}</DialogTitle>
          <DialogDescription>
            {client ? "Update client information" : "Create a new client"}
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
            <div className="grid gap-2">
              <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, name: event.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, email: event.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, phone: event.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, address: event.target.value })
                }
              />
            </div>
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
