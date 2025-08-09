"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CropYieldInterface() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-emerald-700">
            Crop Yield Prediction Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-emerald-50 rounded-lg flex items-center justify-center">
            <p className="text-emerald-600">
              Specialized UI for Crop Yield Prediction
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
