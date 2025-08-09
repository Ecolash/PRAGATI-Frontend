"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WeatherAdvisoryInterface() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sky-700">
            Weather Advisory Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-sky-50 rounded-lg flex items-center justify-center">
            <p className="text-sky-600">Specialized UI for Weather Advisory</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
