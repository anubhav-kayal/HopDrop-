# Quick Fix: 401 Unauthorized Error

## Problem
You're getting `401 Unauthorized` error when uploading files because the API key is missing.

## Solution: Add API Key Header in Postman

### Method 1: Using Headers Tab (Recommended)

1. **Open your Postman request**
2. **Click on the "Headers" tab** (next to Body tab)
3. **Add a new header:**
   - **Key**: `X-API-Key`
   - **Value**: `admin`
   - Click **Save**

4. **Go back to Body tab** and upload your file
5. **Click Send**

### Method 2: Using Auth Tab

1. **Click on the "Auth" tab** in Postman
2. **Select "API Key"** from the Type dropdown
3. **Configure:**
   - **Key**: `X-API-Key`
   - **Value**: `admin`
   - **Add to**: Header
4. **Go to Body tab** and upload your file
5. **Click Send**

### Method 3: Using Query Parameter (Alternative)

Add `?api_key=admin` to your URL:
```
http://localhost:5001/api/files/upload?api_key=admin
```

## Available API Keys

| Key | Role | Permissions |
|-----|------|------------|
| `admin` | Admin | Full access (read, write, delete, analytics) |
| `operator` | Operator | Read and write access |
| `analyst` | Analyst | Read and analytics access |

## For File Upload

Use **`admin`** or **`operator`** (both have write permission).

## Visual Guide

```
Postman Request:
├── Headers Tab
│   └── X-API-Key: admin  ← ADD THIS!
├── Body Tab
│   └── form-data
│       ├── file: [your-file.csv]
│       └── channel: warehouse (optional)
└── Send Button
```

## After Adding API Key

You should see:
- ✅ Status: `200 OK` (instead of 401)
- ✅ Response with processing results

## Still Getting Errors?

1. **Check the header name**: Must be exactly `X-API-Key` (case-sensitive)
2. **Check the value**: Must be exactly `admin`, `operator`, or `analyst` (lowercase)
3. **Check server is running**: `npm start` in server folder
4. **Check port**: Server should be on port 5001
