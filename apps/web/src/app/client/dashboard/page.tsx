"use client";

import { useEffect, useState } from "react";
import { getClientEstimates, getClientJobs, getClientInvoices, getClientAppointments } from "@/lib/api";
import { Card } from "@tasksuite/ui";

export default function ClientDashboardPage() {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [estimatesData, jobsData, invoicesData, appointmentsData] = await Promise.all([
          getClientEstimates(),
          getClientJobs(),
          getClientInvoices(),
          getClientAppointments(),
        ]);
        setEstimates(estimatesData as any[]);
        setJobs(jobsData as any[]);
        setInvoices(invoicesData as any[]);
        setAppointments(appointmentsData as any[]);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  const pendingEstimates = estimates.filter((e) => e.status === "draft" || e.status === "sent");
  const activeJobs = jobs.filter((j) => j.status === "pending" || j.status === "in_progress");
  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const upcomingAppointments = appointments.filter((a) => new Date(a.startTime) > new Date());

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Client Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Estimates</h3>
          <p className="text-2xl font-bold">{pendingEstimates.length}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Active Jobs</h3>
          <p className="text-2xl font-bold">{activeJobs.length}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Outstanding Invoices</h3>
          <p className="text-2xl font-bold">
            ${pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Upcoming Appointments</h3>
          <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Estimates</h2>
          {pendingEstimates.length === 0 ? (
            <p className="text-muted-foreground">No pending estimates</p>
          ) : (
            <div className="space-y-2">
              {pendingEstimates.slice(0, 5).map((estimate) => (
                <div key={estimate.id} className="border-b pb-2">
                  <p className="font-medium">{estimate.title}</p>
                  <p className="text-sm text-muted-foreground">
                    ${estimate.amount.toFixed(2)} - {estimate.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Active Jobs</h2>
          {activeJobs.length === 0 ? (
            <p className="text-muted-foreground">No active jobs</p>
          ) : (
            <div className="space-y-2">
              {activeJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="border-b pb-2">
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{job.status}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Pending Invoices</h2>
          {pendingInvoices.length === 0 ? (
            <p className="text-muted-foreground">No pending invoices</p>
          ) : (
            <div className="space-y-2">
              {pendingInvoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="border-b pb-2">
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    ${invoice.amount.toFixed(2)} - Due{" "}
                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="text-muted-foreground">No upcoming appointments</p>
          ) : (
            <div className="space-y-2">
              {upcomingAppointments
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .slice(0, 5)
                .map((appointment) => (
                  <div key={appointment.id} className="border-b pb-2">
                    <p className="font-medium">{appointment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.startTime).toLocaleString()}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

