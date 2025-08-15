# FastAPI Backend Integration

This document explains how to integrate your FastAPI multilingual agricultural agent with the Next.js frontend.

## Backend Setup

### 1. FastAPI Application Structure

Your FastAPI backend should have this structure:

```
fastapi-backend/
├── app.py (main FastAPI application)
├── Agents/
│   └── Multi_Lingual/
│       └── routers.py
└── requirements.txt
```

### 2. Required FastAPI Code

Make sure your `app.py` includes:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from Agents.Multi_Lingual.routers import router

app = FastAPI(
    title="Agricultural Agent API",
    description="API for multilingual agricultural assistance with code-switching support",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "multilingual-agriculture-api"}
```

### 3. Expected API Endpoint

Your router should provide an endpoint at `/api/v1/agriculture/respond` that:

- Accepts POST requests
- Takes a JSON payload with:
  ```json
  {
    "query": "string",
    "language": "string (optional)",
    "context": {
      "agent_type": "string (optional)",
      "previous_messages": [{ "role": "user|assistant", "content": "string" }]
    }
  }
  ```
- Returns a response with:
  ```json
  {
    "response": "string",
    "language": "string",
    "confidence": "number (optional)",
    "sources": ["string (optional)"],
    "agent_type": "string (optional)"
  }
  ```

## Frontend Integration

### 1. Environment Configuration

Set your FastAPI backend URL in `.env`:

```
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
```

### 2. API Service

The frontend uses `lib/agricultural-api.ts` to communicate with your FastAPI backend.

### 3. Health Check

The application includes a health check component that monitors your FastAPI backend status.

## Running Both Services

### Development Mode

1. **Start FastAPI Backend:**

   ```bash
   cd /path/to/your/fastapi/project
   python app.py
   ```

2. **Start Next.js Frontend:**
   ```bash
   pnpm dev
   ```

### Using the Setup Script

```bash
# Show help and instructions
./scripts/dev-setup.sh help

# Start frontend only
./scripts/dev-setup.sh frontend
```

## Features

- **Real-time Communication**: Direct integration with your multilingual agricultural AI
- **Health Monitoring**: Automatic backend status checking
- **Error Handling**: Graceful fallbacks when the backend is unavailable
- **Context Awareness**: Sends conversation history and agent context to your AI
- **Language Support**: Passes language preferences to your multilingual model

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your FastAPI app includes CORS middleware
2. **Connection Refused**: Verify your FastAPI backend is running on the correct port
3. **API Response Format**: Ensure your backend returns responses in the expected format

### Health Check

Visit your dashboard to see the API health status. The health check runs every 30 seconds.

### API Testing

You can test your FastAPI backend directly at:

- Health: `http://127.0.0.1:8000/health`
- API Docs: `http://127.0.0.1:8000/docs`
