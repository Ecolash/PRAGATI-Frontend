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
  Zap,
  Target,
} from "lucide-react";
import { fertilizerMetadata } from "@/components/lib/fertilizer-metadata";
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

interface ApiResponse {
  success: boolean;
  recommended_fertilizer?: string;
  confidence?: number;
  top_3_recommendations?: Array<[string, number]>;
  input_parameters?: {
    temperature: number;
    humidity: number;
    moisture: number;
    soil_type: string;
    crop_type: string;
    nitrogen: number;
    potassium: number;
    phosphorous: number;
  };
  validation_errors?: string[];
  error?: string;
}

interface FormData {
  temperature: number;
  humidity: number;
  moisture: number;
  soil_type: string;
  crop_type: string;
  nitrogen: number;
  potassium: number;
  phosphorous: number;
}

const parameterConfig = {
  temperature: {
    min: 20,
    max: 40,
    step: 0.5,
    unit: "°C",
    symbol: "T",
    color: "#f59e0b",
  },
  humidity: {
    min: 30,
    max: 75,
    step: 1,
    unit: "%",
    symbol: "H",
    color: "#0ea5e9",
  },
  moisture: {
    min: 25,
    max: 65,
    step: 1,
    unit: "%",
    symbol: "M",
    color: "#06b6d4",
  },
  nitrogen: {
    min: 0,
    max: 50,
    step: 1,
    unit: "mg/kg",
    symbol: "N",
    color: "#eab308",
  },
  potassium: {
    min: 0,
    max: 50,
    step: 1,
    unit: "mg/kg",
    symbol: "K",
    color: "#f97316",
  },
  phosphorous: {
    min: 0,
    max: 50,
    step: 1,
    unit: "mg/kg",
    symbol: "P",
    color: "#d97706",
  },
};

const soilTypes = ["Sandy", "Loamy", "Black", "Red", "Clayey"];
const cropTypes = [
  "Maize",
  "Sugarcane",
  "Cotton",
  "Tobacco",
  "Paddy",
  "Barley",
  "Wheat",
  "Millets",
  "Oil seeds",
  "Pulses",
  "Ground Nuts",
];

export function FertilizerRecommendation() {
  const [formData, setFormData] = useState<FormData>({
    temperature: 28,
    humidity: 50,
    moisture: 40,
    soil_type: "Loamy",
    crop_type: "Paddy",
    nitrogen: 20,
    potassium: 20,
    phosphorous: 20,
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

  const getFertilizerRecommendation = async (): Promise<ApiResponse> => {
    try {
      const response = await agriculturalAPI.getFertilizerRecommendation({
        temperature: formData.temperature,
        humidity: formData.humidity,
        moisture: formData.moisture,
        soil_type: formData.soil_type,
        crop_type: formData.crop_type,
        nitrogen: formData.nitrogen,
        potassium: formData.potassium,
        phosphorous: formData.phosphorous,
      });

      console.log("getFertilizerRecommendation - Raw API response:", response);
      console.log(
        "getFertilizerRecommendation - Response type:",
        typeof response,
      );

      if (typeof response === "string") {
        console.log("Response is still a string, parsing...");
        const parsedResponse = JSON.parse(response);
        console.log("Parsed response:", parsedResponse);
        return parsedResponse;
      }

      return response;
    } catch (error) {
      console.error("Fertilizer recommendation API error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await getFertilizerRecommendation();

      if (!response.success) {
        if (
          response.validation_errors &&
          response.validation_errors.length > 0
        ) {
          setError(
            "Validation errors: " + response.validation_errors.join(", "),
          );
        } else if (response.error) {
          setError(response.error);
        } else {
          setError("Failed to get fertilizer recommendations");
        }
        setRecommendations(null);
      } else {
        setRecommendations(response);
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to get fertilizer recommendations. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return "#eab308";
    if (percentage >= 60) return "#f59e0b";
    return "#f97316";
  };

  const chartData =
    recommendations?.top_3_recommendations?.map((rec) => ({
      name: rec[0],
      confidence: Math.round(rec[1] * 100 * 100) / 100,
      emoji: fertilizerMetadata[rec[0]]?.emoji || "🧪",
    })) || [];

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-yellow-200 px-4 py-3">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold  flex items-center gap-2 justify-center">
              <Sprout className="h-6 w-6 text-gray-600" />
              AI Fertilizer Advisor
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Smart recommendations for optimal crop growth
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-min">
          <Card className="md:col-span-3 bg-white/90 backdrop-blur-sm border border-yellow-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2  text-lg">
                <Zap className="h-5 w-5 text-gray-600" />
                Environmental
              </CardTitle>
              <CardDescription className="text-gray-600">
                Climate conditions for optimal growth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["temperature", "humidity", "moisture"] as const).map(
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
                          className="bg-yellow-100  border-yellow-200"
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
                          className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-yellow-300 [&_.bg-primary]:to-yellow-400"
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
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="text-sm font-medium  mb-2">
                  💡 Environmental Tips
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Optimal temperature: 25-30°C for most crops</li>
                  <li>• Humidity affects nutrient uptake efficiency</li>
                  <li>• Soil moisture impacts fertilizer dissolution</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 bg-white/90 backdrop-blur-sm border border-yellow-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2  text-lg">
                <FlaskConical className="h-5 w-5 text-gray-600" />
                Soil Nutrients
              </CardTitle>
              <CardDescription className="text-gray-600">
                NPK levels in mg/kg for soil analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["nitrogen", "potassium", "phosphorous"] as const).map(
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
                          className="bg-yellow-100  border-yellow-200"
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
                          className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-yellow-300 [&_.bg-primary]:to-yellow-400"
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
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="text-sm font-medium  mb-2">🧪 NPK Guide</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Nitrogen (N):</span>
                    <span>Leaf growth</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phosphorous (P):</span>
                    <span>Root development</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Potassium (K):</span>
                    <span>Disease resistance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-2 xl:col-span-3 bg-white/90 backdrop-blur-sm border border-yellow-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2  text-lg">
                <Sprout className="h-5 w-5 text-gray-600" />
                Crop & Soil Selection
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
                    <SelectTrigger className="bg-white border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400">
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
                    Crop Type
                  </Label>
                  <Select
                    value={formData.crop_type}
                    onValueChange={(value) =>
                      handleDropdownChange("crop_type", value)
                    }
                  >
                    <SelectTrigger className="bg-white border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400">
                      <SelectValue />
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
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

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="text-sm font-medium  mb-2 flex items-center gap-1">
                    🌾 Crop Requirements
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <strong>Selected:</strong> {formData.crop_type}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.crop_type === "Paddy" &&
                        "High water, moderate NPK"}
                      {formData.crop_type === "Wheat" &&
                        "Nitrogen-rich, cool climate"}
                      {formData.crop_type === "Cotton" &&
                        "Potassium-heavy, warm climate"}
                      {formData.crop_type === "Maize" &&
                        "Balanced NPK, good drainage"}
                      {formData.crop_type === "Sugarcane" &&
                        "High nitrogen, long season"}
                      {![
                        "Paddy",
                        "Wheat",
                        "Cotton",
                        "Maize",
                        "Sugarcane",
                      ].includes(formData.crop_type) &&
                        "Specific nutrient requirements"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
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
                      {formData.phosphorous} mg/kg
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
                className="w-full bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-yellow-900 py-3 text-sm font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
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

          <Card className="md:col-span-2 lg:col-span-2 xl:col-span-3 bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-200 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/30 rounded-xl">
                  <Target className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Ready to Analyse</h3>
                  <p className="text-yellow-800 text-sm">
                    All parameters configured and validated
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white/20 rounded-lg">
                  <span className="text-sm font-medium">Parameters Set</span>
                  <Badge className="bg-white/30 text-yellow-900 border-white/40">
                    {Object.keys(formData).length}/8
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-2 bg-white/20 rounded-lg">
                  <span className="text-sm font-medium">Soil & Crop</span>
                  <CheckCircle2 className="h-4 w-4 text-yellow-800" />
                </div>

                <div className="flex items-center justify-between p-2 bg-white/20 rounded-lg">
                  <span className="text-sm font-medium">Environmental</span>
                  <CheckCircle2 className="h-4 w-4 text-yellow-800" />
                </div>

                <div className="flex items-center justify-between p-2 bg-white/20 rounded-lg">
                  <span className="text-sm font-medium">NPK Levels</span>
                  <CheckCircle2 className="h-4 w-4 text-yellow-800" />
                </div>
              </div>

              <div className="mt-4 p-3 bg-white/20 rounded-lg">
                <h4 className="text-sm font-medium mb-2">🎯 Analysis Ready</h4>
                <p className="text-xs text-yellow-800 leading-relaxed">
                  Your configuration is complete! Our AI will analyze{" "}
                  {formData.crop_type.toLowerCase()} growth requirements for{" "}
                  {formData.soil_type.toLowerCase()} soil conditions and
                  recommend the optimal fertilizer blend.
                </p>
              </div>
            </CardContent>
          </Card>

          {recommendations && recommendations.success && (
            <>
              <Card className="md:col-span-2 lg:col-span-2 xl:col-span-3 bg-gradient-to-br from-yellow-400 via-amber-300 to-yellow-500 text-yellow-900 border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="text-7xl mb-4">
                    {fertilizerMetadata[
                      recommendations.recommended_fertilizer || ""
                    ]?.emoji || "🧪"}
                  </div>
                  <h2 className="text-2xl font-bold mb-3">
                    {recommendations.recommended_fertilizer || "Unknown"}
                  </h2>
                  <Badge className="bg-white/30 text-yellow-900 border-white/40 text-lg px-6 py-2 mb-4 shadow-lg">
                    {Math.round((recommendations.confidence || 0) * 10000) /
                      100}
                    % Match
                  </Badge>
                  <p className="text-sm mb-3 text-yellow-800 leading-relaxed">
                    {
                      fertilizerMetadata[
                        recommendations.recommended_fertilizer || ""
                      ]?.description
                    }
                  </p>
                  <p className=" text-xs italic">
                    {
                      fertilizerMetadata[
                        recommendations.recommended_fertilizer || ""
                      ]?.application
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-4 xl:col-span-6 bg-white/90 backdrop-blur-sm border border-yellow-200 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2  text-xl">
                    <BarChart3 className="h-6 w-6 text-gray-600" />
                    Confidence Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Top fertilizer suitability scores for your specific
                    conditions
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
                          tick={{ fontSize: 12, fill: "#a16207" }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#a16207" }}
                          label={{
                            value: "Confidence %",
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: "middle", fill: "#a16207" },
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
                            backgroundColor: "#fefce8",
                            border: "1px solid #eab308",
                            borderRadius: "8px",
                            color: "#a16207",
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
