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

interface PestPredictionResponse {
  success: boolean;
  possible_pest_names?: string[];
  description?: string;
  pesticide_recommendation?: string;
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

const mockPestResults: Record<string, PestPredictionResponse> = {
  Rice: {
    success: true,
    possible_pest_names: [
      "Brown Planthopper",
      "Rice Stem Borer",
      "Leaf Folder",
    ],
    description:
      "Brown Planthopper is the most likely pest affecting your rice crop. These small, brown insects feed on plant sap, causing yellowing and stunting of plants. They can also transmit viral diseases. The insects are typically found on the lower parts of the plant and can cause 'hopper burn' - a condition where plants turn brown and dry up.",
    pesticide_recommendation:
      "Apply Imidacloprid 17.8% SL at 100ml per acre or Thiamethoxam 25% WG at 100g per acre. For organic control, use neem oil at 3-5ml per liter of water. Apply during early morning or evening hours. Ensure proper coverage of lower plant parts where pests typically hide.",
  },
  Tomato: {
    success: true,
    possible_pest_names: ["Tomato Hornworm", "Whitefly", "Aphids"],
    description:
      "Tomato Hornworm appears to be the primary pest based on the damage pattern. These large, green caterpillars can quickly defoliate tomato plants and feed on fruits. They are well-camouflaged and often go unnoticed until significant damage occurs. Look for dark green or black droppings on leaves as an early sign of infestation.",
    pesticide_recommendation:
      "For immediate control, use Bacillus thuringiensis (Bt) spray at 2-3ml per liter of water. Chemical options include Chlorantraniliprole 18.5% SC at 150ml per acre. Hand-picking is also effective for small infestations. Apply treatments in the evening when caterpillars are most active.",
  },
  Potato: {
    success: true,
    possible_pest_names: [
      "Colorado Potato Beetle",
      "Potato Tuber Moth",
      "Aphids",
    ],
    description:
      "Colorado Potato Beetle is the most probable pest affecting your potato crop. Adult beetles and their larvae feed on potato leaves, and can completely defoliate plants if left untreated. The beetles are yellow-orange with black stripes, while larvae are red-orange with black spots along their sides.",
    pesticide_recommendation:
      "Apply Spinosad 45% SC at 200ml per acre or Emamectin Benzoate 5% SG at 200g per acre. Rotate between different chemical classes to prevent resistance. For organic control, use pyrethrin-based sprays. Remove egg masses from leaf undersides and practice crop rotation with non-solanaceous crops.",
  },
  Cotton: {
    success: true,
    possible_pest_names: ["Bollworm", "Aphids", "Thrips"],
    description:
      "Bollworm complex appears to be the main pest concern. These caterpillars bore into cotton bolls, causing significant yield losses. The larvae feed on squares, flowers, and developing bolls. Early detection is crucial as older larvae become more difficult to control and cause greater damage.",
    pesticide_recommendation:
      "Use Flubendiamide 480% SC at 200ml per acre or Chlorantraniliprole 18.5% SC at 150ml per acre. Apply when pest population reaches economic threshold levels. Combine with pheromone traps for monitoring. Avoid broad-spectrum insecticides that harm beneficial insects.",
  },
};

export function PestPrediction() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<PestPredictionResponse | null>(null);
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

    const results = mockPestResults[selectedCrop];
    setAnalysisResult(
      results ?? {
        success: true,
        possible_pest_names: ["No Pests Detected"],
        description:
          "No significant pest activity detected in the uploaded image. The crop appears healthy with no visible signs of pest damage. Continue regular monitoring and maintain good agricultural practices.",
        pesticide_recommendation:
          "No immediate pesticide application needed. Continue regular field monitoring and implement preventive measures such as proper field sanitation and beneficial insect conservation.",
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
            Upload an image of your crop and select the crop type to get
            AI-powered pest identification and pesticide recommendations.
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Crop Type
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
                  disabled={!selectedImage || !selectedCrop || isAnalyzing}
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
                            ),
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
