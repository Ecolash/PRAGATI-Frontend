"use client";

import { useEffect, useState } from "react";
import { agriculturalAPI } from "@/lib/agricultural-api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface APIStatus {
  isOnline: boolean;
  message: string;
  lastChecked: Date;
}

export function APIHealthCheck() {
  const [status, setStatus] = useState<APIStatus>({
    isOnline: false,
    message: "Checking...",
    lastChecked: new Date(),
  });

  const checkHealth = async () => {
    try {
      const response = await agriculturalAPI.healthCheck();
      setStatus({
        isOnline: true,
        message: `${response.service} is healthy`,
        lastChecked: new Date(),
      });
    } catch {
      setStatus({
        isOnline: false,
        message: "Agricultural API is offline",
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <Alert>
        <AlertDescription className="flex items-center gap-2">
          <Badge variant={status.isOnline ? "default" : "destructive"}>
            {status.isOnline ? "Online" : "Offline"}
          </Badge>
          <span>{status.message}</span>
          <span className="text-xs text-muted-foreground ml-auto">
            Last checked: {status.lastChecked.toLocaleTimeString()}
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
}
