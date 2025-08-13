/* eslint-disable prettier/prettier */
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Camera, X, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QRScannerProps {
  onScanSuccess?: (qrData: string) => void;
  onScanError?: (error: string) => void;
  onClose?: () => void;
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedData, setLastScannedData] = useState<string>("");
  const [error, setError] = useState<string>("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const startScanning = () => {
    setIsScanning(true);
    setError("");

    // Clear any existing scanner
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        console.log("QR Code scanned:", decodedText);
        setLastScannedData(decodedText);
        onScanSuccess?.(decodedText);

        // Auto-stop scanning after successful scan
        stopScanning();
      },
      (errorMessage) => {
        // Don't show every scan attempt error, only real issues
        if (!errorMessage.includes("No MultiFormat Readers")) {
          console.warn("QR scan error:", errorMessage);
        }
      }
    );
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.warn("Error clearing scanner:", error);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  //   const handleError = (errorMsg: string) => {
  //     setError(errorMsg);
  //     onScanError?.(errorMsg);
  //   };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-emerald-600" />
          <CardTitle>QR Code Scanner</CardTitle>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Scanner Area */}
        <div className="relative">
          <div
            id="qr-reader"
            className={`w-full ${isScanning ? "block" : "hidden"}`}
          />

          {!isScanning && (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Ready to scan QR codes</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Last Scanned Data */}
        {lastScannedData && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Last Scanned:</div>
              <div className="text-sm break-all mt-1">{lastScannedData}</div>
            </AlertDescription>
          </Alert>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={startScanning}
            disabled={isScanning}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Scanning...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Start Scanner
              </>
            )}
          </Button>

          {isScanning && (
            <Button onClick={stopScanning} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Point your camera at a QR code</p>
          <p>• Make sure the QR code is well-lit and in focus</p>
          <p>• Keep the camera steady for best results</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Example usage component
export function QRScannerDemo() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<string[]>([]);

  const handleScanSuccess = (data: string) => {
    console.log("Scanned QR data:", data);
    setScannedData((prev) => [data, ...prev.slice(0, 4)]); // Keep last 5 scans

    // You can handle different types of QR codes here
    if (data.startsWith("http")) {
      // Handle URL QR codes
      console.log("URL detected:", data);
    } else if (data.includes("SEED_") || data.includes("FERT_")) {
      // Handle agricultural product codes
      console.log("Agricultural product detected:", data);
    } else {
      // Handle other QR codes
      console.log("General QR code:", data);
    }
  };

  const handleScanError = (error: string) => {
    console.error("QR scan error:", error);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowScanner(true)}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <QrCode className="h-4 w-4 mr-2" />
        Open QR Scanner
      </Button>

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            onClose={() => setShowScanner(false)}
          />
        </div>
      )}

      {/* Display recent scans */}
      {scannedData.length > 0 && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-base">Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scannedData.map((data, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50 rounded text-sm break-all"
                >
                  {data}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
