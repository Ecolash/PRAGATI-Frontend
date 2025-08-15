"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, RefreshCw, X, ImageIcon } from "lucide-react";

interface SimpleCameraProps {
  onCapture?: (dataUrl: string) => void;
  onClose?: () => void;
}

export function SimpleCamera({ onCapture, onClose }: SimpleCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState("");

  const startCamera = async (index = currentCameraIndex) => {
    setError("");
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setCameras(videoDevices);

      if (videoDevices.length === 0) {
        setError("No camera found");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: videoDevices[index]?.deviceId },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Unable to access camera");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    setIsActive(false);
  };

  const flipCamera = async () => {
    if (cameras.length > 1) {
      const nextIndex = (currentCameraIndex + 1) % cameras.length;
      setCurrentCameraIndex(nextIndex);
      stopCamera();
      await startCamera(nextIndex);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg");
      onCapture?.(dataUrl);
      stopCamera();
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-green-600" /> Camera
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full ${isActive ? "block" : "hidden"}`}
          />
          {!isActive && (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Camera not active
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
          {isActive && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={flipCamera}
                disabled={cameras.length <= 1}
                className="rounded-full w-10 h-10 p-0 bg-white shadow"
              >
                <RefreshCw className="h-4 w-4 text-gray-700" />
              </Button>
              <label className="rounded-full w-10 h-10 bg-white shadow cursor-pointer flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-gray-700" />
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          )}
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex gap-2">
          {!isActive ? (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => startCamera()}
            >
              Start Camera
            </Button>
          ) : (
            <>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={capturePhoto}
              >
                Capture
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={stopCamera}
              >
                Stop
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
