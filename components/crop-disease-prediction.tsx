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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Camera,
  Leaf,
  AlertTriangle,
  Info,
  X,
  Shield,
  Stethoscope,
} from "lucide-react";
import { SimpleCamera } from "./simple-camera";
import { agriculturalAPI } from "@/lib/agricultural-api";

interface DiseaseAnalysisResponse {
  success: boolean;
  diseases?: string[];
  disease_probabilities?: number[];
  symptoms?: string[];
  treatments?: string[];
  prevention_tips?: string[];
  image_path?: string;
  error?: string;
  // Add support for the backend's capitalized field
  Treatments?: string[];
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

const getSeverityColor = (probability: number): string => {
  if (probability >= 0.8) return "bg-red-100 text-red-800";
  if (probability >= 0.5) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};

const getSeverityLabel = (probability: number): string => {
  if (probability >= 80) return "High Risk";
  if (probability >= 50) return "Medium Risk";
  return "Low Risk";
};

export function CropDiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<DiseaseAnalysisResponse | null>(null);
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
    if (!selectedFile) {
      console.error("No file selected for analysis");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      console.log("Starting crop disease detection...");
      const result = await agriculturalAPI.detectCropDisease(selectedFile);

      console.log("API Response:", result);

      // Handle the response and normalize the treatments field
      const normalizedResult: DiseaseAnalysisResponse = {
        ...result,
        treatments: result.Treatments || [], // Map capitalized field to lowercase
      };

      setAnalysisResult(normalizedResult);
    } catch (error) {
      console.error("Error analyzing crop disease:", error);
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
    setAnalysisResult(null);
    setShowCamera(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              AI Crop Disease Detection
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
            Upload an image of your crop to get AI-powered disease analysis and
            treatment recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Upload / Camera Section */}
          <Card className="border-2 border-dashed border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Camera className="h-5 w-5 text-green-600" />
                Capture or Upload Crop Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showCamera ? (
                <SimpleCamera
                  onCapture={(dataUrl) => {
                    setSelectedImage(dataUrl);
                    // Convert dataUrl to File object for API upload
                    fetch(dataUrl)
                      .then((res) => res.blob())
                      .then((blob) => {
                        const file = new File([blob], "captured-image.jpg", {
                          type: "image/jpeg",
                        });
                        setSelectedFile(file);
                      });
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
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCamera(true)}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </>
              )}

              {/* Crop Type Selection */}
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

              <Button
                onClick={analyzeImage}
                disabled={!selectedFile || isAnalyzing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analyzing Disease...
                  </>
                ) : (
                  <>
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Analyze Disease
                  </>
                )}
              </Button>

              {selectedImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAnalysis}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset Analysis
                </Button>
              )}

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Capture an image to get disease detection results
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Stethoscope className="h-5 w-5 text-purple-600" />
                Disease Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing your crop image...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take a few moments
                  </p>
                </div>
              ) : analysisResult ? (
                <div className="space-y-4">
                  {analysisResult.success ? (
                    <>
                      {/* Disease Detection */}
                      {analysisResult.diseases &&
                        analysisResult.diseases.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Detected Diseases
                            </h4>
                            <div className="space-y-2">
                              {analysisResult.diseases.map((disease, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                  <span className="font-medium">{disease}</span>
                                  {analysisResult.disease_probabilities?.[
                                    index
                                  ] && (
                                    <div className="flex items-center gap-2">
                                      <Progress
                                        value={
                                          analysisResult.disease_probabilities[
                                            index
                                          ] * 100
                                        }
                                        className="w-16 h-2"
                                      />
                                      <Badge
                                        className={getSeverityColor(
                                          analysisResult.disease_probabilities[
                                            index
                                          ]
                                        )}
                                      >
                                        {getSeverityLabel(
                                          analysisResult.disease_probabilities[
                                            index
                                          ]
                                        )}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Symptoms */}
                      {analysisResult.symptoms &&
                        analysisResult.symptoms.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              Observed Symptoms
                            </h4>
                            <ul className="space-y-1 text-sm">
                              {analysisResult.symptoms.map((symptom, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                  {symptom}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* Treatments */}
                      {analysisResult.treatments &&
                        analysisResult.treatments.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                              <Stethoscope className="h-4 w-4" />
                              Recommended Treatments
                            </h4>
                            <ul className="space-y-1 text-sm">
                              {analysisResult.treatments.map(
                                (treatment, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                    {treatment}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {/* Prevention Tips */}
                      {analysisResult.prevention_tips &&
                        analysisResult.prevention_tips.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Prevention Tips
                            </h4>
                            <ul className="space-y-1 text-sm">
                              {analysisResult.prevention_tips.map(
                                (tip, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                    {tip}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </>
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {analysisResult.error ||
                          "Analysis failed. Please try again with a different image."}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Leaf className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No Analysis Yet</p>
                  <p className="text-sm">
                    Upload a crop image to get AI-powered disease detection
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <AlertDescription className="text-blue-800 text-xs sm:text-sm leading-relaxed">
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
