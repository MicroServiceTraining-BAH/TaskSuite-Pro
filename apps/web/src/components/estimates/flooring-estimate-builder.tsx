"use client";

import React, { useState } from "react";
import { Label } from "@tasksuite/ui";
import { Input } from "@tasksuite/ui";
import { Button } from "@tasksuite/ui";

interface FlooringEstimateBuilderProps {
  onUpdate: (data: { amount: number; lineItems: any[]; metadata?: any }) => void;
  initialData?: any;
}

const MATERIAL_TYPES = [
  { id: "hardwood", name: "Hardwood", defaultPrice: 8.0, unit: "sqft" },
  { id: "vinyl", name: "Vinyl Plank", defaultPrice: 4.0, unit: "sqft" },
  { id: "carpet", name: "Carpet", defaultPrice: 3.0, unit: "sqft" },
  { id: "tile", name: "Tile", defaultPrice: 6.0, unit: "sqft" },
  { id: "laminate", name: "Laminate", defaultPrice: 3.5, unit: "sqft" },
];

const ADDITIONAL_MATERIALS = [
  { id: "baseboard", name: "Baseboard", defaultPrice: 2.5, unit: "linear_ft" },
  { id: "adhesive", name: "Adhesive", defaultPrice: 25.0, unit: "gallon" },
  { id: "underlayment", name: "Underlayment", defaultPrice: 0.75, unit: "sqft" },
  { id: "trim", name: "Trim", defaultPrice: 3.0, unit: "linear_ft" },
];

const LABOR_RATES = {
  hardwood: 4.0,
  vinyl: 3.0,
  carpet: 2.0,
  tile: 5.0,
  laminate: 3.0,
};

export function FlooringEstimateBuilder({ onUpdate, initialData }: FlooringEstimateBuilderProps) {
  const [materials, setMaterials] = useState<any[]>(
    initialData?.materials || []
  );
  const [wastePercent, setWastePercent] = useState<string>(
    initialData?.wastePercent?.toString() || "10"
  );
  const [laborRate, setLaborRate] = useState<string>(
    initialData?.laborRate?.toString() || "50"
  );
  const [disposalFee, setDisposalFee] = useState<string>(
    initialData?.disposalFee?.toString() || "0"
  );
  const [deliveryFee, setDeliveryFee] = useState<string>(
    initialData?.deliveryFee?.toString() || "0"
  );

  // Update state when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setMaterials(initialData.materials || []);
      setWastePercent(initialData.wastePercent?.toString() || "10");
      setLaborRate(initialData.laborRate?.toString() || "50");
      setDisposalFee(initialData.disposalFee?.toString() || "0");
      setDeliveryFee(initialData.deliveryFee?.toString() || "0");
    }
  }, [initialData]);

  function addMaterial(type: "material" | "additional") {
    const materialList = type === "material" ? MATERIAL_TYPES : ADDITIONAL_MATERIALS;
    const newMaterial = {
      id: Date.now().toString(),
      materialType: materialList[0].id,
      name: materialList[0].name,
      quantity: 0,
      unit: materialList[0].unit,
      unitPrice: materialList[0].defaultPrice,
      wastePercent: type === "material" ? parseFloat(wastePercent) : 0,
    };
    setMaterials([...materials, newMaterial]);
  }

  function removeMaterial(id: string) {
    setMaterials(materials.filter((m) => m.id !== id));
    updateEstimate();
  }

  function updateMaterial(id: string, field: string, value: any) {
    const updated = materials.map((m) => {
      if (m.id === id) {
        const updatedMaterial = { ...m, [field]: value };
        if (field === "materialType") {
          const materialList = MATERIAL_TYPES.find((mt) => mt.id === value) ||
            ADDITIONAL_MATERIALS.find((mt) => mt.id === value);
          if (materialList) {
            updatedMaterial.name = materialList.name;
            updatedMaterial.unit = materialList.unit;
            updatedMaterial.unitPrice = materialList.defaultPrice;
          }
        }
        return updatedMaterial;
      }
      return m;
    });
    setMaterials(updated);
    updateEstimate();
  }

  function calculateTotal() {
    let materialCost = 0;
    let laborCost = 0;

    materials.forEach((material) => {
      const quantity = parseFloat(material.quantity) || 0;
      const unitPrice = parseFloat(material.unitPrice) || 0;
      const waste = material.wastePercent || 0;
      const materialTotal = quantity * unitPrice * (1 + waste / 100);
      materialCost += materialTotal;

      // Calculate labor for main materials
      if (MATERIAL_TYPES.find((mt) => mt.id === material.materialType)) {
        const laborRatePerSqft = LABOR_RATES[material.materialType as keyof typeof LABOR_RATES] || 3.0;
        laborCost += quantity * laborRatePerSqft;
      }
    });

    // Add hourly labor if specified
    const hourlyLabor = parseFloat(laborRate) * (laborCost / parseFloat(laborRate) || 0);

    const disposal = parseFloat(disposalFee) || 0;
    const delivery = parseFloat(deliveryFee) || 0;

    return materialCost + laborCost + disposal + delivery;
  }

  function updateEstimate() {
    const total = calculateTotal();
    const lineItems: any[] = [];

    materials.forEach((material) => {
      const quantity = parseFloat(material.quantity) || 0;
      const unitPrice = parseFloat(material.unitPrice) || 0;
      const waste = material.wastePercent || 0;
      const materialTotal = quantity * unitPrice * (1 + waste / 100);

      lineItems.push({
        description: `${material.name} (${quantity} ${material.unit}${waste > 0 ? ` + ${waste}% waste` : ""})`,
        quantity: quantity * (1 + waste / 100),
        unitPrice: unitPrice,
      });

      // Add labor for main materials
      if (MATERIAL_TYPES.find((mt) => mt.id === material.materialType)) {
        const laborRatePerSqft = LABOR_RATES[material.materialType as keyof typeof LABOR_RATES] || 3.0;
        lineItems.push({
          description: `Labor - ${material.name}`,
          quantity: quantity,
          unitPrice: laborRatePerSqft,
        });
      }
    });

    if (parseFloat(disposalFee) > 0) {
      lineItems.push({
        description: "Disposal Fee",
        quantity: 1,
        unitPrice: parseFloat(disposalFee),
      });
    }

    if (parseFloat(deliveryFee) > 0) {
      lineItems.push({
        description: "Delivery Fee",
        quantity: 1,
        unitPrice: parseFloat(deliveryFee),
      });
    }

    const metadata = {
      materials,
      wastePercent: parseFloat(wastePercent),
      laborRate: parseFloat(laborRate),
      disposalFee: parseFloat(disposalFee),
      deliveryFee: parseFloat(deliveryFee),
    };

    onUpdate({ amount: total, lineItems, metadata });
  }

  React.useEffect(() => {
    updateEstimate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wastePercent, laborRate, disposalFee, deliveryFee]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="wastePercent">Waste Percentage (%)</Label>
            <Input
              id="wastePercent"
              type="number"
              step="0.1"
              value={wastePercent}
              onChange={(e) => {
                setWastePercent(e.target.value);
                updateEstimate();
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="laborRate">Labor Rate ($/hr)</Label>
            <Input
              id="laborRate"
              type="number"
              step="0.01"
              value={laborRate}
              onChange={(e) => {
                setLaborRate(e.target.value);
                updateEstimate();
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="disposalFee">Disposal Fee ($)</Label>
            <Input
              id="disposalFee"
              type="number"
              step="0.01"
              value={disposalFee}
              onChange={(e) => {
                setDisposalFee(e.target.value);
                updateEstimate();
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
            <Input
              id="deliveryFee"
              type="number"
              step="0.01"
              value={deliveryFee}
              onChange={(e) => {
                setDeliveryFee(e.target.value);
                updateEstimate();
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex justify-between items-center">
          <Label>Materials</Label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => addMaterial("material")}>
              + Add Material
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => addMaterial("additional")}>
              + Add Additional
            </Button>
          </div>
        </div>

        {materials.map((material) => (
          <div key={material.id} className="grid grid-cols-12 gap-2 p-4 border rounded-lg">
            <div className="col-span-3">
              <Label>Type</Label>
              <select
                value={material.materialType}
                onChange={(e) => updateMaterial(material.id, "materialType", e.target.value)}
                className="w-full rounded border px-2 py-1"
              >
                {MATERIAL_TYPES.map((mt) => (
                  <option key={mt.id} value={mt.id}>{mt.name}</option>
                ))}
                {ADDITIONAL_MATERIALS.map((mt) => (
                  <option key={mt.id} value={mt.id}>{mt.name}</option>
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
            <div className="col-span-2">
              <Label>Unit</Label>
              <Input value={material.unit} disabled />
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
                disabled={ADDITIONAL_MATERIALS.find((mt) => mt.id === material.materialType) !== undefined}
              />
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
            No materials added. Click "Add Material" to get started.
          </p>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between font-semibold text-lg">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

