/* eslint-disable prettier/prettier */
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Camera,
  Bug,
  AlertTriangle,
  Info,
  X,
  Shield,
  Eye,
} from "lucide-react";
import { SimpleCamera } from "./simple-camera";
import {
  agriculturalAPI,
  PestPredictionResponse,
} from "@/lib/agricultural-api";

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

export function PestPrediction() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [pestQuery, setPestQuery] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<PestPredictionResponse | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file); // Store the file for API upload
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
    if (!pestQuery.trim()) {
      alert("Please enter a pest-related query to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      console.log("Starting pest prediction...");
      const result = await agriculturalAPI.predictPest(
        pestQuery,
        selectedFile || undefined
      );

      console.log("API Response:", result);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error predicting pest:", error);
      setAnalysisResult({
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setSelectedCrop("");
    setPestQuery("");
    setAnalysisResult(null);
    setShowCamera(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bug className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Pest Identification
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
            Describe pest issues or symptoms you're observing. Optionally upload
            an image and specify crop type for more accurate AI-powered pest
            identification and treatment recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Upload / Camera Section */}
          <Card className="border-2 border-dashed border-orange-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
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
                      src={selectedImage || "/placeholder.svg"}
                      alt="Uploaded crop"
                      className="max-h-32 sm:max-h-48 mx-auto rounded-lg shadow-md object-cover w-full"
                    />
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      onClick={() => setShowCamera(true)}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-sm sm:text-base"
                    >
                      <Camera className="h-4 w-4 mr-2" /> Open Camera
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50 text-sm sm:text-base"
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

              {/* Pest Query Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Describe Pest Issues or Symptoms
                </label>
                <Textarea
                  value={pestQuery}
                  onChange={(e) => setPestQuery(e.target.value)}
                  placeholder="Describe what you're seeing: leaf damage, insects, discoloration, etc. For example: 'I see small holes in leaves and some caterpillars on my tomato plants'"
                  className="border-orange-200 focus:border-orange-400 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Crop Type (Optional)
                </label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="border-orange-200 focus:border-orange-400">
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

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={analyzeImage}
                  disabled={!pestQuery.trim() || isAnalyzing}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm sm:text-base"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Bug className="h-4 w-4 mr-2" /> Identify Pests
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetAnalysis}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent text-sm sm:text-base"
                >
                  <X className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" /> Pest
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analysisResult ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base px-2">
                    Capture an image and select crop type to get pest
                    identification
                  </p>
                </div>
              ) : analysisResult.error ? (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm sm:text-base">
                    <strong>Error:</strong> {analysisResult.error}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* Possible Pests */}
                  {analysisResult.possible_pest_names &&
                    analysisResult.possible_pest_names.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                          <Bug className="h-5 w-5 text-orange-600 flex-shrink-0" />
                          Identified Pests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.possible_pest_names.map(
                            (pest, index) => (
                              <Badge
                                key={index}
                                className={`${
                                  index === 0
                                    ? "bg-orange-100 text-orange-800 border-orange-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                } text-xs sm:text-sm px-2 py-1`}
                              >
                                {pest}
                                {index === 0 && (
                                  <span className="ml-1 text-xs">
                                    (Primary)
                                  </span>
                                )}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Description */}
                  {analysisResult.description && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                        <Eye className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        Pest Description & Symptoms
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words">
                        {analysisResult.description}
                      </p>
                    </div>
                  )}

                  {/* Pesticide Recommendations */}
                  {analysisResult.pesticide_recommendation && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                        <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />
                        Treatment Recommendations
                      </h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-green-800 leading-relaxed break-words">
                          {analysisResult.pesticide_recommendation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <AlertDescription className="text-blue-800 text-xs sm:text-sm leading-relaxed">
            <strong>Note:</strong> This AI analysis provides preliminary pest
            identification. Always follow local pesticide regulations and
            consult with agricultural experts for professional advice. Read
            pesticide labels carefully and apply according to manufacturer
            instructions.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
