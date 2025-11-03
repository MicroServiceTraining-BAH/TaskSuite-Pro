"use client";

import { useEffect, useState } from "react";
import { getClientEstimates } from "@/lib/api";
import { Card } from "@tasksuite/ui";

export default function ClientEstimatesPage() {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getClientEstimates();
        setEstimates(data as any[]);
      } catch (error) {
        console.error("Failed to load estimates:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Estimates</h1>

      {estimates.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground">No estimates found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {estimates.map((estimate) => (
            <Card key={estimate.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{estimate.title}</h3>
                  {estimate.description && (
                    <p className="text-muted-foreground mt-1">{estimate.description}</p>
                  )}
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-sm ${
                      estimate.status === "accepted" ? "bg-green-100 text-green-800" :
                      estimate.status === "converted" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {estimate.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${estimate.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created {new Date(estimate.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

