"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@tasksuite/ui";
import { Input } from "@tasksuite/ui";
import { Button } from "@tasksuite/ui";
import { addFlooringMaterial, updateFlooringMaterial, deleteFlooringMaterial } from "@/lib/api";

interface FlooringMaterialsProps {
  jobId: string;
  companyId: string;
  onUpdate?: (materials: any[]) => void;
  initialMaterials?: any[];
}

const MATERIAL_TYPES = [
  { id: "hardwood", name: "Hardwood", unit: "sqft" },
  { id: "vinyl", name: "Vinyl Plank", unit: "sqft" },
  { id: "carpet", name: "Carpet", unit: "sqft" },
  { id: "tile", name: "Tile", unit: "sqft" },
  { id: "laminate", name: "Laminate", unit: "sqft" },
  { id: "baseboard", name: "Baseboard", unit: "linear_ft" },
  { id: "adhesive", name: "Adhesive", unit: "gallon" },
  { id: "underlayment", name: "Underlayment", unit: "sqft" },
  { id: "trim", name: "Trim", unit: "linear_ft" },
];

export function FlooringMaterials({ jobId, companyId, onUpdate, initialMaterials }: FlooringMaterialsProps) {
  const [materials, setMaterials] = useState<any[]>(initialMaterials || []);

  useEffect(() => {
    if (initialMaterials) {
      setMaterials(initialMaterials);
    }
  }, [initialMaterials]);

  async function addMaterial() {
    const materialType = MATERIAL_TYPES[0];
    const newMaterial = {
      materialType: materialType.id,
      name: materialType.name,
      quantity: 0,
      unit: materialType.unit,
      unitPrice: 0,
      wastePercent: 10,
      notes: "",
    };
    
    try {
      const created = await addFlooringMaterial(jobId, newMaterial);
      const updated = [...materials, created];
      setMaterials(updated);
      if (onUpdate) onUpdate(updated);
    } catch (error) {
      console.error("Failed to add material:", error);
    }
  }

  async function removeMaterial(id: string) {
    try {
      await deleteFlooringMaterial(jobId, id);
      const updated = materials.filter((m) => m.id !== id);
      setMaterials(updated);
      if (onUpdate) onUpdate(updated);
    } catch (error) {
      console.error("Failed to remove material:", error);
    }
  }

  async function updateMaterial(id: string, field: string, value: any) {
    const material = materials.find((m) => m.id === id);
    if (!material) return;

    const updatedMaterial = { ...material, [field]: value };
    if (field === "materialType") {
      const materialType = MATERIAL_TYPES.find((mt) => mt.id === value);
      if (materialType) {
        updatedMaterial.name = materialType.name;
        updatedMaterial.unit = materialType.unit;
      }
    }
    
    // Recalculate total cost
    if (field === "quantity" || field === "unitPrice" || field === "wastePercent") {
      const quantity = parseFloat(updatedMaterial.quantity) || 0;
      const unitPrice = parseFloat(updatedMaterial.unitPrice) || 0;
      const waste = parseFloat(updatedMaterial.wastePercent) || 0;
      updatedMaterial.totalCost = quantity * unitPrice * (1 + waste / 100);
    }

    try {
      const updated = await updateFlooringMaterial(jobId, id, {
        materialType: updatedMaterial.materialType,
        name: updatedMaterial.name,
        quantity: updatedMaterial.quantity,
        unit: updatedMaterial.unit,
        unitPrice: updatedMaterial.unitPrice,
        wastePercent: updatedMaterial.wastePercent,
        notes: updatedMaterial.notes,
      });
      
      const updatedList = materials.map((m) => (m.id === id ? updated : m));
      setMaterials(updatedList);
      if (onUpdate) onUpdate(updatedList);
    } catch (error) {
      console.error("Failed to update material:", error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Materials Used</h3>
        <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
          + Add Material
        </Button>
      </div>

      {materials.map((material) => (
        <div key={material.id} className="grid grid-cols-12 gap-2 p-4 border rounded-lg">
          <div className="col-span-3">
            <Label>Material Type</Label>
            <select
              value={material.materialType}
              onChange={(e) => updateMaterial(material.id, "materialType", e.target.value)}
              className="w-full rounded border px-2 py-1"
            >
              {MATERIAL_TYPES.map((mt) => (
                <option key={mt.id} value={mt.id}>
                  {mt.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              step="0.01"
              value={material.quantity}
              onChange={(e) => updateMaterial(material.id, "quantity", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="col-span-1">
            <Label>Unit</Label>
            <Input value={material.unit} disabled className="text-sm" />
          </div>
          <div className="col-span-2">
            <Label>Unit Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={material.unitPrice}
              onChange={(e) => updateMaterial(material.id, "unitPrice", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="col-span-2">
            <Label>Waste (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={material.wastePercent || 0}
              onChange={(e) => updateMaterial(material.id, "wastePercent", parseFloat(e.target.value) || 0)}
              disabled={material.materialType === "baseboard" || material.materialType === "adhesive" || material.materialType === "trim"}
            />
          </div>
          <div className="col-span-1">
            <Label>Total</Label>
            <div className="text-sm font-semibold pt-2">
              ${(material.totalCost || 0).toFixed(2)}
            </div>
          </div>
          <div className="col-span-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeMaterial(material.id)}
              className="mt-6"
            >
              Remove
            </Button>
          </div>
        </div>
      ))}

      {materials.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No materials added. Click "Add Material" to track materials used.
        </p>
      )}

      {materials.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total Materials Cost:</span>
            <span>
              ${materials.reduce((sum, m) => sum + (m.totalCost || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

