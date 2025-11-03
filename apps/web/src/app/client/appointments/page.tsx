"use client";

import { useEffect, useState } from "react";
import { getClientAppointments } from "@/lib/api";
import { Card } from "@tasksuite/ui";

export default function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getClientAppointments();
        setAppointments(data as any[]);
      } catch (error) {
        console.error("Failed to load appointments:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.startTime) > now);
  const past = appointments.filter((a) => new Date(a.startTime) <= now);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
          <div className="space-y-4">
            {upcoming
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map((appointment) => (
                <Card key={appointment.id} className="p-6">
                  <h3 className="text-lg font-semibold">{appointment.title}</h3>
                  {appointment.description && (
                    <p className="text-muted-foreground mt-1">{appointment.description}</p>
                  )}
                  <p className="text-sm mt-2">
                    <strong>Start:</strong> {new Date(appointment.startTime).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <strong>End:</strong> {new Date(appointment.endTime).toLocaleString()}
                  </p>
                </Card>
              ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
          <div className="space-y-4">
            {past
              .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
              .map((appointment) => (
                <Card key={appointment.id} className="p-6 opacity-75">
                  <h3 className="text-lg font-semibold">{appointment.title}</h3>
                  {appointment.description && (
                    <p className="text-muted-foreground mt-1">{appointment.description}</p>
                  )}
                  <p className="text-sm mt-2">
                    {new Date(appointment.startTime).toLocaleString()}
                  </p>
                </Card>
              ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <Card className="p-6">
          <p className="text-muted-foreground">No appointments found</p>
        </Card>
      )}
    </div>
  );
}

