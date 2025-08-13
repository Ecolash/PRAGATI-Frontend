"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  QrCode,
  Camera,
  X,
  CheckCircle,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
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
  const [, setCameraId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = async () => {
    setIsScanning(true);
    setError("");

    try {
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);

      if (devices.length > 0) {
        const id = devices[currentCameraIndex % devices.length].id;
        setCameraId(id);

        scannerRef.current = new Html5Qrcode("qr-reader");
        await scannerRef.current.start(
          id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            setLastScannedData(decodedText);
            onScanSuccess?.(decodedText);
            stopScanning();
          },
          (errorMessage) => {
            if (!errorMessage.includes("No MultiFormat Readers")) {
              console.warn("QR scan error:", errorMessage);
            }
          },
        );
      } else {
        setError("No camera found.");
      }
    } catch (err: any) {
      setError(err.message || "Camera access error");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (error) {
        console.warn("Error stopping scanner:", error);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const flipCamera = async () => {
    if (cameras.length > 1) {
      await stopScanning();
      setCurrentCameraIndex((prev) => (prev + 1) % cameras.length);
      setTimeout(startScanning, 300);
    }
  };

  const uploadFromGallery = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      const result = await html5QrCode.scanFile(file, true);
      setLastScannedData(result);
      onScanSuccess?.(result);
      html5QrCode.clear();
    } catch (err: any) {
      setError("No QR code found in the image.");
      console.error(err);
    }
  };

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
            className={`w-full ${isScanning ? "block" : "hidden"} rounded-lg overflow-hidden`}
            style={{ minHeight: "250px" }}
          />

          {!isScanning && (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Ready to scan QR codes</p>
              </div>
            </div>
          )}

          {/* Floating Buttons */}
          {isScanning && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 mb-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={flipCamera}
                disabled={cameras.length <= 1}
                className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center p-0"
              >
                <RefreshCw className="h-5 w-5 text-gray-700" />
              </Button>

              <label className="w-10 h-10 rounded-full bg-white shadow cursor-pointer flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-gray-700" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadFromGallery}
                />
              </label>
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
      </CardContent>
    </Card>
  );
}
