"use client";

import { useState, useEffect } from "react";
import { Button } from "@tasksuite/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tasksuite/ui";
import { getTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry, getJobs, getUsers } from "@/lib/api";

export default function TimeEntriesPage() {
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [entriesData, jobsData, usersData] = await Promise.all([
        getTimeEntries(),
        getJobs(),
        getUsers(),
      ]);
      setTimeEntries(entriesData as any[]);
      setJobs(jobsData as any[]);
      setUsers(usersData as any[]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data: any) {
    try {
      if (editingEntry) {
        await updateTimeEntry(editingEntry.id, data);
      } else {
        await createTimeEntry(data);
      }
      await loadData();
      setIsDialogOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error("Failed to save time entry:", error);
      alert("Failed to save time entry");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this time entry?")) return;
    try {
      await deleteTimeEntry(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete time entry:", error);
      alert("Failed to delete time entry");
    }
  }

  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const billableHours = timeEntries.filter(e => e.billable).reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <span>Total Hours: <span className="font-semibold">{totalHours.toFixed(2)}</span></span>
            <span>Billable Hours: <span className="font-semibold">{billableHours.toFixed(2)}</span></span>
          </div>
        </div>
        <Button onClick={() => { setEditingEntry(null); setIsDialogOpen(true); }}>
          + Log Time
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Billable</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No time entries found
                </TableCell>
              </TableRow>
            ) : (
              timeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.job?.title || "-"}</TableCell>
                  <TableCell>{entry.user?.name || entry.user?.email || "-"}</TableCell>
                  <TableCell>{entry.description || "-"}</TableCell>
                  <TableCell>{entry.hours.toFixed(2)}</TableCell>
                  <TableCell>{entry.billable ? "Yes" : "No"}</TableCell>
                  <TableCell>{entry.rate ? `$${entry.rate.toFixed(2)}/hr` : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingEntry(entry); setIsDialogOpen(true); }}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isDialogOpen && (
        <TimeEntryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          entry={editingEntry}
          jobs={jobs}
          users={users}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TimeEntryDialog({ open, onOpenChange, entry, jobs, users, onSave }: any) {
  const [formData, setFormData] = useState({
    jobId: "",
    userId: "",
    description: "",
    hours: "",
    date: new Date().toISOString().split('T')[0],
    billable: true,
    rate: "",
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        jobId: entry.jobId || "",
        userId: entry.userId || "",
        description: entry.description || "",
        hours: entry.hours?.toString() || "",
        date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        billable: entry.billable !== undefined ? entry.billable : true,
        rate: entry.rate?.toString() || "",
      });
    } else {
      setFormData({
        jobId: "",
        userId: "",
        description: "",
        hours: "",
        date: new Date().toISOString().split('T')[0],
        billable: true,
        rate: "",
      });
    }
  }, [entry, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...formData,
      hours: parseFloat(formData.hours) || 0,
      rate: formData.rate ? parseFloat(formData.rate) : undefined,
    });
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${open ? "" : "hidden"}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{entry ? "Edit Time Entry" : "Log Time"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Job *</label>
            <select
              value={formData.jobId}
              onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select job...</option>
              {jobs.map((job: any) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">User *</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select user...</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hours *</label>
            <input
              type="number"
              step="0.25"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hourly Rate</label>
            <input
              type="number"
              step="0.01"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Optional"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="billable"
              checked={formData.billable}
              onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="billable" className="text-sm font-medium">Billable</label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

