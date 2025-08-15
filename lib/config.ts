// Environment configuration for API endpoints
export const config = {
  // FastAPI backend URL - adjust this based on your deployment
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",

  // Other configuration options
  enableApiHealthCheck: process.env.NODE_ENV !== "production",
  apiTimeout: 30000, // 30 seconds
} as const;
