/* eslint-disable prettier/prettier */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { agriculturalAPI } from "@/lib/agricultural-api";
import {
  Loader2,
  TrendingUp,
  MapPin,
  Calendar,
  Thermometer,
  Droplets,
  Sprout,
  BarChart3,
  Target,
  Award,
  AlertCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CropYieldPrediction {
  status: string;
  model_used?: string;
  input_parameters?: {
    state_name: string;
    district_name: string;
    crop_year: number;
    season: string;
    crop: string;
    temperature: number;
    humidity: number;
    soil_moisture: number;
    area_hectares: number;
  };
  predictions?: {
    total_production: number;
    yield_per_hectare: number;
    production_unit: string;
    confidence_interval: {
      lower_bound: number;
      upper_bound: number;
      confidence_level: string;
    };
  };
  analysis?: {
    productivity_rating: string;
    seasonal_suitability: string;
    regional_context: string;
  };
  feature_importance?: {
    temperature: number;
    humidity: number;
    soil_moisture: number;
    area: number;
    year: number;
  };
  metadata?: {
    prediction_timestamp: string;
    model_version: string;
    data_source: string;
  };
  error_message?: string;
}

const seasons = ["Autumn", "Kharif", "Rabi", "Summer", "Whole Year", "Winter"];
const crops = [
  "Paddy",
  "Wheat",
  "Rice",
  "Maize",
  "Sugarcane",
  "Cotton(lint)",
  "Groundnut",
  "Sunflower",
  "Soyabean",
  "Jowar",
  "Bajra",
  "Arhar/Tur",
  "Gram",
  "Masoor",
  "Moong(Green Gram)",
  "Urad",
  "Barley",
  "Ragi",
  "Coconut",
  "Banana",
  "Mango",
  "Citrus Fruit",
  "Grapes",
  "Potato",
  "Onion",
  "Tomato",
  "Cabbage",
  "Brinjal",
  "Bhindi",
  "Beans & Mutter(Vegetable)",
];

const districts = [
  "ANANTAPUR",
  "ARARIA",
  "AURANGABAD",
  "BALOD",
  "BALRAMPUR",
  "BANKA",
  "BARPETA",
  "BASTAR",
  "BEGUSARAI",
  "BHAGALPUR",
  "BHOJPUR",
  "BILASPUR",
  "BUXAR",
  "CHANDIGARH",
  "CHITTOOR",
  "DARBHANGA",
  "DHAMTARI",
  "DURG",
  "EAST GODAVARI",
  "GAYA",
  "GUNTUR",
  "JAMUI",
  "JEHANABAD",
  "KADAPA",
  "KATIHAR",
  "KHAGARIA",
  "KRISHNA",
  "KURNOOL",
  "MADHEPURA",
  "MADHUBANI",
  "MUNGER",
  "MUZAFFARPUR",
  "NALANDA",
  "NAWADA",
  "PATNA",
  "PRAKASAM",
  "PURNIA",
  "ROHTAS",
  "SAHARSA",
  "SAMASTIPUR",
  "SARAN",
  "SITAMARHI",
  "SIWAN",
  "SPSR NELLORE",
  "SRIKAKULAM",
  "SUPAUL",
  "VAISHALI",
  "VISAKHAPATANAM",
  "VIZIANAGARAM",
  "WEST GODAVARI",
];

export function CropYieldPredictor() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<CropYieldPrediction | null>(
    null
  );
  const [formData, setFormData] = useState({
    state_name: "India",
    district_name: "",
    crop_year: new Date().getFullYear(),
    season: "",
    crop: "",
    temperature: "",
    humidity: "",
    soil_moisture: "",
    area: "",
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Making crop yield prediction API call...");
      const response = await agriculturalAPI.getCropYieldPrediction({
        state_name: formData.state_name,
        district_name: formData.district_name,
        crop_year: Number(formData.crop_year),
        season: formData.season,
        crop: formData.crop,
        temperature: Number(formData.temperature),
        humidity: Number(formData.humidity),
        soil_moisture: Number(formData.soil_moisture),
        area: Number(formData.area),
        model_type: "stacked_2",
      });

      console.log("Crop yield prediction response:", response);

      if (response.status === "success") {
        setPrediction(response);
      } else if (response.status === "error") {
        setError(response.error_message || "Prediction failed");
        setPrediction(null);
      } else {
        setError("Unexpected response format");
        setPrediction(null);
      }
    } catch (error) {
      console.error("Error getting crop yield prediction:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to get crop yield prediction. Please try again."
      );
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductivityColor = (rating: string) => {
    switch (rating) {
      case "High":
        return "text-green-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getProductivityIcon = (rating: string) => {
    switch (rating) {
      case "High":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "Medium":
        return <BarChart3 className="h-5 w-5 text-yellow-600" />;
      case "Low":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!prediction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-25 via-rose-25 to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
              <TrendingUp className="h-8 w-8 text-pink-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Crop Yield Predictor
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Predict crop yields using advanced machine learning models based
              on environmental conditions and agricultural parameters
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Prediction Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Form Section */}
            <div className="flex-1">
              <Card className="border-pink-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
                  <CardTitle className="text-pink-800 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Prediction Parameters
                  </CardTitle>
                  <CardDescription className="text-pink-600">
                    Enter the agricultural and environmental parameters for
                    yield prediction
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="district"
                        className="text-sm font-medium text-gray-700"
                      >
                        District
                      </Label>
                      <Select
                        value={formData.district_name}
                        onValueChange={(value) =>
                          handleInputChange("district_name", value)
                        }
                      >
                        <SelectTrigger className="border-pink-200 focus:border-pink-400 w-full">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="year"
                        className="text-sm font-medium text-gray-700"
                      >
                        Crop Year
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        min="2020"
                        max="2030"
                        value={formData.crop_year}
                        onChange={(e) =>
                          handleInputChange(
                            "crop_year",
                            Number.parseInt(e.target.value)
                          )
                        }
                        className="border-pink-200 focus:border-pink-400 w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="season"
                        className="text-sm font-medium text-gray-700"
                      >
                        Season
                      </Label>
                      <Select
                        value={formData.season}
                        onValueChange={(value) =>
                          handleInputChange("season", value)
                        }
                      >
                        <SelectTrigger className="border-pink-200 focus:border-pink-400 w-full">
                          <SelectValue placeholder="Select season" />
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
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label
                        htmlFor="crop"
                        className="text-sm font-medium text-gray-700"
                      >
                        Crop Type
                      </Label>
                      <Select
                        value={formData.crop}
                        onValueChange={(value) =>
                          handleInputChange("crop", value)
                        }
                      >
                        <SelectTrigger className="border-pink-200 focus:border-pink-400 w-full">
                          <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                        <SelectContent>
                          {crops.map((crop) => (
                            <SelectItem key={crop} value={crop}>
                              {crop}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="temperature"
                        className="text-sm font-medium text-gray-700 flex items-center gap-1"
                      >
                        <Thermometer className="h-4 w-4" />
                        Temperature (°C)
                      </Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        placeholder="25.5"
                        value={formData.temperature}
                        onChange={(e) =>
                          handleInputChange("temperature", e.target.value)
                        }
                        className="border-pink-200 focus:border-pink-400 w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="humidity"
                        className="text-sm font-medium text-gray-700 flex items-center gap-1"
                      >
                        <Droplets className="h-4 w-4" />
                        Humidity (%)
                      </Label>
                      <Input
                        id="humidity"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="65"
                        value={formData.humidity}
                        onChange={(e) =>
                          handleInputChange("humidity", e.target.value)
                        }
                        className="border-pink-200 focus:border-pink-400 w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="soil_moisture"
                        className="text-sm font-medium text-gray-700"
                      >
                        Soil Moisture (%)
                      </Label>
                      <Input
                        id="soil_moisture"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="45"
                        value={formData.soil_moisture}
                        onChange={(e) =>
                          handleInputChange("soil_moisture", e.target.value)
                        }
                        className="border-pink-200 focus:border-pink-400 w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="area"
                        className="text-sm font-medium text-gray-700"
                      >
                        Area (hectares)
                      </Label>
                      <Input
                        id="area"
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="10.5"
                        value={formData.area}
                        onChange={(e) =>
                          handleInputChange("area", e.target.value)
                        }
                        className="border-pink-200 focus:border-pink-400 w-full"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handlePredict}
                    disabled={
                      isLoading ||
                      !formData.district_name ||
                      !formData.season ||
                      !formData.crop ||
                      !formData.temperature ||
                      !formData.humidity ||
                      !formData.soil_moisture ||
                      !formData.area
                    }
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 text-lg font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Predicting Yield...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Predict Crop Yield
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Ready to Analyse Box - Right side on large screens, bottom on mobile */}
            <div className="lg:w-80 order-first lg:order-last">
              <Card className="border-pink-200 shadow-lg bg-gradient-to-r from-pink-50 to-rose-50 sticky top-4">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mb-3">
                    <BarChart3 className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-pink-800 mb-2">
                    Ready to Analyse
                  </h3>
                  <p className="text-pink-600 text-sm mb-4">
                    Fill in the parameters and click predict to get detailed
                    crop yield analysis
                  </p>
                  <div className="space-y-2 text-xs text-pink-500">
                    <div className="flex items-center justify-between">
                      <span>District Selection</span>
                      <span>{formData.district_name ? "✓" : "○"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Crop Details</span>
                      <span>
                        {formData.season && formData.crop ? "✓" : "○"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Environmental Data</span>
                      <span>
                        {formData.temperature &&
                        formData.humidity &&
                        formData.soil_moisture
                          ? "✓"
                          : "○"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Area Information</span>
                      <span>{formData.area ? "✓" : "○"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-25 via-rose-25 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
            <Award className="h-8 w-8 text-pink-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Crop Yield Prediction Results
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered yield analysis for {prediction.input_parameters?.crop} in{" "}
            {prediction.input_parameters?.district_name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-pink-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
              <CardTitle className="text-pink-800 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Total Production
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-pink-600 mb-2">
                {prediction.predictions?.total_production}{" "}
                {prediction.predictions?.production_unit}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Confidence:{" "}
                {prediction.predictions?.confidence_interval?.lower_bound} -{" "}
                {prediction.predictions?.confidence_interval?.upper_bound}{" "}
                tonnes (
                {prediction.predictions?.confidence_interval?.confidence_level})
              </div>
              <Progress
                value={Math.min(
                  ((prediction.predictions?.total_production || 0) /
                    (prediction.predictions?.confidence_interval?.upper_bound ||
                      1)) *
                    100,
                  100
                )}
                className="h-2"
              />
            </CardContent>
          </Card>

          <Card className="border-pink-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
              <CardTitle className="text-pink-800 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Yield per Hectare
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-pink-600 mb-2">
                {prediction.predictions?.yield_per_hectare}{" "}
                {prediction.predictions?.production_unit}/ha
              </div>
              <div className="flex items-center gap-2 mb-4">
                {getProductivityIcon(
                  prediction.analysis?.productivity_rating || "Medium"
                )}
                <span
                  className={`font-semibold ${getProductivityColor(prediction.analysis?.productivity_rating || "Medium")}`}
                >
                  {prediction.analysis?.productivity_rating} Productivity
                </span>
              </div>
              <Progress
                value={Math.min(
                  ((prediction.predictions?.yield_per_hectare || 0) / 10) * 100,
                  100
                )}
                className="h-2"
              />
            </CardContent>
          </Card>

          <Card className="border-pink-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
              <CardTitle className="text-pink-800 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Regional Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-pink-500" />
                  <span className="font-medium">
                    {prediction.input_parameters?.season}{" "}
                    {prediction.input_parameters?.crop_year}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-pink-500" />
                  <span>{prediction.analysis?.regional_context}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sprout className="h-4 w-4 text-pink-500" />
                  <span>
                    {prediction.input_parameters?.crop} (
                    {prediction.input_parameters?.area_hectares} ha)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {prediction.feature_importance && (
          <Card className="border-pink-200 shadow-lg mb-8">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
              <CardTitle className="text-pink-800 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Feature Importance Analysis
              </CardTitle>
              <CardDescription className="text-pink-600">
                Impact of different factors on yield prediction
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(prediction.feature_importance).map(
                  ([feature, importance]) => (
                    <div key={feature} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize text-gray-700">
                          {feature.replace("_", " ")}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(importance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={importance * 100} className="h-2" />
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-pink-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
              <CardTitle className="text-pink-800">Input Parameters</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Temperature:
                  </span>
                  <span className="ml-2">
                    {prediction.input_parameters?.temperature}°C
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Humidity:</span>
                  <span className="ml-2">
                    {prediction.input_parameters?.humidity}%
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Soil Moisture:
                  </span>
                  <span className="ml-2">
                    {prediction.input_parameters?.soil_moisture}%
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Area:</span>
                  <span className="ml-2">
                    {prediction.input_parameters?.area_hectares} ha
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
              <CardTitle className="text-pink-800">Model Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Model Used:</span>
                  <span className="ml-2 capitalize">
                    {prediction.model_used?.replace("_", " ") || "Unknown"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Version:</span>
                  <span className="ml-2">
                    {prediction.metadata?.model_version || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Data Source:
                  </span>
                  <span className="ml-2">
                    {prediction.metadata?.data_source || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Prediction Time:
                  </span>
                  <span className="ml-2">
                    {prediction.metadata?.prediction_timestamp
                      ? new Date(
                          prediction.metadata.prediction_timestamp
                        ).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => setPrediction(null)}
            variant="outline"
            className="border-pink-300 text-pink-600 hover:bg-pink-50"
          >
            Make Another Prediction
          </Button>
        </div>
      </div>
    </div>
  );
}
