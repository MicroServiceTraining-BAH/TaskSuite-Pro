"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@tasksuite/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@tasksuite/ui";
import { getJobs, updateJob } from "@/lib/api";
import { auth } from "@/lib/auth";
import { CleaningChecklist } from "@/components/jobs/cleaning-checklist";
import { FlooringMaterials } from "@/components/jobs/flooring-materials";
import { PhotoUpload } from "@/components/jobs/photo-upload";
import { getJobPhotos } from "@/lib/api";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [job, setJob] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function loadJob() {
    try {
      const jobs = await getJobs() as any[];
      const foundJob = jobs.find((j) => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
        // Load photos separately
        try {
          const jobPhotos = await getJobPhotos(jobId);
          setPhotos(jobPhotos as any[]);
        } catch (error) {
          console.error("Failed to load photos:", error);
          setPhotos([]);
        }
      } else {
        router.push("/jobs");
      }
    } catch (error) {
      console.error("Failed to load job:", error);
      router.push("/jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    try {
      await updateJob(jobId, { status: newStatus });
      await loadJob();
    } catch (error) {
      console.error("Failed to update job:", error);
    }
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  const user = auth.getUser();
  const companyId = user && "companyId" in user ? user.companyId : "";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push("/jobs")}>
            ← Back to Jobs
          </Button>
          <h1 className="text-3xl font-bold mt-2">{job.title}</h1>
          <p className="text-muted-foreground">
            Client: {job.client?.name || "-"} | Status: {job.status}
          </p>
        </div>
        <div className="flex gap-2">
          {job.status === "pending" && (
            <Button onClick={() => handleStatusChange("in_progress")}>
              Start Job
            </Button>
          )}
          {job.status === "in_progress" && (
            <Button onClick={() => handleStatusChange("completed")}>
              Complete Job
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p>{job.description || "No description"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Job Type</label>
              <p className="capitalize">{job.jobType || "Not specified"}</p>
            </div>
            {job.estimate && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estimate</label>
                <p>{job.estimate.title} - ${job.estimate.amount?.toFixed(2)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {(job.jobType?.toLowerCase().includes("clean") || (job.cleaningChecklist && job.cleaningChecklist.length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle>Cleaning Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <CleaningChecklist
                jobId={jobId}
                companyId={companyId}
                initialItems={job.cleaningChecklist || []}
              />
            </CardContent>
          </Card>
        )}

        {(job.jobType?.toLowerCase().includes("floor") || (job.flooringMaterials && job.flooringMaterials.length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle>Materials Used</CardTitle>
            </CardHeader>
            <CardContent>
              <FlooringMaterials
                jobId={jobId}
                companyId={companyId}
                initialMaterials={job.flooringMaterials || []}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload
            jobId={jobId}
            photos={photos}
            onPhotosChange={(newPhotos) => {
              setPhotos(newPhotos);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

