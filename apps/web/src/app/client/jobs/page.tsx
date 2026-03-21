"use client";

import { useEffect, useState } from "react";
import { getClientJobs } from "@/lib/api";
import { Card } from "@tasksuite/ui";

export default function ClientJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getClientJobs();
        setJobs(data as any[]);
      } catch (error) {
        console.error("Failed to load jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Jobs</h1>

      {jobs.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground">No jobs found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  {job.description && (
                    <p className="text-muted-foreground mt-1">{job.description}</p>
                  )}
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-sm ${
                      job.status === "completed" ? "bg-green-100 text-green-800" :
                      job.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                      job.status === "cancelled" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                  {job.company && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {job.company.name}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

