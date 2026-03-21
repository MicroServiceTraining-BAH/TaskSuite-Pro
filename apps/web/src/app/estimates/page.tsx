"use client";

import { useState, useEffect } from "react";
import { Button, Spinner } from "@tasksuite/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tasksuite/ui";
import {
  getEstimates,
  createEstimate,
  updateEstimate,
  deleteEstimate,
  convertEstimateToJob,
} from "@/lib/api";
import { EstimateDialog } from "@/components/estimates/estimate-dialog";
import { SearchBar } from "@/components/search-bar";

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [allEstimates, setAllEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      console.log("Loading estimates...");
      const estimatesData = await getEstimates() as any[];
      console.log("Estimates loaded:", estimatesData?.length || 0, estimatesData);
      setAllEstimates(estimatesData || []);
      filterEstimates(estimatesData || [], searchQuery);
    } catch (error) {
      console.error("Failed to load data:", error);
      setAllEstimates([]);
      setEstimates([]);
    } finally {
      setLoading(false);
    }
  }

  function filterEstimates(data: any[], query: string) {
    if (!query.trim()) {
      setEstimates(data);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = data.filter((estimate) => {
      return (
        estimate.title?.toLowerCase().includes(lowerQuery) ||
        estimate.client?.name?.toLowerCase().includes(lowerQuery) ||
        estimate.description?.toLowerCase().includes(lowerQuery) ||
        estimate.status?.toLowerCase().includes(lowerQuery) ||
        estimate.amount?.toString().includes(lowerQuery)
      );
    });
    setEstimates(filtered);
  }

  useEffect(() => {
    filterEstimates(allEstimates, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  async function handleCreate(data: any) {
    setSaving(true);
    setError(null);
    try {
      await createEstimate(data);
      await loadData();
      setIsDialogOpen(false);
      setEditingEstimate(null);
    } catch (error: any) {
      console.error("Failed to create estimate:", error);
      setError(error?.message || "Failed to create estimate. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, data: any) {
    setSaving(true);
    setError(null);
    try {
      await updateEstimate(id, data);
      await loadData();
      setIsDialogOpen(false);
      setEditingEstimate(null);
    } catch (error: any) {
      console.error("Failed to update estimate:", error);
      setError(error?.message || "Failed to update estimate. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this estimate?")) return;
    try {
      await deleteEstimate(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete estimate:", error);
    }
  }

  async function handleConvertToJob(id: string) {
    try {
      await convertEstimateToJob(id);
      await loadData();
    } catch (error: any) {
      console.error("Failed to convert estimate:", error);
      alert(error?.message || "Failed to convert estimate. The estimate must be approved by the client first.");
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-28 rounded-lg bg-muted" />
          <div className="h-9 w-28 rounded-lg bg-muted" />
        </div>
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Estimates</h1>
        <Button onClick={() => {
          setEditingEstimate(null);
          setIsDialogOpen(true);
        }}>
          Add Estimate
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar
          placeholder="Search estimates by title, client, status, or amount..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Mobile: Card view, Desktop: Table view */}
      <div className="block lg:hidden space-y-4">
        {estimates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No estimates found</div>
        ) : (
          estimates.map((estimate) => (
            <div key={estimate.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{estimate.title}</div>
                  {(estimate.serviceType?.name || estimate.estimateType) && (
                    <div className="text-sm text-muted-foreground capitalize mt-1">
                      {estimate.serviceType?.name || estimate.estimateType}
                    </div>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                  estimate.status === "accepted" ? "bg-green-100 text-green-800" :
                  estimate.status === "sent" ? "bg-blue-100 text-blue-800" :
                  estimate.status === "rejected" ? "bg-red-100 text-red-800" :
                  estimate.status === "converted" ? "bg-purple-100 text-purple-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {estimate.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Client:</span> {estimate.client?.name || "-"}
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span> ${estimate.amount.toFixed(2)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 min-w-[80px]"
                  onClick={() => {
                    setEditingEstimate(estimate);
                    setIsDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 min-w-[80px]"
                  onClick={() => handleDelete(estimate.id)}
                >
                  Delete
                </Button>
                {estimate.status === "accepted" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-[120px]"
                    onClick={() => handleConvertToJob(estimate.id)}
                  >
                    Convert to Job
                  </Button>
                )}
                {estimate.status !== "converted" && estimate.status !== "accepted" && (
                  <div className="flex-1 min-w-[120px] text-xs text-muted-foreground text-center py-2">
                    {estimate.status === "draft" || estimate.status === "sent" 
                      ? "Waiting for approval" 
                      : estimate.status === "rejected"
                      ? "Rejected by client"
                      : "Cannot convert"}
                  </div>
                )}
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
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estimates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No estimates found
                </TableCell>
              </TableRow>
            ) : (
              estimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{estimate.title}</div>
                      {(estimate.serviceType?.name || estimate.estimateType) && (
                        <div className="text-sm text-muted-foreground capitalize">
                          {estimate.serviceType?.name || estimate.estimateType}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{estimate.client?.name || "-"}</TableCell>
                  <TableCell>${estimate.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm ${
                      estimate.status === "accepted" ? "bg-green-100 text-green-800" :
                      estimate.status === "sent" ? "bg-blue-100 text-blue-800" :
                      estimate.status === "rejected" ? "bg-red-100 text-red-800" :
                      estimate.status === "converted" ? "bg-purple-100 text-purple-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {estimate.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingEstimate(estimate);
                          setIsDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(estimate.id)}
                      >
                        Delete
                      </Button>
                      {estimate.status === "accepted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConvertToJob(estimate.id)}
                        >
                          Convert to Job
                        </Button>
                      )}
                      {estimate.status !== "converted" && estimate.status !== "accepted" && (
                        <span className="text-xs text-muted-foreground px-2 py-1">
                          {estimate.status === "draft" || estimate.status === "sent" 
                            ? "Waiting for approval" 
                            : estimate.status === "rejected"
                            ? "Rejected"
                            : ""}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EstimateDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setError(null);
            setEditingEstimate(null);
          }
        }}
        estimate={editingEstimate}
        onSave={(data) => {
          if (editingEstimate) {
            handleUpdate(editingEstimate.id, data);
          } else {
            handleCreate(data);
          }
        }}
        saving={saving}
        error={error}
      />
    </div>
  );
}

