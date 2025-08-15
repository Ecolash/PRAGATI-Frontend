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
  Shield,
  Stethoscope,
} from "lucide-react";
import { SimpleCamera } from "./simple-camera";

interface DiseaseAnalysisResponse {
  success: boolean;
  diseases?: string[];
  disease_probabilities?: number[];
  symptoms?: string[];
  treatments?: string[];
  prevention_tips?: string[];
  image_path?: string;
  error?: string;
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

const mockDiseaseResults: Record<string, DiseaseAnalysisResponse> = {
  Rice: {
    success: true,
    diseases: ["Bacterial Leaf Blight", "Brown Spot"],
    disease_probabilities: [0.87, 0.13],
    symptoms: [
      "Yellow to white lesions on leaves with wavy margins",
      "Wilting of leaves starting from tips",
      "Stunted growth and reduced tillering",
      "Water-soaked lesions that turn brown",
    ],
    treatments: [
      "Apply copper-based bactericides like copper oxychloride at 2g/L",
      "Remove and destroy infected plant debris immediately",
      "Improve field drainage to reduce waterlogging",
      "Use systemic antibiotics like streptomycin if available",
    ],
    prevention_tips: [
      "Use certified disease-resistant rice varieties",
      "Avoid overhead irrigation during humid conditions",
      "Maintain proper field sanitation and crop rotation",
      "Monitor weather conditions and apply preventive sprays",
      "Ensure balanced nutrition with adequate potassium",
    ],
    image_path: "/uploads/rice_analysis.jpg",
  },
  Tomato: {
    success: true,
    diseases: ["Early Blight", "Septoria Leaf Spot"],
    disease_probabilities: [0.92, 0.08],
    symptoms: [
      "Dark brown spots with concentric rings on older leaves",
      "Yellowing and dropping of lower leaves progressively",
      "Fruit lesions with dark, sunken areas",
      "Stem cankers near soil line in severe cases",
    ],
    treatments: [
      "Apply fungicides containing chlorothalonil or mancozeb every 7-10 days",
      "Remove and destroy affected leaves and plant debris",
      "Improve air circulation by proper plant spacing",
      "Use drip irrigation to avoid wetting foliage",
    ],
    prevention_tips: [
      "Practice crop rotation with non-solanaceous crops",
      "Avoid overhead watering, especially in evening",
      "Use disease-free certified seeds and transplants",
      "Apply mulch to prevent soil splash onto leaves",
      "Maintain proper plant nutrition with balanced fertilizers",
    ],
    image_path: "/uploads/tomato_analysis.jpg",
  },
  Potato: {
    success: true,
    diseases: ["Late Blight"],
    disease_probabilities: [0.89],
    symptoms: [
      "Water-soaked lesions on leaves that rapidly expand",
      "White fungal growth on undersides of leaves",
      "Brown rot on tubers with firm, dry texture",
      "Rapid plant collapse in favorable weather conditions",
    ],
    treatments: [
      "Apply systemic fungicides like metalaxyl + mancozeb immediately",
      "Destroy infected plants and tubers completely",
      "Harvest early if disease pressure is high",
      "Store tubers in cool, dry conditions with good ventilation",
    ],
    prevention_tips: [
      "Use certified seed potatoes from reliable sources",
      "Ensure excellent field drainage and avoid waterlogging",
      "Monitor weather conditions and apply preventive fungicides",
      "Practice crop rotation with non-solanaceous crops",
      "Remove volunteer potato plants and cull piles",
    ],
    image_path: "/uploads/potato_analysis.jpg",
  },
};

const getSeverityColor = (probability: number): string => {
  if (probability >= 0.8) return "bg-red-100 text-red-800";
  if (probability >= 0.5) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};

const getSeverityLabel = (probability: number): string => {
  if (probability >= 0.8) return "High Risk";
  if (probability >= 0.5) return "Medium Risk";
  return "Low Risk";
};

export function CropDiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<DiseaseAnalysisResponse | null>(null);
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
      results ?? {
        success: true,
        diseases: ["Healthy Plant"],
        disease_probabilities: [0.95],
        symptoms: ["No visible disease symptoms detected"],
        treatments: ["Continue regular plant care and monitoring"],
        prevention_tips: [
          "Maintain good agricultural practices",
          "Regular monitoring for early disease detection",
          "Proper nutrition and water management",
        ],
        image_path: "/uploads/healthy_plant.jpg",
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Crop Disease Detection
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
            Upload an image of your crop and select the crop type to get
            AI-powered disease analysis and treatment recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Upload / Camera Section */}
          <Card className="border-2 border-dashed border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
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
                      className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
                    >
                      <Camera className="h-4 w-4 mr-2" /> Open Camera
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-green-300 text-green-700 hover:bg-green-50 text-sm sm:text-base"
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

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={analyzeImage}
                  disabled={!selectedImage || !selectedCrop || isAnalyzing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
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
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />{" "}
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analysisResult ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base px-2">
                    Capture an image and select crop type to get disease
                    analysis
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
                  {analysisResult.diseases?.map((disease, index) => (
                    <div
                      key={index}
                      className="space-y-3 border-b border-gray-100 pb-4 last:border-b-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
                          {disease}
                        </h3>
                        {analysisResult.disease_probabilities?.[index] && (
                          <Badge
                            className={getSeverityColor(
                              analysisResult.disease_probabilities[index],
                            )}
                          >
                            {getSeverityLabel(
                              analysisResult.disease_probabilities[index],
                            )}
                          </Badge>
                        )}
                      </div>
                      {analysisResult.disease_probabilities?.[index] && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Confidence</span>
                            <span className="font-medium">
                              {Math.round(
                                analysisResult.disease_probabilities[index] *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              analysisResult.disease_probabilities[index] * 100
                            }
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {analysisResult.symptoms &&
                    analysisResult.symptoms.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                          <Stethoscope className="h-4 w-4 text-orange-500 flex-shrink-0" />
                          Symptoms Observed
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.symptoms.map((symptom, i) => (
                            <li
                              key={i}
                              className="text-xs sm:text-sm text-gray-600 flex items-start gap-2 leading-relaxed"
                            >
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                              <span className="break-words">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {analysisResult.treatments &&
                    analysisResult.treatments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                          <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          Treatment Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.treatments.map((treatment, i) => (
                            <li
                              key={i}
                              className="text-xs sm:text-sm text-gray-600 flex items-start gap-2 leading-relaxed"
                            >
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                              <span className="break-words">{treatment}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {analysisResult.prevention_tips &&
                    analysisResult.prevention_tips.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                          <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />
                          Prevention Tips
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.prevention_tips.map((tip, i) => (
                            <li
                              key={i}
                              className="text-xs sm:text-sm text-gray-600 flex items-start gap-2 leading-relaxed"
                            >
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                              <span className="break-words">{tip}</span>
                            </li>
                          ))}
                        </ul>
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
