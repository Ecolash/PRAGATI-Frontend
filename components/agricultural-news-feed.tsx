"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Search, Loader2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { agriculturalAPI } from "@/lib/agricultural-api";

export function AgriculturalNewsFeed() {
  const [query, setQuery] = useState(
    "latest loan and government schemes for farmers",
  );
  const [newsContent, setNewsContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching agricultural news for query:", query);

      const response = await agriculturalAPI.getAgriculturalNews({
        query: query.trim(),
      });

      console.log("News API response:", response);

      if (response.success && response.response) {
        setNewsContent(response.response);
      } else {
        setError(response.error || "Failed to fetch agricultural news");
        setNewsContent(null);
      }
    } catch (err) {
      console.error("News fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch agricultural news. Please try again.",
      );
      setNewsContent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gray-600 rounded-full">
              <Newspaper className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Agricultural News Feed
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Stay updated with the latest agricultural news, government schemes,
            and farming insights
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 border-gray-200 shadow-lg">
          <CardHeader className="bg-gray-600 text-white">
            <CardTitle className="flex items-center gap-2 py-2">
              <Search className="h-5 w-5" />
              Search Agricultural News
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <form onSubmit={handleSearch} className="flex gap-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your search query (e.g., government schemes, crop prices, weather updates)"
                className="flex-1 border-gray-300 focus:border-gray-500"
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {newsContent && (
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gray-100 border-b border-gray-200">
              <CardTitle className="text-gray-800">News Results</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-gray max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mt-6 mb-3">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg md:text-xl font-medium text-gray-600 mt-4 mb-2">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-700 mb-3 leading-relaxed text-sm md:text-base">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm md:text-base leading-relaxed">
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-800">
                        {children}
                      </strong>
                    ),
                    hr: () => <hr className="my-6 border-gray-300" />,
                    em: ({ children }) => (
                      <em className="italic text-gray-600">{children}</em>
                    ),
                  }}
                >
                  {newsContent}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Initial State */}
        {!newsContent && !loading && !error && (
          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <Newspaper className="h-10 w-10 text-gray-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Ready to Fetch Agricultural News
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Enter your search query above to get the latest agricultural
                news, government schemes, and farming insights tailored to your
                needs.
              </p>
              <Button
                onClick={fetchNews}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Get Latest News
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
