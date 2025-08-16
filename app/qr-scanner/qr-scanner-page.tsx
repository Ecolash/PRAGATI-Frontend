/* eslint-disable prettier/prettier */
"use client";

import { useState } from "react";
import { ArrowLeft, Scan, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRScanner } from "@/components/qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  agriculturalAPI,
  type WebScrappingResponse,
} from "@/lib/agricultural-api";

interface ScannedItem {
  id: string;
  data: string;
  timestamp: Date;
  type: "url" | "text" | "agricultural" | "unknown";
}

export default function QRScannerPage() {
  const router = useRouter();
  const [currentScan, setCurrentScan] = useState<ScannedItem | null>(null);
  const [webScrapingData, setWebScrapingData] =
    useState<WebScrappingResponse | null>(null);
  const [isLoadingWebData, setIsLoadingWebData] = useState(false);

  const detectQRType = (data: string): ScannedItem["type"] => {
    if (data.startsWith("http://") || data.startsWith("https://")) {
      return "url";
    } else if (
      data.includes("SEED_") ||
      data.includes("FERT_") ||
      data.includes("AGRI_")
    ) {
      return "agricultural";
    } else if (data.length > 0) {
      return "text";
    }
    return "unknown";
  };

  const handleScanSuccess = (data: string) => {
    const newScan: ScannedItem = {
      id: Date.now().toString(),
      data,
      timestamp: new Date(),
      type: detectQRType(data),
    };

    setCurrentScan(newScan);
    setWebScrapingData(null); // Reset previous web data

    // Handle different types of QR codes
    if (newScan.type === "url") {
      // For URLs, you might want to ask user before opening
      console.log("URL detected:", data);
    } else if (newScan.type === "agricultural") {
      // For agricultural codes, automatically fetch web info
      console.log("Agricultural product detected:", data);
      handleWebScraping(data);
    }
  };

  const handleWebScraping = async (query: string) => {
    setIsLoadingWebData(true);
    setWebScrapingData(null);

    try {
      // Generate a meaningful query for web scraping based on QR data
      let searchQuery = query;

      // Enhance query based on QR data type
      if (query.includes("SEED_")) {
        searchQuery = `agricultural seed information ${query.replace("SEED_", "")} price reviews usage`;
      } else if (query.includes("FERT_")) {
        searchQuery = `fertilizer product information ${query.replace("FERT_", "")} application rate price`;
      } else if (query.includes("AGRI_")) {
        searchQuery = `agricultural product ${query.replace("AGRI_", "")} information usage guidelines`;
      } else {
        searchQuery = `Find all relevant information from this URL and list them donw: ${query}`;
      }

      console.log("Web scraping query:", searchQuery);
      const result = await agriculturalAPI.scrapeWebData(searchQuery);
      setWebScrapingData(result);
    } catch (error) {
      console.error("Web scraping failed:", error);
      setWebScrapingData({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch web data",
      });
    } finally {
      setIsLoadingWebData(false);
    }
  };

  const handleScanError = (error: string) => {
    console.error("QR Scan Error:", error);
  };

  const getTypeColor = (type: ScannedItem["type"]) => {
    switch (type) {
      case "url":
        return "bg-blue-100 text-blue-800";
      case "agricultural":
        return "bg-green-100 text-green-800";
      case "text":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getTypeIcon = (type: ScannedItem["type"]) => {
    switch (type) {
      case "url":
        return "🔗";
      case "agricultural":
        return "🌾";
      case "text":
        return "📄";
      default:
        return "❓";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              QR Code Scanner
            </h1>
            <p className="text-gray-600">
              Scan QR codes to get agricultural information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-emerald-600" />
                  Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QRScanner
                  onScanSuccess={handleScanSuccess}
                  onScanError={handleScanError}
                />
              </CardContent>
            </Card>

            {/* Current Scan Result */}
            {currentScan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Latest Scan Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getTypeIcon(currentScan.type)}
                    </span>
                    <Badge className={getTypeColor(currentScan.type)}>
                      {currentScan.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {currentScan.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-mono break-all">
                      {currentScan.data}
                    </p>
                  </div>

                  {currentScan.type === "url" && (
                    <Button
                      onClick={() => window.open(currentScan.data, "_blank")}
                      className="w-full"
                      variant="outline"
                    >
                      Open URL
                    </Button>
                  )}

                  {currentScan.type === "agricultural" && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Agricultural product detected! This could contain
                        information about seeds, fertilizers, or farming
                        products.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Web Scraped Data Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Web Scraped Agricultural Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!currentScan ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500">
                      Scan a QR code to get real-time agricultural information
                      from the web
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* QR Data Header */}
                    <div className="border-b pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {getTypeIcon(currentScan.type)}
                        </span>
                        <Badge className={getTypeColor(currentScan.type)}>
                          {currentScan.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500 ml-auto">
                          Scanned: {currentScan.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded text-sm font-mono break-all">
                        {currentScan.data}
                      </div>
                    </div>

                    {/* Web Scraped Data Output */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          Related Information
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          disabled={isLoadingWebData}
                          onClick={() => {
                            if (currentScan) {
                              handleWebScraping(currentScan.data);
                            }
                          }}
                        >
                          {isLoadingWebData ? (
                            <>
                              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-1" />
                              Searching...
                            </>
                          ) : (
                            <>🔍 Search Web</>
                          )}
                        </Button>
                      </div>
                      {/* Web scraped content */}
                      {isLoadingWebData ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center gap-2 text-blue-700">
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            <span className="font-medium">
                              Searching the web...
                            </span>
                          </div>
                          <p className="text-sm text-blue-600 mt-2">
                            Fetching real-time agricultural information for your
                            scanned QR code.
                          </p>
                        </div>
                      ) : webScrapingData ? (
                        <div
                          className={`rounded-lg p-4 border ${
                            webScrapingData.success
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                              : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                          }`}
                        >
                          {webScrapingData.success ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-green-700">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">
                                  Web Data Retrieved
                                </span>
                              </div>

                              <div className="bg-white rounded p-3 border border-green-200">
                                <div className="text-sm text-gray-700">
                                  {typeof webScrapingData.data === "string" ? (
                                    <p>{webScrapingData.data}</p>
                                  ) : (
                                    <pre className="whitespace-pre-wrap text-xs">
                                      {JSON.stringify(
                                        webScrapingData.data,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  )}
                                </div>
                              </div>

                              {webScrapingData.sources &&
                                webScrapingData.sources.length > 0 && (
                                  <div className="space-y-2">
                                    <h5 className="font-medium text-green-700">
                                      Sources:
                                    </h5>
                                    <div className="space-y-1">
                                      {webScrapingData.sources.map(
                                        (source, index) => (
                                          <a
                                            key={index}
                                            href={source}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:text-blue-800 underline block"
                                          >
                                            {source}
                                          </a>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-red-700">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="font-medium">
                                  Search Failed
                                </span>
                              </div>
                              <p className="text-sm text-red-600">
                                {webScrapingData.error ||
                                  "Unable to fetch web data at this time."}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-blue-700">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">
                                Ready for Web Integration
                              </span>
                            </div>

                            <div className="text-sm text-blue-600 space-y-2">
                              <p>• Product information and pricing</p>
                              <p>• Market trends and availability</p>
                              <p>• Usage instructions and reviews</p>
                              <p>• Safety guidelines and certifications</p>
                            </div>

                            <div className="text-xs text-blue-500 bg-blue-100 rounded p-2 mt-3">
                              💡 Click "Search Web" to get real-time
                              agricultural information about your scanned QR
                              code.
                            </div>
                          </div>
                        </div>
                      )}{" "}
                      {/* Action Buttons */}
                      {currentScan.type === "agricultural" && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            📊 Price Check
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            📋 Product Info
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            🌿 Usage Guide
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            ⭐ Reviews
                          </Button>
                        </div>
                      )}
                      {currentScan.type === "url" && (
                        <Button
                          onClick={() =>
                            window.open(currentScan.data, "_blank")
                          }
                          className="w-full mt-3"
                          variant="outline"
                        >
                          🔗 Open Link
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usage Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>Point your camera directly at the QR code</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>Ensure good lighting for better scanning</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>Keep the camera steady until scan completes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>
                    QR codes on seed packets and fertilizer bags work best
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
