"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Leaf,
  ArrowRight,
  Users,
  BarChart3,
  CloudRain,
  Sprout,
  Bug,
  TrendingUp,
  DollarSign,
  TestTube,
  Activity,
  Zap,
  Star,
  CheckCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);

  useEffect(() => {
    // Check if user is already authenticated
    const userData = localStorage.getItem("pragati_user");
    if (userData) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;
      if (width >= 1280)
        setCardsPerView(4); // xl
      else if (width >= 1024)
        setCardsPerView(3); // lg
      else if (width >= 768)
        setCardsPerView(2); // md
      else setCardsPerView(1); // mobile
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const aiAgents = [
    {
      title: "Crop Yield Prediction",
      description:
        "AI-powered forecasting to predict your crop yields with 95% accuracy using historical data and current conditions.",
      icon: BarChart3,
      color: "from-green-500 to-emerald-500",
      features: [
        "Historical Analysis",
        "Weather Integration",
        "Soil Data Processing",
      ],
    },
    {
      title: "Weather & Climate Advisory",
      description:
        "Real-time weather monitoring and climate advisory system for optimal farming decisions.",
      icon: CloudRain,
      color: "from-blue-500 to-cyan-500",
      features: ["7-Day Forecasts", "Climate Alerts", "Irrigation Timing"],
    },
    {
      title: "Crop & Seed Recommendation",
      description:
        "Soil test analysis to recommend the best crops and seeds for your specific land conditions.",
      icon: Sprout,
      color: "from-amber-500 to-orange-500",
      features: ["Soil Analysis", "Crop Matching", "Seasonal Planning"],
    },
    {
      title: "Crop Health Analyzer",
      description:
        "Advanced disease prediction and health monitoring using computer vision and AI diagnostics.",
      icon: Activity,
      color: "from-red-500 to-pink-500",
      features: ["Disease Detection", "Health Scoring", "Treatment Plans"],
    },
    {
      title: "Real-time Market Prices",
      description:
        "Live market price tracking for all major crops to help you make profitable selling decisions.",
      icon: DollarSign,
      color: "from-purple-500 to-violet-500",
      features: ["Live Prices", "Market Trends", "Price Alerts"],
    },
    {
      title: "Fertilizer Recommendation",
      description:
        "Precise fertilizer recommendations based on soil nutrients and crop requirements.",
      icon: TestTube,
      color: "from-teal-500 to-green-500",
      features: ["Nutrient Analysis", "Custom Blends", "Application Timing"],
    },
    {
      title: "Pest Prediction",
      description:
        "Early warning system for pest outbreaks using environmental data and predictive modeling.",
      icon: Bug,
      color: "from-rose-500 to-red-500",
      features: ["Risk Assessment", "Early Warnings", "Prevention Tips"],
    },
    {
      title: "Market Price Forecasting",
      description:
        "Advanced price forecasting models to help you plan your crop sales for maximum profit.",
      icon: TrendingUp,
      color: "from-indigo-500 to-blue-500",
      features: ["Price Predictions", "Trend Analysis", "Optimal Timing"],
    },
  ];

  const stats = [
    { number: "50K+", label: "Active Farmers", icon: Users },
    { number: "95%", label: "Accuracy Rate", icon: Star },
    { number: "200+", label: "Crop Varieties", icon: Sprout },
    { number: "24/7", label: "AI Support", icon: Zap },
  ];

  const maxSlides = Math.ceil(aiAgents.length / cardsPerView);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // Auto-advance every 5 seconds
    return () => clearInterval(interval);
  }, [maxSlides]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/agricultural-pattern.png')] opacity-5"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PRAGATI</h1>
                <p className="text-xs text-green-600 hidden sm:block">
                  AI for Agriculture
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/api/auth/signin">
                <Button
                  variant="ghost"
                  className="text-green-600 hover:text-green-700"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/api/auth/signup">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-green-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
              <div className="flex flex-col gap-3">
                <Link
                  href="/api/auth/signin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full text-green-600 hover:text-green-700"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/api/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-8 md:py-16">
          <div className="text-center max-w-5xl mx-auto mb-12 md:mb-20">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Powered by Advanced AI Technology
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Precision Retrieval & AI for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                Generative Agriculture
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Transform your farming with 8 powerful AI agents that provide
              real-time insights, predictions, and recommendations for smarter
              agricultural decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/api/auth/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/api/auth/signin">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-50 text-lg px-8 py-6 bg-white/80 backdrop-blur-sm"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <section className="mb-16 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Meet Your AI Agriculture Assistants
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Eight specialized AI agents working together to revolutionize
                your farming experience
              </p>
            </div>

            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`,
                  }}
                >
                  {Array.from({ length: maxSlides }).map((_, slideIndex) => (
                    <div key={slideIndex} className="flex-shrink-0 w-full">
                      <div
                        className={`grid gap-4 px-4 ${
                          cardsPerView === 1
                            ? "grid-cols-1"
                            : cardsPerView === 2
                              ? "grid-cols-2"
                              : cardsPerView === 3
                                ? "grid-cols-3"
                                : "grid-cols-4"
                        }`}
                      >
                        {aiAgents
                          .slice(
                            slideIndex * cardsPerView,
                            (slideIndex + 1) * cardsPerView,
                          )
                          .map((agent, index) => (
                            <Card
                              key={slideIndex * cardsPerView + index}
                              className="group backdrop-blur-sm bg-white/90 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full"
                            >
                              <CardHeader className="pb-4">
                                <div
                                  className={`w-14 h-14 bg-gradient-to-br ${agent.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                >
                                  <agent.icon className="w-7 h-7 text-white" />
                                </div>
                                <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                                  {agent.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                                  {agent.description}
                                </CardDescription>
                                <div className="space-y-2">
                                  {agent.features.map(
                                    (feature, featureIndex) => (
                                      <div
                                        key={featureIndex}
                                        className="flex items-center gap-2 text-sm text-gray-700"
                                      >
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {maxSlides > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-green-600 hover:bg-white hover:scale-110 transition-all z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-green-600 hover:bg-white hover:scale-110 transition-all z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Dot Indicators */}
              {maxSlides > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: maxSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentSlide === index
                          ? "bg-green-600 w-8"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers who are already using PRAGATI to
              increase their yields and profits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/api/auth/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-lg"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/api/auth/signin">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg px-8 py-6 bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-gray-500 border-t border-gray-200 mt-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-700">PRAGATI</span>
          </div>
          <p>
            © 2025 PRAGATI. Empowering Agriculture with AI Technology &
            Insights.
          </p>
        </footer>
      </div>
    </div>
  );
}
