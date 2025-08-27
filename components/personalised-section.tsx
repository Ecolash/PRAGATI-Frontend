"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Sprout,
  Save,
  Navigation,
  Search,
  X,
  Sun,
  Leaf,
  Droplets,
  DollarSign,
  GraduationCap,
  CloudRain,
  Zap,
  Waves,
  Banknote,
  User,
} from "lucide-react";
import { supportedLanguages } from "@/data/languages";
import { availableCrops } from "@/data/crops-data";
import { Crop, FarmerProfile } from "@/components/types/global";

export function PersonalizationPage() {
  const [profile, setProfile] = useState<FarmerProfile>({
    fullName: "",
    location: "",
    landHoldings: 0,
    crops: [],
    preferredLanguage: "",
  });

  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [locationStatus, setLocationStatus] = useState<string>("Not detected");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const [season, setSeason] = useState<string>("");
  const [farmingType, setFarmingType] = useState<string>("");
  const [irrigation, setIrrigation] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [experience, setExperience] = useState<string>("");

  const updateLocation = () => {
    setLocationStatus("Detecting...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          setLocationStatus("Location detected");
        },
        (error) => {
          setLocationStatus("Location access denied");
        },
      );
    } else {
      setLocationStatus("Geolocation not supported");
    }
  };

  const handleCropToggle = (cropId: string) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId)
        ? prev.filter((id) => id !== cropId)
        : [...prev, cropId],
    );
  };

  const removeCrop = (cropId: string) => {
    setSelectedCrops((prev) => prev.filter((id) => id !== cropId));
  };

  const handleSave = () => {
    const updatedProfile = {
      ...profile,
      crops: selectedCrops,
      coordinates,
      season,
      farmingType,
      irrigation,
      budget,
      experience,
    };
    alert("Profile saved successfully!");
  };

  const filteredCrops = availableCrops.filter(
    (crop) =>
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const groupedCrops = filteredCrops.reduce(
    (acc, crop) => {
      if (!acc[crop.category]) {
        acc[crop.category] = [];
      }
      acc[crop.category].push(crop);
      return acc;
    },
    {} as Record<string, typeof availableCrops>,
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const hectaresToAcres = (hectares: number) => (hectares * 2.471).toFixed(2);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-3">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Farmer Profile
            </h1>
            <p className="text-sm text-green-700">
              Customize your agricultural settings
            </p>
          </div>
        </div>

        <Card className="border-green-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-4 h-4" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-green-700 font-medium text-sm">
                  Location
                </Label>
                <div className="flex gap-2">
                  <Button
                    onClick={updateLocation}
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent h-8 text-xs"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Update
                  </Button>
                  <span className="text-xs text-green-600 self-center">
                    {locationStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="landHoldings"
                  className="text-green-700 font-medium text-sm"
                >
                  Land (hectares)
                </Label>
                <div className="space-y-1">
                  <Input
                    id="landHoldings"
                    type="number"
                    step="0.1"
                    value={profile.landHoldings}
                    onChange={(e) =>
                      setProfile((prev: any) => ({
                        ...prev,
                        landHoldings: Number(e.target.value),
                      }))
                    }
                    placeholder="0.0"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 h-8 text-sm"
                  />
                  {profile.landHoldings > 0 && (
                    <p className="text-xs text-green-600">
                      ≈ {hectaresToAcres(profile.landHoldings)} acres
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-green-700 font-medium text-sm">
                  Language
                </Label>
                <Select
                  value={profile.preferredLanguage}
                  onValueChange={(value) =>
                    setProfile((prev: any) => ({
                      ...prev,
                      preferredLanguage: value,
                    }))
                  }
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 h-8 text-sm w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        <div className="flex items-center gap-2">
                          <span>{language.flag}</span>
                          <span className="text-sm">{language.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t border-green-100 pt-4">
              <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Farming Profile
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-green-700 font-medium text-xs flex items-center gap-1">
                      <Sun className="w-3 h-3 text-orange-500" />
                      Season
                    </Label>
                    <Select value={season} onValueChange={setSeason}>
                      <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 h-8 text-xs w-full">
                        <SelectValue placeholder="Season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kharif">
                          <div className="flex items-center gap-2">
                            <CloudRain className="w-3 h-3 text-blue-500" />
                            <span>Kharif</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Rabi">
                          <div className="flex items-center gap-2">
                            <Sun className="w-3 h-3 text-yellow-500" />
                            <span>Rabi</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Zaid">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-orange-500" />
                            <span>Zaid</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Year-round">
                          <div className="flex items-center gap-2">
                            <Sprout className="w-3 h-3 text-green-500" />
                            <span>Year-round</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-green-700 font-medium text-xs flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-green-500" />
                      Type
                    </Label>
                    <Select value={farmingType} onValueChange={setFarmingType}>
                      <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 h-8 text-xs w-full">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Organic">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Organic</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Conventional">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Conventional</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Mixed">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Mixed</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Natural">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span>Natural</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-green-700 font-medium text-xs flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      Irrigation
                    </Label>
                    <Select value={irrigation} onValueChange={setIrrigation}>
                      <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 h-8 text-xs w-full">
                        <SelectValue placeholder="Irrigation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rainfed">
                          <div className="flex items-center gap-2">
                            <CloudRain className="w-3 h-3 text-blue-600" />
                            <span>Rainfed</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Drip">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-3 h-3 text-cyan-600" />
                            <span>Drip</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Sprinkler">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-blue-500" />
                            <span>Sprinkler</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Flood">
                          <div className="flex items-center gap-2">
                            <Waves className="w-3 h-3 text-blue-700" />
                            <span>Flood</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Mixed">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                            <span>Mixed</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-green-700 font-medium text-xs flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-yellow-500" />
                      Budget
                    </Label>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 h-8 text-xs w-full">
                        <SelectValue placeholder="Budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-3 h-3 text-red-500" />
                            <span>Low</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Medium">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-3 h-3 text-yellow-500" />
                            <span>Medium</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="High">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-3 h-3 text-green-500" />
                            <span>High</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-green-700 font-medium text-xs flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-purple-500" />
                      Experience
                    </Label>
                    <Select value={experience} onValueChange={setExperience}>
                      <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 h-8 text-xs w-full">
                        <SelectValue placeholder="Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-green-500" />
                            <span>Beginner</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Intermediate">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-yellow-500" />
                            <span>Intermediate</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Expert">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-3 h-3 text-purple-500" />
                            <span>Expert</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-green-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-green-700 flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  Your Crops ({selectedCrops.length})
                </h3>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-green-500" />
                  <Input
                    placeholder="Search crops..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-7 w-32 text-xs border-green-200 focus:border-green-500"
                  />
                </div>
              </div>

              {selectedCrops.length > 0 && (
                <div className="bg-green-50 rounded-lg p-2 mb-3 border border-green-200">
                  <div className="flex flex-wrap gap-1">
                    {selectedCrops.map((cropId) => {
                      const crop = availableCrops.find((c) => c.id === cropId);
                      return crop ? (
                        <Badge
                          key={cropId}
                          variant="secondary"
                          className="bg-green-100 text-green-800 border-green-300 text-xs px-2 py-1 hover:bg-green-200 transition-colors group cursor-pointer"
                          onClick={() => removeCrop(cropId)}
                        >
                          <span className="flex items-center gap-1">
                            {crop.emoji} {crop.name}
                            <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(groupedCrops).map(([category, crops]) => (
                  <div key={category} className="space-y-2">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 rounded-lg px-3 py-2 transition-all duration-200 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md"
                    >
                      <span className="font-semibold text-green-800 text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {category}
                        <Badge
                          variant="secondary"
                          className="bg-green-200 text-green-800 text-xs px-2 py-0.5 font-medium"
                        >
                          {crops.length}
                        </Badge>
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold transition-transform duration-200 ${expandedCategories[category] ? "rotate-45" : ""}`}
                      >
                        {expandedCategories[category] ? "−" : "+"}
                      </div>
                    </button>

                    {(expandedCategories[category] || searchTerm) && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pl-3">
                        {crops.map((crop: Crop) => (
                          <div
                            key={crop.id}
                            className={`flex items-center space-x-2 p-2.5 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                              selectedCrops.includes(crop.id)
                                ? "bg-green-100 border-green-300 shadow-sm"
                                : "bg-white border-green-100 hover:bg-green-50 hover:border-green-200"
                            }`}
                            onClick={() => handleCropToggle(crop.id)}
                          >
                            <Checkbox
                              id={crop.id}
                              checked={selectedCrops.includes(crop.id)}
                              onCheckedChange={() => handleCropToggle(crop.id)}
                              className="border-green-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 h-3.5 w-3.5"
                            />
                            <Label
                              htmlFor={crop.id}
                              className="text-sm font-medium cursor-pointer flex items-center gap-1.5 flex-1"
                            >
                              <span className="text-base">{crop.emoji}</span>
                              <span className="truncate">{crop.name}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
