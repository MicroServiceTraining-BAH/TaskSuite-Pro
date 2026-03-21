"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@tasksuite/ui";
import { Label } from "@tasksuite/ui";

interface PricingItem {
  id: string;
  name: string;
  price: number;
}

interface SelectedItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface ServiceTypeEstimateBuilderProps {
  pricingItems: PricingItem[];
  onUpdate: (data: { amount: number; lineItems: SelectedItem[] }) => void;
  initialSelected?: SelectedItem[];
}

export function ServiceTypeEstimateBuilder({
  pricingItems,
  onUpdate,
  initialSelected = [],
}: ServiceTypeEstimateBuilderProps) {
  const [selected, setSelected] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const item of initialSelected) {
      init[item.id] = item.quantity;
    }
    return init;
  });

  useEffect(() => {
    const lineItems: SelectedItem[] = pricingItems
      .filter((item) => selected[item.id] && selected[item.id] > 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        unitPrice: item.price,
        quantity: selected[item.id],
      }));

    const amount = lineItems.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0);
    onUpdate({ amount, lineItems });
  }, [selected, pricingItems]);

  function toggleItem(itemId: string) {
    setSelected((prev) => {
      if (prev[itemId]) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: 1 };
    });
  }

  function setQuantity(itemId: string, qty: number) {
    if (qty <= 0) {
      setSelected((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } else {
      setSelected((prev) => ({ ...prev, [itemId]: qty }));
    }
  }

  const total = pricingItems
    .filter((item) => selected[item.id] && selected[item.id] > 0)
    .reduce((sum, item) => sum + item.price * (selected[item.id] || 0), 0);

  if (pricingItems.length === 0) {
    return (
      <div className="border rounded-lg p-4 text-sm text-muted-foreground text-center">
        This service type has no pricing items configured.{" "}
        <a href="/settings/service-types" className="text-primary hover:underline">
          Add items in Settings → Service Types
        </a>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="bg-muted/40 px-4 py-2.5 grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        <div className="col-span-1"></div>
        <div className="col-span-6">Item</div>
        <div className="col-span-2 text-right">Price</div>
        <div className="col-span-3 text-center">Qty</div>
      </div>

      <div className="divide-y">
        {pricingItems.map((item) => {
          const isChecked = !!selected[item.id];
          const qty = selected[item.id] || 1;

          return (
            <div
              key={item.id}
              className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors ${
                isChecked ? "bg-primary/5" : "hover:bg-muted/20"
              }`}
            >
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleItem(item.id)}
                  className="rounded cursor-pointer"
                  id={`item-${item.id}`}
                />
              </div>
              <div className="col-span-6">
                <label htmlFor={`item-${item.id}`} className="text-sm font-medium cursor-pointer select-none">
                  {item.name}
                </label>
              </div>
              <div className="col-span-2 text-right text-sm text-muted-foreground">
                ${item.price.toFixed(2)}
              </div>
              <div className="col-span-3 flex justify-center">
                {isChecked ? (
                  <Input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="h-7 w-16 text-center text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground/50">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 bg-muted/20 border-t flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          {Object.values(selected).filter(Boolean).length} item(s) selected
        </span>
        <span className="font-semibold text-base">
          Total: ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
