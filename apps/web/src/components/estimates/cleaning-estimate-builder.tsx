"use client";

import React, { useState } from "react";
import { Label } from "@tasksuite/ui";
import { Input } from "@tasksuite/ui";
import { Button } from "@tasksuite/ui";

interface CleaningEstimateBuilderProps {
  onUpdate: (data: { amount: number; lineItems: any[]; metadata?: any }) => void;
  initialData?: any;
}

const CLEANING_ROOMS = [
  { id: "bedroom", name: "Bedroom", basePrice: 25 },
  { id: "bathroom", name: "Bathroom", basePrice: 30 },
  { id: "kitchen", name: "Kitchen", basePrice: 40 },
  { id: "living_room", name: "Living Room", basePrice: 35 },
  { id: "dining_room", name: "Dining Room", basePrice: 20 },
  { id: "office", name: "Office", basePrice: 25 },
  { id: "basement", name: "Basement", basePrice: 30 },
  { id: "garage", name: "Garage", basePrice: 25 },
];

const CLEANING_ADDONS = [
  { id: "deep_cleaning", name: "Deep Cleaning", price: 50 },
  { id: "windows", name: "Windows (Inside & Out)", price: 15 },
  { id: "appliances", name: "Appliance Cleaning", price: 30 },
  { id: "oven", name: "Oven Cleaning", price: 40 },
  { id: "fridge", name: "Refrigerator Cleaning", price: 30 },
  { id: "carpet", name: "Carpet Cleaning", price: 60 },
  { id: "baseboards", name: "Baseboards", price: 20 },
  { id: "blinds", name: "Blinds", price: 25 },
];

export function CleaningEstimateBuilder({ onUpdate, initialData }: CleaningEstimateBuilderProps) {
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(
    new Set(initialData?.rooms || [])
  );
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(
    new Set(initialData?.addons || [])
  );
  const [customPricing, setCustomPricing] = useState<Record<string, number>>(
    initialData?.customPricing || {}
  );
  const [pricingType, setPricingType] = useState<"flat" | "hourly">(
    initialData?.pricingType || "flat"
  );
  const [hourlyRate, setHourlyRate] = useState<string>(
    initialData?.hourlyRate?.toString() || "50"
  );
  const [estimatedHours, setEstimatedHours] = useState<string>(
    initialData?.estimatedHours?.toString() || "2"
  );

  // Update state when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setSelectedRooms(new Set(initialData.rooms || []));
      setSelectedAddons(new Set(initialData.addons || []));
      setCustomPricing(initialData.customPricing || {});
      setPricingType(initialData.pricingType || "flat");
      setHourlyRate(initialData.hourlyRate?.toString() || "50");
      setEstimatedHours(initialData.estimatedHours?.toString() || "2");
    }
  }, [initialData]);

  function calculateTotal() {
    if (pricingType === "hourly") {
      return parseFloat(hourlyRate) * parseFloat(estimatedHours);
    }

    let total = 0;
    selectedRooms.forEach((roomId) => {
      const room = CLEANING_ROOMS.find((r) => r.id === roomId);
      if (room) {
        total += customPricing[roomId] || room.basePrice;
      }
    });
    selectedAddons.forEach((addonId) => {
      const addon = CLEANING_ADDONS.find((a) => a.id === addonId);
      if (addon) {
        total += addon.price;
      }
    });
    return total;
  }

  function toggleRoom(roomId: string) {
    const newSelected = new Set(selectedRooms);
    if (newSelected.has(roomId)) {
      newSelected.delete(roomId);
      const newPricing = { ...customPricing };
      delete newPricing[roomId];
      setCustomPricing(newPricing);
    } else {
      newSelected.add(roomId);
    }
    setSelectedRooms(newSelected);
    updateEstimate(newSelected, selectedAddons);
  }

  function toggleAddon(addonId: string) {
    const newSelected = new Set(selectedAddons);
    if (newSelected.has(addonId)) {
      newSelected.delete(addonId);
    } else {
      newSelected.add(addonId);
    }
    setSelectedAddons(newSelected);
    updateEstimate(selectedRooms, newSelected);
  }

  function updateRoomPrice(roomId: string, price: string) {
    const newPricing = { ...customPricing, [roomId]: parseFloat(price) || 0 };
    setCustomPricing(newPricing);
    updateEstimate(selectedRooms, selectedAddons);
  }

  function updateEstimate(rooms: Set<string>, addons: Set<string>) {
    const total = calculateTotal();
    const lineItems: any[] = [];

    if (pricingType === "hourly") {
      // For hourly pricing, only include the hourly line item
      lineItems.push({
        description: `Cleaning Service (${estimatedHours} hours @ $${hourlyRate}/hr)`,
        quantity: parseFloat(estimatedHours),
        unitPrice: parseFloat(hourlyRate),
      });
    } else {
      // For flat rate pricing, include rooms and addons
      rooms.forEach((roomId) => {
        const room = CLEANING_ROOMS.find((r) => r.id === roomId);
        if (room) {
          lineItems.push({
            description: room.name,
            quantity: 1,
            unitPrice: customPricing[roomId] || room.basePrice,
          });
        }
      });

      addons.forEach((addonId) => {
        const addon = CLEANING_ADDONS.find((a) => a.id === addonId);
        if (addon) {
          lineItems.push({
            description: addon.name,
            quantity: 1,
            unitPrice: addon.price,
          });
        }
      });
    }

    const metadata = {
      rooms: Array.from(rooms),
      addons: Array.from(addons),
      customPricing,
      pricingType,
      hourlyRate: parseFloat(hourlyRate),
      estimatedHours: parseFloat(estimatedHours),
    };

    onUpdate({ amount: total, lineItems, metadata });
  }

  React.useEffect(() => {
    updateEstimate(selectedRooms, selectedAddons);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingType, hourlyRate, estimatedHours]);

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label>Pricing Type</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={pricingType === "flat" ? "default" : "outline"}
            onClick={() => setPricingType("flat")}
          >
            Flat Rate
          </Button>
          <Button
            type="button"
            variant={pricingType === "hourly" ? "default" : "outline"}
            onClick={() => setPricingType("hourly")}
          >
            Hourly
          </Button>
        </div>
      </div>

      {pricingType === "hourly" ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => {
                setHourlyRate(e.target.value);
                updateEstimate(selectedRooms, selectedAddons);
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => {
                setEstimatedHours(e.target.value);
                updateEstimate(selectedRooms, selectedAddons);
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-2">
            <Label>Rooms</Label>
            <div className="grid grid-cols-2 gap-2">
              {CLEANING_ROOMS.map((room) => (
                <div key={room.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`room-${room.id}`}
                    checked={selectedRooms.has(room.id)}
                    onChange={() => toggleRoom(room.id)}
                    className="rounded"
                  />
                  <Label htmlFor={`room-${room.id}`} className="flex-1 cursor-pointer">
                    {room.name}
                  </Label>
                  {selectedRooms.has(room.id) && (
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={room.basePrice.toString()}
                      value={customPricing[room.id]?.toString() || ""}
                      onChange={(e) => updateRoomPrice(room.id, e.target.value)}
                      className="w-20"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Add-Ons</Label>
            <div className="grid grid-cols-2 gap-2">
              {CLEANING_ADDONS.map((addon) => (
                <div key={addon.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`addon-${addon.id}`}
                    checked={selectedAddons.has(addon.id)}
                    onChange={() => toggleAddon(addon.id)}
                    className="rounded"
                  />
                  <Label htmlFor={`addon-${addon.id}`} className="flex-1 cursor-pointer">
                    {addon.name} (+${addon.price})
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="border-t pt-4">
        <div className="flex justify-between font-semibold text-lg">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

