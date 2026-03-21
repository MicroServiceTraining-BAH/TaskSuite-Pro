"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicEstimate, approvePublicEstimate, rejectPublicEstimate } from "@/lib/api";
import { Card, Button, Spinner } from "@tasksuite/ui";

export default function PublicEstimatePage() {
  const params = useParams();
  const token = params?.token as string;
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (token) {
      loadEstimate();
    }
  }, [token]);

  async function loadEstimate() {
    try {
      setLoading(true);
      const data = await getPublicEstimate(token);
      setEstimate(data);
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Failed to load estimate" });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!confirm("Are you sure you want to approve this estimate?")) return;
    
    try {
      setActionLoading(true);
      setMessage(null);
      await approvePublicEstimate(token);
      setMessage({ type: "success", text: "Estimate approved successfully!" });
      await loadEstimate(); // Reload to show updated status
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Failed to approve estimate" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!confirm("Are you sure you want to reject this estimate?")) return;
    
    try {
      setActionLoading(true);
      setMessage(null);
      await rejectPublicEstimate(token);
      setMessage({ type: "success", text: "Estimate rejected successfully!" });
      await loadEstimate(); // Reload to show updated status
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Failed to reject estimate" });
    } finally {
      setActionLoading(false);
    }
  }

  if (!estimate) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Estimate Not Found</h1>
          <p className="text-muted-foreground">
            The estimate you're looking for doesn't exist or the link is invalid.
          </p>
        </Card>
      </div>
    );
  }

  const canApprove = estimate.status === "draft" || estimate.status === "sent";
  const canReject = estimate.status === "draft" || estimate.status === "sent";
  const isAccepted = estimate.status === "accepted";
  const isRejected = estimate.status === "rejected";
  const isConverted = estimate.status === "converted";

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Estimate Details</h1>
        <p className="text-muted-foreground">
          From: <strong>{estimate.company?.name || "Company"}</strong>
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{estimate.title}</h2>
            {estimate.description && (
              <p className="text-muted-foreground">{estimate.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              estimate.status === "accepted" ? "bg-green-100 text-green-800" :
              estimate.status === "rejected" ? "bg-red-100 text-red-800" :
              estimate.status === "converted" ? "bg-blue-100 text-blue-800" :
              estimate.status === "sent" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
            </span>
          </div>

          {estimate.lineItems && estimate.lineItems.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Line Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Tax Rate</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {estimate.lineItems.map((item: any, index: number) => {
                      const itemTotal = item.quantity * item.unitPrice;
                      const itemTax = itemTotal * (item.taxRate || 0);
                      const itemTotalWithTax = itemTotal + itemTax;
                      return (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-right">{(item.taxRate * 100).toFixed(1)}%</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">${itemTotalWithTax.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">${estimate.amount.toFixed(2)}</span>
            </div>
            {estimate.taxRate > 0 && (
              <p className="text-sm text-muted-foreground mt-1 text-right">
                Includes tax ({(estimate.taxRate * 100).toFixed(1)}%)
              </p>
            )}
          </div>
        </div>
      </Card>

      {canApprove || canReject ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="flex gap-4">
            {canApprove && (
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  "Approve Estimate"
                )}
              </Button>
            )}
            {canReject && (
              <Button
                onClick={handleReject}
                disabled={actionLoading}
                variant="outline"
                className="flex-1"
              >
                {actionLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  "Reject Estimate"
                )}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="text-center">
            {isAccepted && (
              <p className="text-green-600 font-medium">
                ✓ This estimate has been approved.
              </p>
            )}
            {isRejected && (
              <p className="text-red-600 font-medium">
                ✗ This estimate has been rejected.
              </p>
            )}
            {isConverted && (
              <p className="text-blue-600 font-medium">
                This estimate has been converted to a job.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

