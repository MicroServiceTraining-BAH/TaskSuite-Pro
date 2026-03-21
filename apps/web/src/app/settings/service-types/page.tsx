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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tasksuite/ui";
import { getServiceTypes, createServiceType, updateServiceType, deleteServiceType } from "@/lib/api";
import { Plus, Trash2, PencilLine, GripVertical } from "lucide-react";

interface PricingItem {
  id: string;
  name: string;
  price: number;
}

interface ServiceType {
  id: string;
  name: string;
  description?: string;
  pricingItems: PricingItem[];
  isActive: boolean;
}

export default function ServiceTypesPage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceType | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getServiceTypes();
      setServiceTypes(data as ServiceType[]);
    } catch (err) {
      console.error("Failed to load service types:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data: Omit<ServiceType, "id">) {
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateServiceType(editing.id, data);
      } else {
        await createServiceType(data);
      }
      await loadData();
      setIsDialogOpen(false);
      setEditing(null);
    } catch (err: any) {
      setError(err.message || "Failed to save service type");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service type? Existing estimates using it won't be affected.")) return;
    try {
      await deleteServiceType(id);
      await loadData();
    } catch (err) {
      alert("Failed to delete service type");
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold">Service Types</h1>
          <p className="text-muted-foreground mt-1">
            Define the services your company offers and their pricing items.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setIsDialogOpen(true); }}>
          <Plus size={16} className="mr-2" />
          Add Service Type
        </Button>
      </div>

      <div className="rounded-lg border mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Pricing Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : serviceTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No service types yet. Create your first one to get started.
                </TableCell>
              </TableRow>
            ) : (
              serviceTypes.map((st) => (
                <TableRow key={st.id}>
                  <TableCell className="font-medium">{st.name}</TableCell>
                  <TableCell className="text-muted-foreground">{st.description || "-"}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {(st.pricingItems || []).length} item{(st.pricingItems || []).length !== 1 ? "s" : ""}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      st.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {st.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditing(st); setIsDialogOpen(true); }}
                      className="mr-2"
                    >
                      <PencilLine size={14} className="mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(st.id)}
                    >
                      <Trash2 size={14} className="mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isDialogOpen && (
        <ServiceTypeDialog
          open={isDialogOpen}
          onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditing(null); }}
          serviceType={editing}
          onSave={handleSave}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

interface ServiceTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceType: ServiceType | null;
  onSave: (data: Omit<ServiceType, "id">) => void;
  saving: boolean;
  error: string;
}

function ServiceTypeDialog({ open, onOpenChange, serviceType, onSave, saving, error }: ServiceTypeDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (serviceType) {
      setName(serviceType.name);
      setDescription(serviceType.description || "");
      setIsActive(serviceType.isActive);
      setPricingItems(serviceType.pricingItems || []);
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
      setPricingItems([]);
    }
    setFieldErrors({});
  }, [serviceType, open]);

  function addItem() {
    setPricingItems([...pricingItems, { id: generateId(), name: "", price: 0 }]);
  }

  function removeItem(id: string) {
    setPricingItems(pricingItems.filter((item) => item.id !== id));
  }

  function updateItem(id: string, field: keyof PricingItem, value: string | number) {
    setPricingItems(pricingItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    const badItems = pricingItems.filter((item) => !item.name.trim());
    if (badItems.length > 0) errs.items = "All pricing items must have a name";
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    onSave({ name: name.trim(), description: description.trim(), isActive, pricingItems });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{serviceType ? "Edit Service Type" : "Create Service Type"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" }); }}
              placeholder="e.g. Pool Cleaning, HVAC Service, Dog Grooming"
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this service"
            />
          </div>

          {/* Pricing Items */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Pricing Items</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Define what can be included in an estimate for this service type.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus size={14} className="mr-1" /> Add Item
              </Button>
            </div>

            {pricingItems.length === 0 ? (
              <div className="border rounded-lg p-6 text-center text-sm text-muted-foreground">
                No pricing items yet. Add items that clients can select when requesting this service.
              </div>
            ) : (
              <div className="border rounded-lg divide-y">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                  <div className="col-span-7">Item Name</div>
                  <div className="col-span-3">Default Price ($)</div>
                  <div className="col-span-2"></div>
                </div>
                {pricingItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-2 items-center">
                    <div className="col-span-7">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        placeholder={`Item ${index + 1} (e.g. Standard Room)`}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {fieldErrors.items && <p className="text-sm text-destructive">{fieldErrors.items}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="isActive" className="font-normal cursor-pointer">Active (available for estimates)</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : serviceType ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
