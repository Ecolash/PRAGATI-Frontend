"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CropRecommendationsInterface() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">
            Crop Recommendations Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-green-50 rounded-lg flex items-center justify-center">
            <p className="text-green-600">
              Specialized UI for Crop Recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
