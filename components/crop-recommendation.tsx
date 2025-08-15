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
  Loader2,
  Sprout,
  Thermometer,
  FlaskConical,
  Gauge,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { cropMetadata } from "@/components/lib/crop-metadata";
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
}

const parameterConfig = {
  nitrogen: {
    min: 0,
    max: 140,
    step: 1,
    unit: "mg/kg",
    symbol: "N",
    color: "#3b82f6",
  }, // Blue
  phosphorus: {
    min: 0,
    max: 145,
    step: 1,
    unit: "mg/kg",
    symbol: "P",
    color: "#8b5cf6",
  }, // Purple
  potassium: {
    min: 0,
    max: 205,
    step: 1,
    unit: "mg/kg",
    symbol: "K",
    color: "#f59e0b",
  }, // Amber
  temperature: {
    min: 0,
    max: 45,
    step: 0.5,
    unit: "°C",
    symbol: "T",
    color: "#ef4444",
  }, // Red
  humidity: {
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    symbol: "H",
    color: "#06b6d4",
  }, // Cyan
  ph: { min: 0, max: 14, step: 0.1, unit: "", symbol: "pH", color: "#84cc16" }, // Lime
  rainfall: {
    min: 0,
    max: 300,
    step: 1,
    unit: "mm",
    symbol: "R",
    color: "#10b981",
  }, // Emerald
};

export function CropRecommendation() {
  const [formData, setFormData] = useState<FormData>({
    nitrogen: 50,
    phosphorus: 50,
    potassium: 50,
    temperature: 25,
    humidity: 60,
    ph: 7,
    rainfall: 100,
  });

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<ApiResponse | null>(
    null,
  );

  const handleSliderChange = (field: keyof FormData, value: number[]) => {
    setFormData((prev) => ({ ...prev, [field]: value[0] }));
  };

  const simulateApiCall = async (): Promise<ApiResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockCrops = [
      "rice",
      "maize",
      "chickpea",
      "kidneybeans",
      "pigeonpeas",
    ];
    const mockProbs = [0.85, 0.72, 0.68, 0.54, 0.41];

    return {
      status: "success",
      model_used: "RandomForestClassifier",
      input_parameters: formData,
      predictions: {
        recommended_crop: mockCrops[0],
        top_5_recommendations: mockCrops.map((crop, index) => ({
          crop,
          confidence_score: mockProbs[index],
          confidence_percentage: Math.round(mockProbs[index] * 100 * 100) / 100,
        })),
      },
      metadata: {
        total_classes: 22,
        prediction_timestamp: new Date().toISOString(),
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await simulateApiCall();
      setRecommendations(response);
    } catch (error) {
      console.error("Error getting recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (percentage >= 60)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const chartData =
    recommendations?.predictions.top_5_recommendations.map((rec) => ({
      name: rec.crop.charAt(0).toUpperCase() + rec.crop.slice(1),
      confidence: rec.confidence_percentage,
      emoji: cropMetadata[rec.crop]?.emoji || "🌱",
    })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-green-200 px-4 py-2">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold text-green-800 flex items-center gap-1 justify-center">
              <Sprout className="h-5 w-5" />
              AI Crop Advisor
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-5 lg:gap-6 lg:grid-rows-[auto_auto_auto] space-y-4 lg:space-y-0">
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-green-100">
                    <Gauge className="h-3 w-3 text-green-600" />
                    <h3 className="font-semibold text-green-800 text-xs">
                      Soil Nutrients
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      ["nitrogen", "phosphorus", "potassium", "ph"] as const
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
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
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
                              className="w-full [&_.slider-thumb]:hidden [&_[role=slider]]:hidden"
                              style={
                                {
                                  "--slider-track": "#e2e8f0",
                                  "--slider-range": config.color,
                                } as React.CSSProperties
                              }
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
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-green-100">
                    <Thermometer className="h-3 w-3 text-green-600" />
                    <h3 className="font-semibold text-green-800 text-xs">
                      Climate
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {(["temperature", "humidity", "rainfall"] as const).map(
                      (param) => {
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
                              <Badge
                                variant="outline"
                                className="text-xs px-1 py-0"
                              >
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
                                className="w-full [&_.slider-thumb]:hidden [&_[role=slider]]:hidden"
                                style={
                                  {
                                    "--slider-track": "#e2e8f0",
                                    "--slider-range": config.color,
                                  } as React.CSSProperties
                                }
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
                      },
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-sm font-semibold rounded-xl shadow-lg"
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
              </form>
            </CardContent>
          </Card>

          {recommendations && (
            <>
              <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white lg:col-span-2 lg:row-span-1">
                <CardContent className="p-2 lg:p-4 text-center">
                  <div className="text-6xl lg:text-7xl mb-4">
                    {cropMetadata[recommendations.predictions.recommended_crop]
                      ?.emoji || "🌱"}
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-3xl font-bold mb-2 capitalize">
                    {recommendations.predictions.recommended_crop}
                  </h2>
                  <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2 mb-4">
                    {
                      recommendations.predictions.top_5_recommendations[0]
                        .confidence_percentage
                    }
                    % Match
                  </Badge>
                  <p className="text-green-100 text-sm sm:text-base">
                    {cropMetadata[recommendations.predictions.recommended_crop]
                      ?.description ||
                      "Perfect crop choice for your current conditions!"}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm lg:col-span-2 lg:row-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Confidence Analysis
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Top crop suitability scores
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-48 lg:h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          interval={0}
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

              <div className="lg:col-span-2 lg:row-span-1 space-y-3 lg:space-y-2">
                {recommendations.predictions.top_5_recommendations
                  .slice(0, 3)
                  .map((rec, index) => (
                    <Card
                      key={rec.crop}
                      className="shadow-lg border-0 bg-white/90 backdrop-blur-sm"
                    >
                      <CardContent className="p-3 lg:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="text-2xl lg:text-3xl">
                              {cropMetadata[rec.crop]?.emoji || "🌱"}
                            </div>
                            <div>
                              <h4 className="font-semibold capitalize text-gray-800 text-sm lg:text-base">
                                {rec.crop}
                              </h4>
                              <p className="text-xs lg:text-sm text-gray-600 hidden lg:block">
                                {cropMetadata[rec.crop]?.category ||
                                  "Agricultural crop"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={`${getConfidenceColor(rec.confidence_percentage)} text-xs px-2 py-1`}
                            >
                              {rec.confidence_percentage}%
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              #{index + 1}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {recommendations.predictions.top_5_recommendations.length >
                  3 && (
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm lg:block hidden">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {recommendations.predictions.top_5_recommendations
                          .slice(3)
                          .map((rec) => (
                            <div
                              key={rec.crop}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {cropMetadata[rec.crop]?.emoji || "🌱"}
                                </span>
                                <span className="capitalize font-medium">
                                  {rec.crop}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {rec.confidence_percentage}%
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}

          {!recommendations && !loading && (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm lg:col-span-2 lg:row-span-2">
              <CardContent className="p-12 text-center lg:flex lg:flex-col lg:justify-center lg:h-full">
                <div className="text-6xl lg:text-8xl mb-4">🌱</div>
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-700 mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-gray-500 text-sm lg:text-base max-w-md mx-auto">
                  Adjust the parameters to match your soil and climate
                  conditions, then get personalized crop recommendations powered
                  by AI
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
