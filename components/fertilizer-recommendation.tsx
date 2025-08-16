/* eslint-disable prettier/prettier */
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

interface FertilizerRecommendation {
  fertilizer: string;
  confidence: number;
  confidence_percentage: number;
}

interface ApiResponse {
  success: boolean;
  recommended_fertilizer?: string;
  confidence?: number;
  top_3_recommendations?: Array<[string, number]>; // [fertilizer_name, confidence]
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
    color: "#ef4444",
  },
  humidity: {
    min: 30,
    max: 75,
    step: 1,
    unit: "%",
    symbol: "H",
    color: "#06b6d4",
  },
  moisture: {
    min: 25,
    max: 65,
    step: 1,
    unit: "%",
    symbol: "M",
    color: "#3b82f6",
  },
  nitrogen: {
    min: 0,
    max: 50,
    step: 1,
    unit: "mg/kg",
    symbol: "N",
    color: "#10b981",
  },
  potassium: {
    min: 0,
    max: 50,
    step: 1,
    unit: "mg/kg",
    symbol: "K",
    color: "#f59e0b",
  },
  phosphorous: {
    min: 0,
    max: 50,
    step: 1,
    unit: "mg/kg",
    symbol: "P",
    color: "#8b5cf6",
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
    null
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
        typeof response
      );

      // If response is still a string, parse it
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
            "Validation errors: " + response.validation_errors.join(", ")
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
          : "Failed to get fertilizer recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const chartData =
    recommendations?.top_3_recommendations?.map((rec) => ({
      name: rec[0], // fertilizer name
      confidence: Math.round(rec[1] * 100 * 100) / 100, // confidence percentage
      emoji: fertilizerMetadata[rec[0]]?.emoji || "🧪",
    })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-green-200 px-4 py-2">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold text-green-800 flex items-center gap-1 justify-center">
              <Sprout className="h-5 w-5" />
              AI Fertilizer Advisor
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-5 lg:gap-6 lg:grid-rows-[auto_auto_auto] space-y-4 lg:space-y-0">
          {/* Form Section */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm lg:col-span-3 lg:row-span-3 pt-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg py-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="h-4 w-4" />
                Parameters
              </CardTitle>
              <CardDescription className="text-green-100 text-xs">
                Adjust to match your conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Sliders */}
                {(
                  [
                    "temperature",
                    "humidity",
                    "moisture",
                    "nitrogen",
                    "potassium",
                    "phosphorous",
                  ] as const
                ).map((param) => {
                  const config = parameterConfig[param];
                  return (
                    <div key={param} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium flex items-center gap-1">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: config.color }}
                          >
                            {config.symbol}
                          </div>
                          <span className="capitalize">{param}</span>
                        </Label>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {formData[param]}
                          {config.unit}
                        </Badge>
                      </div>
                      <div className="px-1">
                        <Slider
                          value={[formData[param]]}
                          onValueChange={(value) =>
                            handleSliderChange(param, value)
                          }
                          max={config.max}
                          min={config.min}
                          step={config.step}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                          <span>{config.min}</span>
                          <span>
                            {config.max}
                            {config.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Dropdowns */}
                <div>
                  <Label className="text-xs font-medium">Soil Type</Label>
                  <Select
                    value={formData.soil_type}
                    onValueChange={(value) =>
                      handleDropdownChange("soil_type", value)
                    }
                  >
                    <SelectTrigger>
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

                <div>
                  <Label className="text-xs font-medium">Crop Type</Label>
                  <Select
                    value={formData.crop_type}
                    onValueChange={(value) =>
                      handleDropdownChange("crop_type", value)
                    }
                  >
                    <SelectTrigger>
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

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="text-sm font-medium">Error</p>
                    <p className="text-xs mt-1">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-sm font-semibold rounded-xl shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" /> Get
                      Recommendations
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {recommendations && recommendations.success && (
            <>
              {/* Main Recommendation */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white lg:col-span-2 lg:row-span-1">
                <CardContent className="p-4 text-center">
                  <div className="text-6xl mb-2">
                    {fertilizerMetadata[
                      recommendations.recommended_fertilizer || ""
                    ]?.emoji || "🧪"}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {recommendations.recommended_fertilizer || "Unknown"}
                  </h2>
                  <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2 mb-3">
                    {Math.round((recommendations.confidence || 0) * 10000) /
                      100}
                    % Match
                  </Badge>
                  <p className="text-sm mb-2">
                    {
                      fertilizerMetadata[
                        recommendations.recommended_fertilizer || ""
                      ]?.description
                    }
                  </p>
                  <p className="text-green-50 text-xs italic">
                    {
                      fertilizerMetadata[
                        recommendations.recommended_fertilizer || ""
                      ]?.application
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Confidence Chart */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm lg:col-span-2 lg:row-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
                    <BarChart3 className="h-5 w-5" /> Confidence Analysis
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Top fertilizer suitability scores
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          formatter={(value: any) => [
                            `${value}%`,
                            "Confidence",
                          ]}
                          labelFormatter={(label: string) =>
                            `${chartData.find((d) => d.name === label)?.emoji} ${label}`
                          }
                        />
                        <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
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
