"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  User,
  CreditCard,
  Lock,
  AtSign,
  Sparkles,
} from "lucide-react";
import { getUser } from "@/lib/actions/getUser";

export function ProfileView() {
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const res = await getUser();
      setUserData(res.user);
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-green-700">Loading profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">No user found. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-4 md:p-8">
      {/* Header with Pragati Branding */}
      <div className="max-w-7xl mx-auto mb-8 px-4 md:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              PRAGATI
            </h1>
          </div>
          <p className="text-green-700 text-lg font-medium">
            Advanced Agricultural Intelligence Platform
          </p>
        </div>

        {/* Main Profile Card */}
        <Card className="relative overflow-hidden border-2 border-green-200 shadow-2xl bg-white">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-transparent to-emerald-50" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-200/30 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-200/30 to-transparent rounded-tr-full" />

          <CardHeader className="relative z-10 text-center pb-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <User className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800 mb-2">
              {userData.fullName}
            </CardTitle>
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">
                Premium Farmer
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 space-y-6">
            {/* Username Section */}
            <div className="group">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <AtSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Username
                  </p>
                  <p className="text-lg font-semibold text-green-800">
                    {userData.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Aadhar Number Section */}
            <div className="group">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Aadhar Number
                  </p>
                  <p className="text-lg font-semibold text-green-800 font-mono tracking-wider">
                    {userData.aadharNumber}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Verified
                </Badge>
              </div>
            </div>

            {/* Password Section */}
            <div className="group">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Password
                  </p>
                  <p className="text-lg font-semibold text-green-800 font-mono">
                    {showPassword ? "••••••••••••" : "••••••••••••"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:bg-green-100 hover:text-green-700 text-green-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <a href="/dashboard">
                <Button className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg font-semibold">
                  View Dashboard
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
