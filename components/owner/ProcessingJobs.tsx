"use client";

import { ProcessingJob } from "@/lib/photogrammetry";

interface ProcessingJobsProps {
  userId: string;
  storeId: string;
  jobs: ProcessingJob[];
}

export default function ProcessingJobs({ jobs }: ProcessingJobsProps) {
  if (jobs.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-2 text-sm font-semibold text-slate-300">3D Mesh Jobs</h3>
      <ul className="space-y-2">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="rounded-lg border border-white/10 bg-slate-800/50 p-3 text-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{job.id}</span>
              <span
                className={`text-xs capitalize ${
                  job.status === "completed"
                    ? "text-green-400"
                    : job.status === "failed"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {job.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              processor: {job.processor ?? "placeholder"}
            </p>
            {job.outputUrl && (
              <p className="mt-1 truncate text-xs text-slate-400">{job.outputUrl.slice(0, 60)}…</p>
            )}
            {job.error && <p className="mt-1 text-xs text-red-400">{job.error}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
