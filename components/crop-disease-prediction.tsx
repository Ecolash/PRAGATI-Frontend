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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Camera,
  Leaf,
  AlertTriangle,
  Info,
  X,
  Stethoscope,
  CheckCircle,
  Activity,
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
  "Auto Detect",
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
  if (probability >= 80) return "bg-red-100 text-red-800 border-red-200";
  if (probability >= 50)
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-green-100 text-green-800 border-green-200";
};

const getSeverityLabel = (probability: number): string => {
  if (probability >= 80) return "High";
  if (probability >= 50) return "Medium";
  return "Low";
};

const getConfidenceColor = (probability: number): string => {
  if (probability >= 80) return "text-red-600";
  if (probability >= 60) return "text-yellow-600";
  return "text-green-600";
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

        <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Upload / Camera Section */}
          <div className="lg:col-span-2">
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
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Select Crop Type
                  </label>
                  <Select
                    value={selectedCrop}
                    onValueChange={setSelectedCrop}
                    defaultValue="Auto Detect"
                  >
                    <SelectTrigger className="border-green-200 focus:border-green-400 w-48">
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
                    className="w-full bg-transparent"
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
          </div>
          {/* Results Section */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Disease Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Analyzing your crop image...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      This may take a few moments
                    </p>
                  </div>
                ) : analysisResult ? (
                  analysisResult.success ? (
                    <Accordion
                      type="single"
                      defaultValue="diseases"
                      className="w-full space-y-2"
                    >
                      {/* Diseases */}
                      {analysisResult.diseases &&
                        analysisResult.diseases.length > 0 && (
                          <AccordionItem value="diseases">
                            <AccordionTrigger>
                              Detected Diseases (
                              {analysisResult.diseases.length})
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2">
                                {analysisResult.diseases.map(
                                  (disease, index) => {
                                    const probability =
                                      analysisResult.disease_probabilities?.[
                                        index
                                      ] || 0;
                                    const isHealthy = disease
                                      .toLowerCase()
                                      .includes("healthy");
                                    return (
                                      <li
                                        key={index}
                                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                      >
                                        <div className="flex items-center gap-2">
                                          {isHealthy ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                          ) : (
                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                          )}
                                          <span>{disease}</span>
                                        </div>
                                        <span
                                          className={`text-xs font-semibold px-2 py-1 rounded-full border ${getSeverityColor(probability)}`}
                                        >
                                          {getSeverityLabel(probability)} •{" "}
                                          <span
                                            className={getConfidenceColor(
                                              probability,
                                            )}
                                          >
                                            {probability.toFixed(1)}%
                                          </span>
                                        </span>
                                      </li>
                                    );
                                  },
                                )}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                      {/* Symptoms */}
                      {analysisResult.symptoms &&
                        analysisResult.symptoms.length > 0 && (
                          <AccordionItem value="symptoms">
                            <AccordionTrigger>
                              Observed Symptoms
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {analysisResult.symptoms.map(
                                  (symptom, index) => (
                                    <li key={index}>{symptom}</li>
                                  ),
                                )}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                      {/* Treatments */}
                      {analysisResult.treatments &&
                        analysisResult.treatments.length > 0 && (
                          <AccordionItem value="treatments">
                            <AccordionTrigger>
                              Recommended Treatments
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {analysisResult.treatments.map(
                                  (treatment, index) => (
                                    <li key={index}>{treatment}</li>
                                  ),
                                )}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                      {/* Prevention */}
                      {analysisResult.prevention_tips &&
                        analysisResult.prevention_tips.length > 0 && (
                          <AccordionItem value="prevention">
                            <AccordionTrigger>Prevention Tips</AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {analysisResult.prevention_tips.map(
                                  (tip, index) => (
                                    <li key={index}>{tip}</li>
                                  ),
                                )}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                      {/* Summary */}
                      <AccordionItem value="summary">
                        <AccordionTrigger>Analysis Summary</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-gray-700">
                            {analysisResult.diseases?.length || 0} condition(s)
                            identified.
                          </p>
                          {analysisResult.image_path && (
                            <p className="text-xs text-gray-500">
                              Image:{" "}
                              {analysisResult.image_path.split("/").pop()}
                            </p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {analysisResult.error ||
                          "Analysis failed. Please try again with a different image."}
                      </AlertDescription>
                    </Alert>
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Leaf className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No Analysis Yet</p>
                    <p className="text-sm">
                      Upload a crop image to get AI-powered detection
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
