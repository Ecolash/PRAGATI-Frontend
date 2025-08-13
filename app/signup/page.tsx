"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Leaf,
  User,
  Lock,
  CreditCard,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    aadharNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (
      formData.aadharNumber.length !== 12 ||
      !/^\d{12}$/.test(formData.aadharNumber)
    ) {
      newErrors.aadharNumber = "Aadhaar must be exactly 12 digits";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username,
          aadharNumber: formData.aadharNumber,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        // Store user data in localStorage for demo
        //localStorage.setItem("pragati_user", JSON.stringify(userData));
        router.push("/dashboard");
      } else {
        const errorMessage = await response.text();
        setErrors({ general: errorMessage });
      }
    } catch (error) {
      setErrors({ general: "An error occurred during signup" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/agricultural-pattern.png')] opacity-5"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join PRAGATI
          </h1>
          <p className="text-gray-600">Create your account</p>
          <p className="text-sm text-green-600 font-medium">
            Precision Retrieval & AI for Agriculture
          </p>
        </div>

        {/* Sign Up Card */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Sign Up
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Fill in your details to create an account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-green-600" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className={`h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors ${
                      errors.fullName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-green-600" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className={`h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors ${
                      errors.username ? "border-red-500" : ""
                    }`}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="aadharNumber"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 text-green-600" />
                    Aadhar Number
                  </Label>
                  <Input
                    id="aadharNumber"
                    name="aadharNumber"
                    type="text"
                    placeholder="Enter 12-digit Aadhar number"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    maxLength={12}
                    required
                    className={`h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors ${
                      errors.aadharNumber ? "border-red-500" : ""
                    }`}
                  />
                  {errors.aadharNumber && (
                    <p className="text-red-500 text-xs">
                      {errors.aadharNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-green-600" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-green-600" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className={`h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm font-medium">
                    {errors.general}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/api/auth/signin"
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 PRAGATI. Empowering Agriculture with AI.</p>
        </div>
      </div>
    </div>
  );
}
