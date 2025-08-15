"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Camera,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from "lucide-react";
import { SimpleCamera } from "./simple-camera"; // ✅ New modular camera

interface DiseaseResult {
  disease: string;
  confidence: number;
  severity: "Low" | "Medium" | "High";
  description: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
}

const cropTypes = [
  "Rice",
  "Maize",
  "Wheat",
  "Tomato",
  "Potato",
  "Cotton",
  "Sugarcane",
  "Banana",
  "Mango",
  "Grapes",
  "Apple",
  "Orange",
  "Coconut",
  "Coffee",
];

const mockDiseaseResults: Record<string, DiseaseResult[]> = {
  Rice: [
    {
      disease: "Bacterial Leaf Blight",
      confidence: 87,
      severity: "High",
      description:
        "A serious bacterial disease that affects rice leaves and can cause significant yield loss.",
      symptoms: [
        "Yellow to white lesions on leaves",
        "Wilting of leaves",
        "Stunted growth",
      ],
      treatment: [
        "Apply copper-based bactericides",
        "Remove infected plants",
        "Improve drainage",
      ],
      prevention: [
        "Use resistant varieties",
        "Avoid overhead irrigation",
        "Maintain field hygiene",
      ],
    },
  ],
  Tomato: [
    {
      disease: "Early Blight",
      confidence: 92,
      severity: "Medium",
      description:
        "A fungal disease that causes dark spots on leaves and can affect fruit quality.",
      symptoms: [
        "Dark brown spots with concentric rings",
        "Yellowing of lower leaves",
        "Fruit lesions",
      ],
      treatment: [
        "Apply fungicides containing chlorothalonil",
        "Remove affected leaves",
        "Improve air circulation",
      ],
      prevention: [
        "Crop rotation",
        "Avoid overhead watering",
        "Use disease-free seeds",
      ],
    },
  ],
  Potato: [
    {
      disease: "Late Blight",
      confidence: 89,
      severity: "High",
      description:
        "A devastating disease that can destroy entire potato crops in favorable conditions.",
      symptoms: [
        "Water-soaked lesions on leaves",
        "White fungal growth",
        "Brown rot on tubers",
      ],
      treatment: [
        "Apply systemic fungicides",
        "Destroy infected plants",
        "Harvest early if needed",
      ],
      prevention: [
        "Use certified seed potatoes",
        "Ensure good drainage",
        "Monitor weather conditions",
      ],
    },
  ],
};

const getSeverityColor = (severity: "Low" | "Medium" | "High"): string => {
  switch (severity) {
    case "Low":
      return "bg-green-100 text-green-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "High":
      return "bg-red-100 text-red-800";
    default:
      return "";
  }
};

export function CropDiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DiseaseResult | null>(
    null,
  );
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const analyzeImage = async () => {
    if (!selectedImage || !selectedCrop) return;
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const results = mockDiseaseResults[selectedCrop];
    setAnalysisResult(
      results?.[0] ?? {
        disease: "Healthy Plant",
        confidence: 95,
        severity: "Low",
        description: "No disease detected. The plant appears to be healthy.",
        symptoms: ["No visible symptoms"],
        treatment: ["Continue regular care"],
        prevention: ["Maintain good agricultural practices"],
      },
    );
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setSelectedCrop("");
    setAnalysisResult(null);
    setShowCamera(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Crop Disease Detection
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload an image of your crop and select the crop type to get
            AI-powered disease analysis and treatment recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload / Camera Section */}
          <Card className="border-2 border-dashed border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-green-600" />
                Capture or Upload Crop Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showCamera ? (
                <SimpleCamera
                  onCapture={(dataUrl) => {
                    setSelectedImage(dataUrl);
                    setShowCamera(false);
                    setAnalysisResult(null);
                  }}
                  onClose={() => setShowCamera(false)}
                />
              ) : (
                <>
                  {selectedImage && (
                    <img
                      src={selectedImage}
                      alt="Uploaded crop"
                      className="max-h-48 mx-auto rounded-lg shadow-md object-cover"
                    />
                  )}
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => setShowCamera(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Camera className="h-4 w-4 mr-2" /> Open Camera
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Upload className="h-4 w-4 mr-2" /> Upload Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Crop Type
                </label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="border-green-200 focus:border-green-400">
                    <SelectValue placeholder="Choose your crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map((crop) => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={analyzeImage}
                  disabled={!selectedImage || !selectedCrop || isAnalyzing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Leaf className="h-4 w-4 mr-2" /> Analyze Disease
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetAnalysis}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  <X className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" /> Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analysisResult ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>
                    Capture an image and select crop type to get disease
                    analysis
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {analysisResult.disease}
                      </h3>
                      <Badge
                        className={getSeverityColor(analysisResult.severity)}
                      >
                        {analysisResult.severity} Risk
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Confidence</span>
                        <span className="font-medium">
                          {analysisResult.confidence}%
                        </span>
                      </div>
                      <Progress
                        value={analysisResult.confidence}
                        className="h-2"
                      />
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {analysisResult.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />{" "}
                      Symptoms
                    </h4>
                    <ul className="space-y-1">
                      {analysisResult.symptoms.map((symptom, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />{" "}
                      Treatment
                    </h4>
                    <ul className="space-y-1">
                      {analysisResult.treatment.map((treatment, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                          {treatment}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-500" /> Prevention
                    </h4>
                    <ul className="space-y-1">
                      {analysisResult.prevention.map((p, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Note:</strong> This AI analysis provides preliminary disease
            identification. For critical cases, please consult with agricultural
            experts or extension services for professional diagnosis and
            treatment recommendations.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
