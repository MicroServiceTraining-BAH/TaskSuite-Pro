"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from "@tasksuite/ui";
import { getJobs, updateJob } from "@/lib/api";
import { SearchBar } from "@/components/search-bar";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadJobs() {
    try {
      const data = await getJobs() as any[];
      setAllJobs(data);
      filterJobs(data, searchQuery);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterJobs(data: any[], query: string) {
    if (!query.trim()) {
      setJobs(data);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = data.filter((job) => {
      return (
        job.title?.toLowerCase().includes(lowerQuery) ||
        job.client?.name?.toLowerCase().includes(lowerQuery) ||
        job.status?.toLowerCase().includes(lowerQuery) ||
        job.description?.toLowerCase().includes(lowerQuery)
      );
    });
    setJobs(filtered);
  }

  useEffect(() => {
    filterJobs(allJobs, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  function getValidStatusTransitions(currentStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      pending: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };
    return transitions[currentStatus] || [];
  }

  async function handleStatusChange(id: string, currentStatus: string, newStatus: string) {
    // Don't do anything if status hasn't changed
    if (currentStatus === newStatus) {
      return;
    }

    // Validate the transition before making the API call
    const validTransitions = getValidStatusTransitions(currentStatus);
    if (!validTransitions.includes(newStatus)) {
      alert(`Invalid status transition from ${currentStatus} to ${newStatus}`);
      return;
    }

    try {
      await updateJob(id, { status: newStatus });
      await loadJobs();
    } catch (error: any) {
      console.error("Failed to update job:", error);
      // Parse error message from API response
      let errorMessage = "Failed to update job status";
      if (error.message) {
        // Try to parse JSON error from the error message
        // Format: "API request failed: Bad Request - {"message":"...","error":"...","statusCode":400}"
        try {
          const jsonMatch = error.message.match(/\{.*\}/);
          if (jsonMatch) {
            const errorObj = JSON.parse(jsonMatch[0]);
            errorMessage = errorObj.message || error.message;
          } else {
            errorMessage = error.message;
          }
        } catch {
          // If parsing fails, use the original message
          errorMessage = error.message;
        }
      }
      alert(errorMessage);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-8 w-16 rounded-lg bg-muted" />
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="h-4 w-1/6 rounded bg-muted" />
              <div className="ml-auto h-6 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Jobs</h1>

      <div className="mb-4">
        <SearchBar
          placeholder="Search jobs by title, client, status, or description..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Mobile: Card view, Desktop: Table view */}
      <div className="block lg:hidden space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No jobs found</div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{job.title}</div>
                  {job.jobType && (
                    <div className="text-sm text-muted-foreground capitalize mt-1">
                      {job.jobType}
                    </div>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                  job.status === "completed" ? "bg-green-100 text-green-800" :
                  job.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                  job.status === "cancelled" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {job.status === "pending" && "Pending"}
                  {job.status === "in_progress" && "In Progress"}
                  {job.status === "completed" && "Completed"}
                  {job.status === "cancelled" && "Cancelled"}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Client:</span> {job.client?.name || "-"}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 min-w-[100px]"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                >
                  View
                </Button>
                <select
                  value={job.status}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    handleStatusChange(job.id, job.status, event.target.value)
                  }
                  className="flex-1 min-w-[120px] rounded border px-2 py-1 text-sm"
                  disabled={getValidStatusTransitions(job.status).length === 0}
                >
                  <option value={job.status}>
                    {job.status === "pending" && "Pending"}
                    {job.status === "in_progress" && "In Progress"}
                    {job.status === "completed" && "Completed"}
                    {job.status === "cancelled" && "Cancelled"}
                  </option>
                  {getValidStatusTransitions(job.status).map((status) => (
                    <option key={status} value={status}>
                      {status === "pending" && "Pending"}
                      {status === "in_progress" && "In Progress"}
                      {status === "completed" && "Completed"}
                      {status === "cancelled" && "Cancelled"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden lg:block rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.title}</div>
                      {job.jobType && (
                        <div className="text-sm text-muted-foreground capitalize">
                          {job.jobType}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{job.client?.name || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm ${
                      job.status === "completed" ? "bg-green-100 text-green-800" :
                      job.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                      job.status === "cancelled" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {job.status === "pending" && "Pending"}
                      {job.status === "in_progress" && "In Progress"}
                      {job.status === "completed" && "Completed"}
                      {job.status === "cancelled" && "Cancelled"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                      >
                        View
                      </Button>
                      <select
                        value={job.status}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          handleStatusChange(job.id, job.status, event.target.value)
                        }
                        className="rounded border px-2 py-1"
                        disabled={getValidStatusTransitions(job.status).length === 0}
                      >
                        <option value={job.status}>
                          {job.status === "pending" && "Pending"}
                          {job.status === "in_progress" && "In Progress"}
                          {job.status === "completed" && "Completed"}
                          {job.status === "cancelled" && "Cancelled"}
                        </option>
                        {getValidStatusTransitions(job.status).map((status) => (
                          <option key={status} value={status}>
                            {status === "pending" && "Pending"}
                            {status === "in_progress" && "In Progress"}
                            {status === "completed" && "Completed"}
                            {status === "cancelled" && "Cancelled"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
