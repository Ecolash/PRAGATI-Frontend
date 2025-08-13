"use client";

import { useState } from "react";
import { ArrowLeft, Scan, History, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRScanner } from "@/components/qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScannedItem {
  id: string;
  data: string;
  timestamp: Date;
  type: "url" | "text" | "agricultural" | "unknown";
}

export default function QRScannerPage() {
  const router = useRouter();
  const [scannedHistory, setScannedHistory] = useState<ScannedItem[]>([]);
  const [currentScan, setCurrentScan] = useState<ScannedItem | null>(null);

  const detectQRType = (data: string): ScannedItem["type"] => {
    if (data.startsWith("http://") || data.startsWith("https://")) {
      return "url";
    } else if (
      data.includes("SEED_") ||
      data.includes("FERT_") ||
      data.includes("AGRI_")
    ) {
      return "agricultural";
    } else if (data.length > 0) {
      return "text";
    }
    return "unknown";
  };

  const handleScanSuccess = (data: string) => {
    const newScan: ScannedItem = {
      id: Date.now().toString(),
      data,
      timestamp: new Date(),
      type: detectQRType(data),
    };

    setCurrentScan(newScan);
    setScannedHistory((prev) => [newScan, ...prev.slice(0, 9)]); // Keep last 10 scans

    // Handle different types of QR codes
    if (newScan.type === "url") {
      // For URLs, you might want to ask user before opening
      console.log("URL detected:", data);
    } else if (newScan.type === "agricultural") {
      // For agricultural codes, you could fetch product info
      console.log("Agricultural product detected:", data);
    }
  };

  const handleScanError = (error: string) => {
    console.error("QR Scan Error:", error);
  };

  const getTypeColor = (type: ScannedItem["type"]) => {
    switch (type) {
      case "url":
        return "bg-blue-100 text-blue-800";
      case "agricultural":
        return "bg-green-100 text-green-800";
      case "text":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getTypeIcon = (type: ScannedItem["type"]) => {
    switch (type) {
      case "url":
        return "🔗";
      case "agricultural":
        return "🌾";
      case "text":
        return "📄";
      default:
        return "❓";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              QR Code Scanner
            </h1>
            <p className="text-gray-600">
              Scan QR codes to get agricultural information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-emerald-600" />
                  Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QRScanner
                  onScanSuccess={handleScanSuccess}
                  onScanError={handleScanError}
                />
              </CardContent>
            </Card>

            {/* Current Scan Result */}
            {currentScan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Latest Scan Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getTypeIcon(currentScan.type)}
                    </span>
                    <Badge className={getTypeColor(currentScan.type)}>
                      {currentScan.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {currentScan.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-mono break-all">
                      {currentScan.data}
                    </p>
                  </div>

                  {currentScan.type === "url" && (
                    <Button
                      onClick={() => window.open(currentScan.data, "_blank")}
                      className="w-full"
                      variant="outline"
                    >
                      Open URL
                    </Button>
                  )}

                  {currentScan.type === "agricultural" && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Agricultural product detected! This could contain
                        information about seeds, fertilizers, or farming
                        products.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* History Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-600" />
                  Scan History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scannedHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No scans yet. Start by scanning a QR code!
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {scannedHistory.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setCurrentScan(item)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">
                            {getTypeIcon(item.type)}
                          </span>
                          <Badge
                            className={`${getTypeColor(item.type)} text-xs`}
                          >
                            {item.type}
                          </Badge>
                          <span className="text-xs text-gray-500 ml-auto">
                            {item.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-mono text-gray-700 truncate">
                          {item.data}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usage Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>Point your camera directly at the QR code</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>Ensure good lighting for better scanning</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>Keep the camera steady until scan completes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>
                    QR codes on seed packets and fertilizer bags work best
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
