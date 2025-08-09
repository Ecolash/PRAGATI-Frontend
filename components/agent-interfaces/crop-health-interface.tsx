"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CropHealthInterface() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-purple-700">
            Crop Health Analysis Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-purple-50 rounded-lg flex items-center justify-center">
            <p className="text-purple-600">
              Specialized UI for Crop Health Analysis
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
