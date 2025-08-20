"use client";

import { useEffect, useState } from "react";
import { agriculturalAPI } from "@/lib/agricultural-api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface APIStatus {
  isOnline: boolean;
  lastChecked: Date;
}

export function APIHealthCheck() {
  const [status, setStatus] = useState<APIStatus>({
    isOnline: false,
    lastChecked: new Date(),
  });

  const checkHealth = async () => {
    try {
      await agriculturalAPI.healthCheck();
      setStatus({
        isOnline: true,
        lastChecked: new Date(),
      });
    } catch {
      setStatus({
        isOnline: false,
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={checkHealth}
          className="flex items-center gap-2 cursor-pointer bg-slate-200 px-2 py-1 rounded-2xl"
        >
          <div
            className={`relative h-3 w-3 rounded-full ${
              status.isOnline ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {/* Pulse ring */}
            <span
              className={`absolute inset-0 rounded-full opacity-75 animate-ping ${
                status.isOnline ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
          </div>

          {/* Show text label only on larger devices */}
          <span
            className={`hidden sm:inline text-sm font-medium ${
              status.isOnline ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {status.isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          Backend is {status.isOnline ? "online" : "offline"} <br />
          Last checked: {status.lastChecked.toLocaleTimeString()}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
