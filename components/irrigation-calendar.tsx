/* eslint-disable prettier/prettier */
"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Droplets,
  CalendarIcon,
  Trash2,
  Edit3,
  Plus,
  MapPin,
  Gauge,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { getUser } from "@/lib/actions/getUser";
import { ensureDate } from "@/lib/date-utils";

interface IrrigationDetail {
  id: number;
  irrigationDate: Date;
  areaIrrigated: number; // in acres
  waterUsed: number; // in liters
  notes?: string;
}

export function IrrigationCalendar() {
  const [irrigationDetails, setIrrigationDetails] = useState<
    IrrigationDetail[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<IrrigationDetail | null>(
    null
  );
  const [formData, setFormData] = useState({
    areaIrrigated: "",
    waterUsed: "",
    notes: "",
  });

  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getUser().then((res) => {
      setUserId(res.user?.id ?? null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    const fetchRecords = async () => {
      const res = await fetch(`/api/irrigation-calendar?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setIrrigationDetails(
          data.map((d) => ({
            ...d,
            irrigationDate: ensureDate(d.irrigationDate),
          }))
        );
      }
    };
    fetchRecords();
  }, [userId, loading]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);

    // Check if date already has irrigation details
    const existingDetail = irrigationDetails.find((detail) =>
      isSameDay(detail.irrigationDate, date)
    );

    if (existingDetail) {
      // Open dialog to edit existing details
      setEditingDetail(existingDetail);
      setFormData({
        areaIrrigated: existingDetail.areaIrrigated.toString(),
        waterUsed: existingDetail.waterUsed.toString(),
        notes: existingDetail.notes || "",
      });
      setIsDialogOpen(true);
    } else {
      // Open dialog to add new irrigation details
      setEditingDetail(null);
      setFormData({
        areaIrrigated: "",
        waterUsed: "",
        notes: "",
      });
      setIsDialogOpen(true);
    }
  };

  const handleSaveIrrigation = async () => {
    if (!selectedDate || !formData.areaIrrigated || !formData.waterUsed) return;

    const payload = {
      userId,
      irrigationDate: selectedDate,
      areaIrrigated: Number(formData.areaIrrigated),
      waterUsed: Number(formData.waterUsed),
      notes: formData.notes,
    };

    const res = await fetch("/api/irrigation-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const newDetail = await res.json();

    if (editingDetail) {
      // Update existing detail
      setIrrigationDetails((prev) =>
        prev.map((detail) =>
          isSameDay(ensureDate(detail.irrigationDate), selectedDate)
            ? newDetail
            : detail
        )
      );
    } else {
      // Add new detail
      setIrrigationDetails((prev) => [...prev, newDetail]);
    }

    setIsDialogOpen(false);
    setFormData({ areaIrrigated: "", waterUsed: "", notes: "" });
  };

  const handleDeleteIrrigation = (date: Date) => {
    setIrrigationDetails((prev) =>
      prev.filter((detail) => !isSameDay(detail.irrigationDate, date))
    );
    setIsDialogOpen(false);
  };

  const clearAllIrrigationDates = () => {
    setIrrigationDetails([]);
  };

  const getRecentIrrigationDetails = () => {
    return irrigationDetails
      .sort(
        (a, b) =>
          ensureDate(b.irrigationDate).getTime() -
          ensureDate(a.irrigationDate).getTime()
      )
      .slice(0, 5);
  };

  const modifiers = {
    irrigated: irrigationDetails.map((detail) => detail.irrigationDate),
  };

  const modifiersStyles = {
    irrigated: {
      backgroundColor: "#3b82f6",
      color: "white",
      fontWeight: "bold",
    },
  };

  const totalArea = irrigationDetails.reduce(
    (sum, detail) => sum + detail.areaIrrigated,
    0
  );
  const totalWater = irrigationDetails.reduce(
    (sum, detail) => sum + detail.waterUsed,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Droplets className="h-8 w-8 text-blue-600 animate-bounce mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Loading your irrigation records...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Droplets className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Irrigation Calendar
            </h1>
          </div>
          <p className="text-gray-600">
            Track your crop irrigation schedule with detailed information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarIcon className="h-5 w-5 text-green-600" />
                  Select Irrigation Dates
                </CardTitle>
                <CardDescription>
                  Click on any date to add irrigation details. Blue dates
                  indicate irrigation days.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  className="rounded-md border shadow-sm bg-white"
                  classNames={{
                    months:
                      "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button:
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell:
                      "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors cursor-pointer",
                    day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground font-semibold",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled:
                      "text-muted-foreground opacity-50 cursor-not-allowed",
                    day_range_middle:
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Irrigation Summary */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Irrigation Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Total Days</span>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-0"
                  >
                    {irrigationDetails.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">This Month</span>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-0"
                  >
                    {
                      irrigationDetails.filter(
                        (detail) =>
                          ensureDate(detail.irrigationDate).getMonth() ===
                            new Date().getMonth() &&
                          ensureDate(detail.irrigationDate).getFullYear() ===
                            new Date().getFullYear()
                      ).length
                    }
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Total Area</span>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-0"
                  >
                    {totalArea.toFixed(1)} acres
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Total Water</span>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-0"
                  >
                    {totalWater.toFixed(0)} L
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Irrigation Details */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Irrigation</CardTitle>
                  {irrigationDetails.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllIrrigationDates}
                      className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {irrigationDetails.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No irrigation records yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {getRecentIrrigationDetails().map((detail, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-blue-50 border border-blue-100 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {format(detail.irrigationDate, "MMM dd, yyyy")}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDateSelect(detail.irrigationDate)
                            }
                            className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{detail.areaIrrigated} acres</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Gauge className="h-3 w-3" />
                            <span>{detail.waterUsed} L</span>
                          </div>
                        </div>
                        {detail.notes && (
                          <p className="text-xs text-gray-500 italic">
                            {detail.notes}
                          </p>
                        )}
                      </div>
                    ))}
                    {irrigationDetails.length > 5 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        +{irrigationDetails.length - 5} more records
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="shadow-lg border-0 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-800 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    How to use
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Click on any date to add irrigation details</li>
                    <li>• Blue dates show irrigation days</li>
                    <li>• Click on blue dates to edit details</li>
                    <li>• Track area irrigated and water used</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingDetail ? (
                  <Edit3 className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                {editingDetail ? "Edit" : "Add"} Irrigation Details
              </DialogTitle>
              <DialogDescription>
                {selectedDate && format(selectedDate, "MMMM dd, yyyy")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area Irrigated (acres)</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  value={formData.areaIrrigated}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      areaIrrigated: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="water">Water Used (liters)</Label>
                <Input
                  id="water"
                  type="number"
                  placeholder="e.g., 1000"
                  value={formData.waterUsed}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      waterUsed: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="e.g., Morning irrigation, drip system"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              {editingDetail && (
                <Button
                  variant="destructive"
                  onClick={() =>
                    selectedDate && handleDeleteIrrigation(selectedDate)
                  }
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveIrrigation}
                disabled={!formData.areaIrrigated || !formData.waterUsed}
              >
                {editingDetail ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
