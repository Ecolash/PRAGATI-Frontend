"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Zap,
  Sunrise,
  Sunset,
  Loader2,
  Navigation,
  Clock,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Bar,
  BarChart,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface WeatherLocation {
  latitude: number;
  longitude: number;
  timezone: string;
}

interface ForecastDay {
  date: string;
  temperatures_celsius: {
    max: number;
    min: number;
  };
  humidity_percent: {
    daytime: number;
    nighttime: number;
  };
  precipitation: {
    sum_mm: number;
    probability_percent: number;
  };
  thunderstorm_probability_percent: number;
  wind_kmh: {
    speed_max: number;
    gust_max: number;
  };
  cloud_cover_percent: number;
  uv_index_max: number;
  max_heat_index_celsius: number;
  sun_events: {
    sunrise: string;
    sunset: string;
  };
}

interface WeatherResponse {
  location: WeatherLocation;
  forecast_days: ForecastDay[];
}

export function WeatherForecast() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const getLocation = async () => {
    setIsLoadingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        setError(`Location error: ${error.message}`);
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const getWeatherForecast = async () => {
    if (!location) {
      setError("Please get your location first");
      return;
    }

    setIsLoadingWeather(true);
    setError(null);

    try {
      // Mock API call - replace with your actual weather API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay

      // Mock response based on the provided schema
      const mockWeatherData: WeatherResponse = {
        location: {
          latitude: location.lat,
          longitude: location.lon,
          timezone: "Auto-detected",
        },
        forecast_days: [
          {
            date: new Date().toISOString().split("T")[0],
            temperatures_celsius: { max: 28, min: 22 },
            humidity_percent: { daytime: 65, nighttime: 80 },
            precipitation: { sum_mm: 2.5, probability_percent: 30 },
            thunderstorm_probability_percent: 20,
            wind_kmh: { speed_max: 15, gust_max: 25 },
            cloud_cover_percent: 60,
            uv_index_max: 6,
            max_heat_index_celsius: 32,
            sun_events: {
              sunrise: new Date().toISOString(),
              sunset: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
            },
          },
          {
            date: new Date(Date.now() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            temperatures_celsius: { max: 30, min: 24 },
            humidity_percent: { daytime: 70, nighttime: 85 },
            precipitation: { sum_mm: 5.2, probability_percent: 60 },
            thunderstorm_probability_percent: 40,
            wind_kmh: { speed_max: 18, gust_max: 30 },
            cloud_cover_percent: 80,
            uv_index_max: 5,
            max_heat_index_celsius: 35,
            sun_events: {
              sunrise: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              sunset: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
            },
          },
        ],
      };

      setWeatherData(mockWeatherData);
    } catch (err) {
      setError("Failed to fetch weather data" + err);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getWeatherIcon = (day: ForecastDay) => {
    if (day.precipitation.probability_percent > 60) {
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    } else if (day.cloud_cover_percent > 70) {
      return <Cloud className="h-8 w-8 text-gray-500" />;
    } else {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const nextDay = () => {
    if (weatherData && currentDayIndex < weatherData.forecast_days.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const prevDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const getTemperatureChartData = () => {
    if (!weatherData) return [];
    return weatherData.forecast_days.map((day, index) => ({
      day: index === 0 ? "Today" : formatDate(day.date).split(" ")[0],
      max: day.temperatures_celsius.max,
      min: day.temperatures_celsius.min,
    }));
  };

  const getPrecipitationChartData = () => {
    if (!weatherData) return [];
    return weatherData.forecast_days.map((day, index) => ({
      day: index === 0 ? "Today" : formatDate(day.date).split(" ")[0],
      precipitation: day.precipitation.sum_mm,
      probability: day.precipitation.probability_percent,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {!weatherData ? (
        <div className="text-center space-y-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 rounded-2xl p-8 md:p-12 border border-blue-100">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-white rounded-full p-6 shadow-lg">
                    <Cloud className="h-8 w-8 lg:h-16 lg:w-16 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Weather Forecast
                </h1>
                <p className="text-sm lg:text-lg text-gray-600 leading-relaxed">
                  Get accurate weather predictions for your location. View
                  detailed forecasts including temperature, precipitation, wind
                  conditions, and more.
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-4 mt-8">
                <div className="flex flex-col items-center p-2 lg:p-4 bg-white/60 rounded-xl border border-blue-100">
                  <MapPin className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Location Detection
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 lg:p-4 bg-white/60 rounded-xl border border-blue-100">
                  <Thermometer className="h-8 w-8 text-red-500 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Detailed Forecasts
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 lg:p-4 bg-white/60 rounded-xl border border-blue-100">
                  <Sun className="h-8 w-8 text-yellow-500 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Multi-day Outlook
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <Card className="bg-white/80 backdrop-blur border-blue-200 shadow-md sm:shadow-lg">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
                  Get Started
                </h2>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
                  <Button
                    onClick={getLocation}
                    disabled={isLoadingLocation}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 flex-1 w-full sm:w-auto px-4 py-2"
                  >
                    {isLoadingLocation ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Navigation className="h-5 w-5" />
                    )}
                    {isLoadingLocation ? "Getting..." : "My Location"}
                  </Button>

                  <Button
                    onClick={getWeatherForecast}
                    disabled={!location || isLoadingWeather}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 flex-1 w-full sm:w-auto disabled:opacity-50  px-4 py-2"
                  >
                    {isLoadingWeather ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Cloud className="h-5 w-5" />
                    )}
                    {isLoadingWeather ? "Loading..." : "Get Weather"}
                  </Button>
                </div>

                {location && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs sm:text-sm font-medium">
                        {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="max-w-md mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-center">
                      <p className="font-medium text-sm">Error</p>
                      <p className="text-xs mt-0.5">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header with location info */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {weatherData.forecast_days.length} Day Weather Forecast
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {weatherData.location.latitude.toFixed(4)},{" "}
                  {weatherData.location.longitude.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Timezone: {weatherData.location.timezone}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Button
                onClick={() => {
                  setWeatherData(null);
                  setLocation(null);
                  setError(null);
                  setCurrentDayIndex(0);
                  setShowAnalytics(false);
                }}
                variant="outline"
                size="sm"
              >
                Get New Forecast
              </Button>
              {/* Analytics toggle button */}
              <Button
                onClick={() => setShowAnalytics(!showAnalytics)}
                variant={showAnalytics ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                {showAnalytics ? "Hide Analytics" : "Show Analytics"}
              </Button>
            </div>
          </div>

          {/* Analytics section */}
          {showAnalytics && (
            <div className="space-y-6">
              <Card className="bg-white/95 backdrop-blur-sm border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Weather Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                    {/* Temperature Trend Chart */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">
                        Temperature Trend
                      </h3>
                      <div className="w-full overflow-x-auto">
                        <ChartContainer
                          config={{
                            max: {
                              label: "Max Temperature (°C)",
                              color: "#ef4444", // Red-500
                            },
                            min: {
                              label: "Min Temperature (°C)",
                              color: "#3b82f6", // Blue-500
                            },
                          }}
                          className="h-[250px] sm:h-[300px] min-w-[300px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={getTemperatureChartData()}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 20,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                                opacity={0.5}
                              />
                              <XAxis
                                dataKey="day"
                                tick={{ fontSize: 12, fill: "#374151" }}
                                axisLine={{ stroke: "#9ca3af" }}
                                tickLine={{ stroke: "#9ca3af" }}
                              />
                              <YAxis
                                tick={{ fontSize: 12, fill: "#374151" }}
                                axisLine={{ stroke: "#9ca3af" }}
                                tickLine={{ stroke: "#9ca3af" }}
                                label={{
                                  value: "Temperature (°C)",
                                  angle: -90,
                                  position: "insideLeft",
                                  style: {
                                    textAnchor: "middle",
                                    fill: "#374151",
                                  },
                                }}
                              />
                              <ChartTooltip
                                content={<ChartTooltipContent />}
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "8px",
                                  boxShadow:
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                              />
                              <Legend
                                wrapperStyle={{ paddingTop: "20px" }}
                                iconType="line"
                              />
                              <Line
                                type="monotone"
                                dataKey="max"
                                stroke="#ef4444"
                                name="Max Temperature (°C)"
                                strokeWidth={3}
                                dot={{ fill: "#ef4444", strokeWidth: 2, r: 5 }}
                                activeDot={{
                                  r: 7,
                                  stroke: "#ef4444",
                                  strokeWidth: 2,
                                  fill: "#fef2f2",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="min"
                                stroke="#3b82f6"
                                name="Min Temperature (°C)"
                                strokeWidth={3}
                                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                                activeDot={{
                                  r: 7,
                                  stroke: "#3b82f6",
                                  strokeWidth: 2,
                                  fill: "#eff6ff",
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </div>

                    {/* Precipitation Chart */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">
                        Precipitation & Probability Forecast
                      </h3>
                      <div className="w-full overflow-x-auto">
                        <ChartContainer
                          config={{
                            precipitation: {
                              label: "Precipitation (mm)",
                              color: "#06b6d4", // Cyan-500
                            },
                            probability: {
                              label: "Rain Probability (%)",
                              color: "#8b5cf6", // Violet-500
                            },
                          }}
                          className="h-[250px] sm:h-[300px] min-w-[300px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={getPrecipitationChartData()}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 20,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                                opacity={0.5}
                              />
                              <XAxis
                                dataKey="day"
                                tick={{ fontSize: 12, fill: "#374151" }}
                                axisLine={{ stroke: "#9ca3af" }}
                                tickLine={{ stroke: "#9ca3af" }}
                              />
                              <YAxis
                                yAxisId="left"
                                tick={{ fontSize: 12, fill: "#374151" }}
                                axisLine={{ stroke: "#9ca3af" }}
                                tickLine={{ stroke: "#9ca3af" }}
                                label={{
                                  value: "Precipitation (mm)",
                                  angle: -90,
                                  position: "insideLeft",
                                  style: {
                                    textAnchor: "middle",
                                    fill: "#374151",
                                  },
                                }}
                              />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 12, fill: "#374151" }}
                                axisLine={{ stroke: "#9ca3af" }}
                                tickLine={{ stroke: "#9ca3af" }}
                                label={{
                                  value: "Probability (%)",
                                  angle: 90,
                                  position: "insideRight",
                                  style: {
                                    textAnchor: "middle",
                                    fill: "#374151",
                                  },
                                }}
                              />
                              <ChartTooltip
                                content={<ChartTooltipContent />}
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "8px",
                                  boxShadow:
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                              />
                              <Legend wrapperStyle={{ paddingTop: "20px" }} />
                              <Bar
                                yAxisId="left"
                                dataKey="precipitation"
                                fill="#06b6d4"
                                name="Precipitation (mm)"
                                radius={[4, 4, 0, 0]}
                                opacity={0.8}
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="probability"
                                stroke="#8b5cf6"
                                name="Rain Probability (%)"
                                strokeWidth={3}
                                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 5 }}
                                activeDot={{
                                  r: 7,
                                  stroke: "#8b5cf6",
                                  strokeWidth: 2,
                                  fill: "#f3e8ff",
                                }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="block lg:hidden">
            {/* Mobile carousel view */}
            <div className="space-y-4">
              {/* Navigation controls */}
              <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                <Button
                  onClick={prevDay}
                  disabled={currentDayIndex === 0}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {currentDayIndex === 0
                      ? "Today"
                      : formatDate(
                          weatherData.forecast_days[currentDayIndex].date,
                        )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentDayIndex + 1} of {weatherData.forecast_days.length}
                  </div>
                </div>

                <Button
                  onClick={nextDay}
                  disabled={
                    currentDayIndex === weatherData.forecast_days.length - 1
                  }
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Current day card */}
              <Card className="bg-white/95 backdrop-blur-sm border-blue-100 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {currentDayIndex === 0
                          ? "Today"
                          : formatDate(
                              weatherData.forecast_days[currentDayIndex].date,
                            )}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {weatherData.forecast_days[currentDayIndex].date}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getWeatherIcon(
                        weatherData.forecast_days[currentDayIndex],
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Temperature - most prominent */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-6 w-6 text-red-500" />
                        <span className="font-medium text-gray-700">
                          Temperature
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          {Math.round(
                            weatherData.forecast_days[currentDayIndex]
                              .temperatures_celsius.max,
                          )}
                          °C
                        </div>
                        <div className="text-base text-gray-600">
                          Low:{" "}
                          {Math.round(
                            weatherData.forecast_days[currentDayIndex]
                              .temperatures_celsius.min,
                          )}
                          °C
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weather conditions grid - larger for mobile */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <CloudRain className="h-5 w-5 text-blue-500" />
                        <span className="font-medium text-gray-700">Rain</span>
                      </div>
                      <Badge
                        variant={
                          weatherData.forecast_days[currentDayIndex]
                            .precipitation.probability_percent > 50
                            ? "destructive"
                            : "secondary"
                        }
                        className="mb-2"
                      >
                        {
                          weatherData.forecast_days[currentDayIndex]
                            .precipitation.probability_percent
                        }
                        %
                      </Badge>
                      <div className="text-sm text-gray-600">
                        {weatherData.forecast_days[
                          currentDayIndex
                        ].precipitation.sum_mm.toFixed(1)}
                        mm
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Wind className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Wind</span>
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">
                        {
                          weatherData.forecast_days[currentDayIndex].wind_kmh
                            .speed_max
                        }{" "}
                        km/h
                      </div>
                      <div className="text-sm text-gray-600">
                        Gusts:{" "}
                        {
                          weatherData.forecast_days[currentDayIndex].wind_kmh
                            .gust_max
                        }{" "}
                        km/h
                      </div>
                    </div>
                  </div>

                  {/* Additional details - larger spacing for mobile */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          Humidity:{" "}
                          {
                            weatherData.forecast_days[currentDayIndex]
                              .humidity_percent.daytime
                          }
                          %
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-orange-50 rounded-lg p-3">
                        <Eye className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-700">
                          UV:{" "}
                          {
                            weatherData.forecast_days[currentDayIndex]
                              .uv_index_max
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-3">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-gray-700">
                          Storm:{" "}
                          {
                            weatherData.forecast_days[currentDayIndex]
                              .thunderstorm_probability_percent
                          }
                          %
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                        <Cloud className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Clouds:{" "}
                          {
                            weatherData.forecast_days[currentDayIndex]
                              .cloud_cover_percent
                          }
                          %
                        </span>
                      </div>
                    </div>

                    {/* Sun events */}
                    <div className="flex justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Sunrise className="h-5 w-5 text-orange-400" />
                        <span className="font-medium text-gray-700">
                          {formatTime(
                            weatherData.forecast_days[currentDayIndex]
                              .sun_events.sunrise,
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sunset className="h-5 w-5 text-orange-600" />
                        <span className="font-medium text-gray-700">
                          {formatTime(
                            weatherData.forecast_days[currentDayIndex]
                              .sun_events.sunset,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Day indicators */}
              <div className="flex justify-center gap-2">
                {weatherData.forecast_days.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDayIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentDayIndex ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop grid view */}
          <div className="hidden lg:block">
            <div
              className={`grid gap-4 ${
                weatherData.forecast_days.length === 1
                  ? "grid-cols-1 max-w-md mx-auto"
                  : weatherData.forecast_days.length === 2
                    ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                    : weatherData.forecast_days.length <= 4
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {weatherData.forecast_days.map((day, index) => (
                <Card
                  key={day.date}
                  className="bg-white/95 backdrop-blur-sm border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {index === 0 ? "Today" : formatDate(day.date)}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1">{day.date}</p>
                      </div>
                      <div className="flex-shrink-0">{getWeatherIcon(day)}</div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Temperature - most prominent */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 border border-red-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-5 w-5 text-red-500" />
                          <span className="font-medium text-gray-700">
                            Temperature
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {Math.round(day.temperatures_celsius.max)}°C
                          </div>
                          <div className="text-sm text-gray-600">
                            Low: {Math.round(day.temperatures_celsius.min)}°C
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weather conditions grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Precipitation */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <CloudRain className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Rain
                          </span>
                        </div>
                        <Badge
                          variant={
                            day.precipitation.probability_percent > 50
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs mb-1"
                        >
                          {day.precipitation.probability_percent}%
                        </Badge>
                        <div className="text-xs text-gray-600">
                          {day.precipitation.sum_mm.toFixed(1)}mm
                        </div>
                      </div>

                      {/* Wind */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Wind
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {day.wind_kmh.speed_max} km/h
                        </div>
                        <div className="text-xs text-gray-600">
                          Gusts: {day.wind_kmh.gust_max} km/h
                        </div>
                      </div>
                    </div>

                    {/* Additional details */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 bg-blue-50 rounded p-2">
                          <Droplets className="h-3 w-3 text-blue-500" />
                          <span className="text-gray-700">
                            Humidity: {day.humidity_percent.daytime}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-orange-50 rounded p-2">
                          <Eye className="h-3 w-3 text-orange-500" />
                          <span className="text-gray-700">
                            UV: {day.uv_index_max}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-purple-50 rounded p-2">
                          <Zap className="h-3 w-3 text-purple-500" />
                          <span className="text-gray-700">
                            Storm: {day.thunderstorm_probability_percent}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 rounded p-2">
                          <Cloud className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-700">
                            Clouds: {day.cloud_cover_percent}%
                          </span>
                        </div>
                      </div>

                      {/* Sun events */}
                      <div className="flex justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Sunrise className="h-4 w-4 text-orange-400" />
                          <span className="text-xs font-medium text-gray-700">
                            {formatTime(day.sun_events.sunrise)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sunset className="h-4 w-4 text-orange-600" />
                          <span className="text-xs font-medium text-gray-700">
                            {formatTime(day.sun_events.sunset)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
