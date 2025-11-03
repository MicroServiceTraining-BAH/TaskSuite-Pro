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
import {
  getEstimates,
  convertEstimateToJob,
} from "@/lib/api";

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const estimatesData = await getEstimates() as any[];
      setEstimates(estimatesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConvertToJob(id: string) {
    try {
      await convertEstimateToJob(id);
      await loadData();
    } catch (error) {
      console.error("Failed to convert estimate:", error);
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Estimates</h1>

      <div className="rounded-lg border">
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
                  <TableCell>{estimate.title}</TableCell>
                  <TableCell>{estimate.client?.name || "-"}</TableCell>
                  <TableCell>${estimate.amount.toFixed(2)}</TableCell>
                  <TableCell>{estimate.status}</TableCell>
                  <TableCell className="text-right">
                    {estimate.status !== "converted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConvertToJob(estimate.id)}
                      >
                        Convert to Job
                      </Button>
                    )}
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

