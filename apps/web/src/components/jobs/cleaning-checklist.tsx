"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@tasksuite/ui";
import { Input } from "@tasksuite/ui";
import { upsertCleaningChecklistItem } from "@/lib/api";

interface CleaningChecklistProps {
  jobId: string;
  companyId: string;
  onUpdate?: (items: any[]) => void;
  initialItems?: any[];
}

const CLEANING_ROOMS = [
  "bedroom",
  "bathroom",
  "kitchen",
  "living_room",
  "dining_room",
  "office",
  "basement",
  "garage",
];

const CLEANING_TASKS = [
  { id: "vacuum", name: "Vacuum" },
  { id: "mop", name: "Mop" },
  { id: "dust", name: "Dust" },
  { id: "clean_windows", name: "Clean Windows" },
  { id: "clean_mirrors", name: "Clean Mirrors" },
  { id: "clean_toilet", name: "Clean Toilet" },
  { id: "clean_shower", name: "Clean Shower/Tub" },
  { id: "clean_sinks", name: "Clean Sinks" },
  { id: "clean_appliances", name: "Clean Appliances" },
  { id: "take_trash", name: "Take Out Trash" },
  { id: "wipe_surfaces", name: "Wipe Surfaces" },
];

export function CleaningChecklist({ jobId, companyId, onUpdate, initialItems }: CleaningChecklistProps) {
  const [checklistItems, setChecklistItems] = useState<any[]>(initialItems || []);

  useEffect(() => {
    if (initialItems) {
      setChecklistItems(initialItems);
    }
  }, [initialItems]);

  async function toggleTask(room: string, task: string) {
    const existing = checklistItems.find((item) => item.room === room && item.task === task);
    const newCompleted = !existing?.completed;

    try {
      await upsertCleaningChecklistItem(jobId, room, task, newCompleted, existing?.notes);
      
      if (existing) {
        const updated = checklistItems.map((item) =>
          item.id === existing.id
            ? { ...item, completed: newCompleted, completedAt: newCompleted ? new Date() : null }
            : item
        );
        setChecklistItems(updated);
        if (onUpdate) onUpdate(updated);
      } else {
        const newItem = {
          id: `${room}-${task}`,
          room,
          task,
          completed: newCompleted,
          completedAt: newCompleted ? new Date() : null,
          notes: "",
        };
        const updated = [...checklistItems, newItem];
        setChecklistItems(updated);
        if (onUpdate) onUpdate(updated);
      }
    } catch (error) {
      console.error("Failed to update checklist item:", error);
    }
  }

  async function updateNotes(room: string, task: string, notes: string) {
    const existing = checklistItems.find((item) => item.room === room && item.task === task);
    if (existing) {
      try {
        await upsertCleaningChecklistItem(jobId, room, task, existing.completed, notes);
        const updated = checklistItems.map((item) =>
          item.id === existing.id ? { ...item, notes } : item
        );
        setChecklistItems(updated);
        if (onUpdate) onUpdate(updated);
      } catch (error) {
        console.error("Failed to update notes:", error);
      }
    }
  }

  function isTaskCompleted(room: string, task: string) {
    return checklistItems.some(
      (item) => item.room === room && item.task === task && item.completed
    );
  }

  function getTaskNotes(room: string, task: string) {
    const item = checklistItems.find((item) => item.room === room && item.task === task);
    return item?.notes || "";
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cleaning Checklist</h3>
        <div className="text-sm text-muted-foreground">
          {checklistItems.filter((item) => item.completed).length} / {checklistItems.length} completed
        </div>
      </div>

      {CLEANING_ROOMS.map((room) => (
        <div key={room} className="border rounded-lg p-4">
          <h4 className="font-medium mb-3 capitalize">{room.replace("_", " ")}</h4>
          <div className="grid grid-cols-2 gap-2">
            {CLEANING_TASKS.map((task) => {
              const completed = isTaskCompleted(room, task.id);
              const notes = getTaskNotes(room, task.id);
              return (
                <div key={task.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={() => toggleTask(room, task.id)}
                    className="mt-1 rounded"
                  />
                  <div className="flex-1">
                    <Label className="cursor-pointer" onClick={() => toggleTask(room, task.id)}>
                      {task.name}
                    </Label>
                    {completed && (
                      <Input
                        type="text"
                        placeholder="Notes..."
                        value={notes}
                        onChange={(e) => updateNotes(room, task.id, e.target.value)}
                        className="mt-1 text-sm"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

