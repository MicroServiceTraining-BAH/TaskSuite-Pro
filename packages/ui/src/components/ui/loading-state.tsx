import * as React from "react";
import { Spinner } from "./spinner";
import { cn } from "../../lib/utils";

export interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  spinner?: React.ReactNode;
  className?: string;
  emptyState?: React.ReactNode;
}

export function LoadingState({
  isLoading,
  children,
  spinner,
  className,
  emptyState,
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-6", className)}>
        {spinner || (
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

export function LoadingPage({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

