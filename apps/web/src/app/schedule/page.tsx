"use client";

import { useState, useEffect } from "react";
import { Button } from "@tasksuite/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tasksuite/ui";
import { getAppointments, deleteAppointment } from "@/lib/api";
import { CalendarView } from "@/components/schedule/calendar-view";

export default function SchedulePage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAppointments() {
    try {
      const data = await getAppointments() as any[];
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await deleteAppointment(id);
      await loadAppointments();
      setIsDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Failed to delete appointment:", error);
    }
  }

  function handleAppointmentClick(appointment: any) {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Schedule</h1>

      <CalendarView
        appointments={appointments}
        onAppointmentClick={handleAppointmentClick}
      />

      {/* Appointment Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAppointment?.title}</DialogTitle>
            <DialogDescription>Appointment Details</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              {selectedAppointment.description && (
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.description}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Start Time</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedAppointment.startTime).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">End Time</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedAppointment.endTime).toLocaleString()}
                </p>
              </div>
              {selectedAppointment.client && (
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.client.name}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => selectedAppointment && handleDelete(selectedAppointment.id)}
            >
              Delete
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

