"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  FlaskConical,
  BarChart3,
  TrendingUp,
  Sprout,
  CheckCircle2,
  Target,
  Thermometer,
} from "lucide-react";
import { cropMetadata } from "@/components/lib/crop-metadata";
import { agriculturalAPI } from "@/lib/agricultural-api";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface CropRecommendation {
  crop: string;
  confidence_score: number;
  confidence_percentage: number;
}

interface ApiResponse {
  status: string;
  model_used: string;
  input_parameters: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
  predictions: {
    recommended_crop: string;
    top_5_recommendations: CropRecommendation[];
  };
  metadata: {
    total_classes: number;
    prediction_timestamp: string;
    function_version?: string;
    available_models?: string[];
  };
}

interface FormData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  soil_type: string;
  season: string;
}

const parameterConfig = {
  temperature: {
    min: 0,
    max: 45,
    step: 0.5,
    unit: "°C",
    symbol: "T",
    color: "#059669",
  },
  humidity: {
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    symbol: "H",
    color: "#0d9488",
  },
  rainfall: {
    min: 0,
    max: 300,
    step: 1,
    unit: "mm",
    symbol: "R",
    color: "#0891b2",
  },
  nitrogen: {
    min: 0,
    max: 140,
    step: 1,
    unit: "mg/kg",
    symbol: "N",
    color: "#16a34a",
  },
  potassium: {
    min: 0,
    max: 205,
    step: 1,
    unit: "mg/kg",
    symbol: "K",
    color: "#15803d",
  },
  phosphorus: {
    min: 0,
    max: 145,
    step: 1,
    unit: "mg/kg",
    symbol: "P",
    color: "#166534",
  },
  ph: {
    min: 0,
    max: 14,
    step: 0.1,
    unit: "",
    symbol: "pH",
    color: "#84cc16",
  },
};

const soilTypes = ["Sandy", "Loamy", "Black", "Red", "Clayey"];
const seasons = ["Kharif", "Rabi", "Zaid", "Summer", "Winter"];

export function CropRecommendation() {
  const [formData, setFormData] = useState<FormData>({
    nitrogen: 50,
    phosphorus: 50,
    potassium: 50,
    temperature: 25,
    humidity: 60,
    ph: 7,
    rainfall: 100,
    soil_type: "Loamy",
    season: "Kharif",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ApiResponse | null>(
    null,
  );

  const handleSliderChange = (field: keyof FormData, value: number[]) => {
    setFormData((prev) => ({ ...prev, [field]: value[0] }));
  };

  const handleDropdownChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getCropRecommendation = async (): Promise<ApiResponse> => {
    try {
      const response = await agriculturalAPI.getCropRecommendation({
        N: formData.nitrogen,
        P: formData.phosphorus,
        K: formData.potassium,
        temperature: formData.temperature,
        humidity: formData.humidity,
        ph: formData.ph,
        rainfall: formData.rainfall,
        model_type: "stacked",
      });

      console.log("getCropRecommendation - Raw API response:", response);
      console.log("getCropRecommendation - Response type:", typeof response);

      if (typeof response === "string") {
        console.log("Response is still a string, parsing...");
        const parsedResponse = JSON.parse(response);
        console.log("Parsed response:", parsedResponse);
        return parsedResponse;
      }

      return response;
    } catch (error) {
      console.error("Crop recommendation API error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await getCropRecommendation();

      if (response.status !== "success") {
        setError("Failed to get crop recommendations");
        setRecommendations(null);
      } else {
        setRecommendations(response);
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to get crop recommendations. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return "#16a34a";
    if (percentage >= 60) return "#059669";
    return "#0d9488";
  };

  const chartData =
    recommendations?.predictions?.top_5_recommendations?.map((rec) => ({
      name: rec.crop.charAt(0).toUpperCase() + rec.crop.slice(1),
      confidence: rec.confidence_percentage,
      emoji: cropMetadata[rec.crop]?.emoji || "🌱",
    })) || [];

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-green-200 px-4 py-3">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold  flex items-center gap-2 justify-center">
              <Sprout className="h-6 w-6 text-gray-600" />
              AI Crop Advisor
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Smart recommendations for optimal crop selection
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-min">
          <Card className="md:col-span-3 bg-white/90 backdrop-blur-sm border border-green-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2  text-lg">
                <Thermometer className="h-5 w-5 text-gray-600" />
                Environmental
              </CardTitle>
              <CardDescription className="text-gray-600">
                Climate conditions for optimal growth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["temperature", "humidity", "rainfall"] as const).map(
                (param) => {
                  const config = parameterConfig[param];
                  return (
                    <div key={param} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                            style={{ backgroundColor: config.color }}
                          >
                            {config.symbol}
                          </div>
                          <span className="capitalize text-gray-700">
                            {param}
                          </span>
                        </Label>
                        <Badge
                          variant="secondary"
                          className="bg-green-100  border-green-200"
                        >
                          {formData[param]}
                          {config.unit}
                        </Badge>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={[formData[param]]}
                          onValueChange={(value) =>
                            handleSliderChange(param, value)
                          }
                          max={config.max}
                          min={config.min}
                          step={config.step}
                          className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-green-300 [&_.bg-primary]:to-green-400"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{config.min}</span>
                          <span>
                            {config.max}
                            {config.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium  mb-2">🌤️ Climate Tips</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Temperature affects crop growth rate and yield</li>
                  <li>• Humidity influences disease susceptibility</li>
                  <li>• Rainfall determines irrigation requirements</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 bg-white/90 backdrop-blur-sm border border-green-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2  text-lg">
                <FlaskConical className="h-5 w-5 text-gray-600" />
                Soil Nutrients
              </CardTitle>
              <CardDescription className="text-gray-600">
                NPK levels and pH for soil analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["nitrogen", "phosphorus", "potassium", "ph"] as const).map(
                (param) => {
                  const config = parameterConfig[param];
                  return (
                    <div key={param} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                            style={{ backgroundColor: config.color }}
                          >
                            {config.symbol}
                          </div>
                          <span className="capitalize text-gray-700">
                            {param}
                          </span>
                        </Label>
                        <Badge
                          variant="secondary"
                          className="bg-green-100  border-green-200"
                        >
                          {formData[param]}
                          {config.unit}
                        </Badge>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={[formData[param]]}
                          onValueChange={(value) =>
                            handleSliderChange(param, value)
                          }
                          max={config.max}
                          min={config.min}
                          step={config.step}
                          className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-green-300 [&_.bg-primary]:to-green-400"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{config.min}</span>
                          <span>
                            {config.max}
                            {config.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium  mb-2">🧪 Soil Guide</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Nitrogen (N):</span>
                    <span>Leaf growth</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phosphorus (P):</span>
                    <span>Root development</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Potassium (K):</span>
                    <span>Disease resistance</span>
                  </div>
                  <div className="flex justify-between">
                    <span>pH Level:</span>
                    <span>Nutrient availability</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-2 xl:col-span-3 bg-white/90 backdrop-blur-sm border border-green-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2  text-lg">
                <Sprout className="h-5 w-5 text-gray-600" />
                Soil & Season Selection
              </CardTitle>
              <CardDescription className="text-gray-600">
                Choose your farming context and conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Soil Type
                  </Label>
                  <Select
                    value={formData.soil_type}
                    onValueChange={(value) =>
                      handleDropdownChange("soil_type", value)
                    }
                  >
                    <SelectTrigger className="bg-white border-green-200 focus:border-green-400 focus:ring-green-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {soilTypes.map((soil) => (
                        <SelectItem key={soil} value={soil}>
                          {soil}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Season
                  </Label>
                  <Select
                    value={formData.season}
                    onValueChange={(value) =>
                      handleDropdownChange("season", value)
                    }
                  >
                    <SelectTrigger className="bg-white border-green-200 focus:border-green-400 focus:ring-green-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((season) => (
                        <SelectItem key={season} value={season}>
                          {season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium  mb-2 flex items-center gap-1">
                    🌱 Soil Properties
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <strong>Current:</strong> {formData.soil_type}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.soil_type === "Sandy" &&
                        "Good drainage, low nutrients"}
                      {formData.soil_type === "Loamy" &&
                        "Balanced, ideal for most crops"}
                      {formData.soil_type === "Black" &&
                        "Rich in nutrients, cotton-friendly"}
                      {formData.soil_type === "Red" &&
                        "Iron-rich, good for cereals"}
                      {formData.soil_type === "Clayey" &&
                        "High water retention, dense"}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium  mb-2 flex items-center gap-1">
                    🌾 Season Info
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <strong>Selected:</strong> {formData.season}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.season === "Kharif" &&
                        "Monsoon season, June-October"}
                      {formData.season === "Rabi" &&
                        "Winter season, November-April"}
                      {formData.season === "Zaid" &&
                        "Summer season, April-June"}
                      {formData.season === "Summer" && "Hot season crops"}
                      {formData.season === "Winter" && "Cool season crops"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium  mb-2">
                  📊 Current Configuration
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-600">
                    Temperature:{" "}
                    <span className="font-medium">
                      {formData.temperature}°C
                    </span>
                  </div>
                  <div className="text-gray-600">
                    Humidity:{" "}
                    <span className="font-medium">{formData.humidity}%</span>
                  </div>
                  <div className="text-gray-600">
                    N:{" "}
                    <span className="font-medium">
                      {formData.nitrogen} mg/kg
                    </span>
                  </div>
                  <div className="text-gray-600">
                    P:{" "}
                    <span className="font-medium">
                      {formData.phosphorus} mg/kg
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">Error</p>
                  <p className="text-xs mt-1">{error}</p>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-green-900 py-3 text-sm font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-2 xl:col-span-3 bg-gradient-to-br from-green-100 via-green-200 to-emerald-200 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/30 rounded-xl">
                  <Target className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Ready to Analyse</h3>
                  <p className="text-green-800 text-sm">
                    All parameters configured and validated
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white/20 rounded-lg">
                  <span className="text-sm font-medium">Parameters Set</span>
                  <Badge className="bg-white/30 text-green-900 border-white/40">
                    {Object.keys(formData).length}/9
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-2 bg-white/20 rounded-lg">
                  <span className="text-sm font-medium">Soil & Season</span>
                  <CheckCircle2 className="h-4 w-4 text-green-800" />
                </div>

                <div className="flex items-center justify-between p-2 bg-white/20 rounded-lg">
                  <span className="text-sm font-medium">Environmental</span>
                  <CheckCircle2 className="h-4 w-4 text-green-800" />
                </div>

                <div className="flex items-center justify-between p-2 bg-white/20 rounded-lg">
                  <span className="text-sm font-medium">NPK & pH Levels</span>
                  <CheckCircle2 className="h-4 w-4 text-green-800" />
                </div>
              </div>

              <div className="mt-4 p-3 bg-white/20 rounded-lg">
                <h4 className="text-sm font-medium mb-2">🎯 Analysis Ready</h4>
                <p className="text-xs text-green-800 leading-relaxed">
                  Your configuration is complete! Our AI will analyze optimal
                  crop selection for {formData.soil_type.toLowerCase()} soil
                  during {formData.season.toLowerCase()} season and recommend
                  the best crops for your conditions.
                </p>
              </div>
            </CardContent>
          </Card>

          {recommendations && recommendations.predictions && (
            <>
              <Card className="md:col-span-2 lg:col-span-2 xl:col-span-3 bg-gradient-to-br from-green-400 via-emerald-300 to-green-500 text-green-900 border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="text-7xl mb-4">
                    {cropMetadata[
                      recommendations.predictions.recommended_crop || ""
                    ]?.emoji || "🌱"}
                  </div>
                  <h2 className="text-2xl font-bold mb-3 capitalize">
                    {recommendations.predictions.recommended_crop || "Unknown"}
                  </h2>
                  <Badge className="bg-white/30 text-green-900 border-white/40 text-lg px-6 py-2 mb-4 shadow-lg">
                    {recommendations.predictions.top_5_recommendations?.[0]
                      ?.confidence_percentage || 0}
                    % Match
                  </Badge>
                  <p className="text-sm mb-3 text-green-800 leading-relaxed">
                    {cropMetadata[
                      recommendations.predictions.recommended_crop || ""
                    ]?.description ||
                      "Perfect crop choice for your current conditions!"}
                  </p>
                  <p className=" text-xs italic">
                    {cropMetadata[
                      recommendations.predictions.recommended_crop || ""
                    ]?.category || "Optimal for your soil and climate"}
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-4 xl:col-span-6 bg-white/90 backdrop-blur-sm border border-green-200 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2  text-xl">
                    <BarChart3 className="h-6 w-6 text-gray-600" />
                    Confidence Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Top crop suitability scores for your specific conditions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#166534" }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#166534" }}
                          label={{
                            value: "Confidence %",
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: "middle", fill: "#166534" },
                          }}
                        />
                        <Tooltip
                          formatter={(value: any) => [
                            `${value}%`,
                            "Confidence",
                          ]}
                          labelFormatter={(label: string) =>
                            `${chartData.find((d) => d.name === label)?.emoji} ${label}`
                          }
                          contentStyle={{
                            backgroundColor: "#f0fdf4",
                            border: "1px solid #16a34a",
                            borderRadius: "8px",
                            color: "#166534",
                          }}
                        />
                        <Bar dataKey="confidence" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getBarColor(entry.confidence)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
