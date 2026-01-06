# NoteFiber API Documentation

Version 1.0.0 | Last Updated: December 2025

## Overview

NoteFiber is a comprehensive note-taking platform with AI-powered features including semantic search, intelligent chatbot assistance, and subscription management. This documentation provides detailed information about all available API endpoints.

**Base URL:** `http://localhost:3000/api`

**API Version:** v1

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Management](#2-user-management)
3. [Location Services](#3-location-services)
4. [Payment & Subscription](#4-payment--subscription)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

Payment Integration Guide (Backend-Driven Flow)
Last Updated: October 2023

🚀 Overview
The payment system is now backend-driven. The frontend no longer handles redirect logic—the backend dynamically tells Midtrans where to redirect users after payment. This keeps the frontend clean and ensures consistent behavior across all projects.

📱 Frontend Integration Steps

1. Checkout Flow
   Step 1: User Clicks "Pay"
   Send a POST request to initiate checkout:

javascript
// Example: Checkout request
const response = await axios.post('/api/payment/checkout', {
plan_id: "aa11bb22-cc33-44dd-ee55-ff66gg77hh88",
first_name: "Budi",
last_name: "Santoso",
email: "budi@example.com",
phone: "08123456789",
address_line1: "Jl. Sudirman No. 1",
city: "Jakarta",
state: "DKI Jakarta",
postal_code: "10220",
country: "Indonesia"
});
Step 2: Handle Backend Response
The backend returns a snap_redirect_url:

javascript
// Simple redirect - no complex Snap.js popups needed
window.location.href = response.data.snap_redirect_url;
⚠️ Important: Use the redirect method instead of Snap.js popups unless you specifically need that UI. Redirects work reliably across all devices.

Step 3: User Completes Payment on Midtrans Page
Midtrans automatically redirects users back based on backend-configured URLs.

2. Handling Payment Redirects
   After payment, users return to your app with a payment query parameter:

Status Redirect URL Frontend Action
Success FRONTEND_URL/app?payment=success Show success message, refresh subscription status
Pending FRONTEND_URL/app?payment=pending Show processing message
Error/Cancel FRONTEND_URL/app?payment=error Show error message
Frontend Implementation Example (React):

javascript
// In your main app component (/app route)
useEffect(() => {
const query = new URLSearchParams(window.location.search);
const paymentStatus = query.get("payment");

switch (paymentStatus) {
case "success":
toast.success("Payment Successful! Your plan is active.");
// Trigger subscription status refresh
fetchUserSubscription();
break;
case "pending":
toast.info("Payment is processing...");
break;
case "error":
toast.error("Payment failed or was canceled.");
break;
}

// Clean URL after processing (optional)
if (paymentStatus) {
window.history.replaceState(null, '', window.location.pathname);
}
}, []);
🧾 Order Summary Flow
Required before checkout - Display pricing details to users.

1. Fetch Order Summary
   When a user visits the checkout page (e.g., /checkout?plan_id=...):

javascript
// Fetch order summary
const response = await axios.get('/api/payment/summary', {
params: { plan_id: "aa11bb22-cc33-44dd-ee55-ff66gg77hh88" }
});

// Response structure:
{
success: true,
code: 200,
message: "Order summary",
data: {
plan_name: "Starter Plan",
billing_period: "year",
price_per_unit: "$9/year",
subtotal: 9, // Before tax
tax: 0.99, // Calculated tax
total: 9.99, // Final amount
currency: "USD"
}
} 2. Display Summary in UI
Render the breakdown directly from the API response:

text
Order Summary:
──────────────
Plan: Starter Plan (yearly)
Price: $9/year

Subtotal: $9.00
Tax: $0.99
──────────────
Total: $9.99
📋 API Reference
POST /api/payment/checkout
Request:

json
{
"plan_id": "aa11bb22-cc33-44dd-ee55-ff66gg77hh88",
"first_name": "Budi",
"last_name": "Santoso",
"email": "budi@example.com",
"phone": "08123456789",
"address_line1": "Jl. Sudirman No. 1",
"city": "Jakarta",
"state": "DKI Jakarta",
"postal_code": "10220",
"country": "Indonesia"
}
Response (200 OK):

json
{
"success": true,
"code": 200,
"message": "Subscription created",
"data": {
"subscription_id": "sub-12345-abcde-67890",
"snap_redirect_url": "https://app.sandbox.midtrans.com/snap/v3/redirection/2df43dd8-...",
"snap_token": "2df43dd8-1891-4f63-8c13-8a24bd9c14bc"
}
}
GET /api/payment/summary
Query Parameters:

plan_id (required): UUID of the selected plan

Response (200 OK):

json
{
"success": true,
"code": 200,
"message": "Order summary",
"data": {
"plan_name": "Starter Plan",
"billing_period": "year",
"price_per_unit": "$9/year",
"subtotal": 9,
"tax": 0.99,
"total": 9.99,
"currency": "USD"
}
}
🔑 Key Takeaways for Frontend Team
No Redirect Configuration Needed
The backend dynamically injects finish_redirect_url into Midtrans requests. Ignore dashboard defaults.

Simple Redirect Pattern
Just redirect to snap_redirect_url → handle query parameters on return.

Clean Separation
Frontend is payment-gateway agnostic. All complex logic lives in the backend.

Order Summary First
Always fetch and display the order summary before initiating checkout.

Parameter Handling
Ensure your /app route gracefully handles the payment query parameter for user feedback.

🛠️ Frontend Checklist
Implement POST /api/payment/checkout call with user billing details

Redirect users to snap_redirect_url from API response

Add query parameter handling in /app route for payment=success|pending|error

Implement GET /api/payment/summary call on checkout page load

Display order summary breakdown (subtotal, tax, total)

Add loading states and error handling for API calls

Test complete flow: Summary → Checkout → Redirect → Return → Status Display

Need Help?

Backend handles all Midtrans configuration

Frontend just needs to redirect and handle return parameters

Test with sandbox credentials before going live

Monitor network requests for debugging

## This documentation ensures your frontend team can implement payment integration quickly while maintaining a clean, maintainable codebase.

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Authentication Flow

1. Register a new account
2. Verify email using OTP
3. Login to receive access token
4. Include token in subsequent requests

---

## 1. Authentication

Base path: `/auth`

### 1.1 Register User

Create a new user account. An OTP will be sent to the registered email address for verification.

**Endpoint:** `POST /auth/register`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "strongpassword123"
}
```

**Request Parameters:**

| Field     | Type   | Required | Description                         |
| --------- | ------ | -------- | ----------------------------------- |
| full_name | string | Yes      | User's full name (2-100 characters) |
| email     | string | Yes      | Valid email address                 |
| password  | string | Yes      | Password (minimum 8 characters)     |

**Success Response (200 OK):**

```json
{
  "success": true,
  "code": 200,
  "message": "User registered successfully. Check console for OTP.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

| Status Code | Description                                  |
| ----------- | -------------------------------------------- |
| 400         | Invalid request body or email already exists |
| 422         | Validation error                             |
| 500         | Internal server error                        |

**Example Request (PowerShell):**

```powershell
curl -Method POST "http://localhost:3000/api/auth/register" `
  -Headers @{ "Content-Type"="application/json" } `
  -Body '{"full_name":"John Doe","email":"john@example.com","password":"strongpassword123"}'
```

**Example Request (cURL):**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "strongpassword123"
  }'
```

---

### 1.2 Verify Email

Verify a newly registered account using the OTP sent to the user's email.

**Endpoint:** `POST /auth/verify-email`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "token": "123456"
}
```

**Request Parameters:**

| Field | Type   | Required | Description              |
| ----- | ------ | -------- | ------------------------ |
| email | string | Yes      | Registered email address |
| token | string | Yes      | 6-digit OTP code         |

**Success Response (200 OK):**

```json
{
  "success": true,
  "code": 200,
  "message": "Email verified successfully",
  "data": null
}
```

**Error Responses:**

| Status Code | Description              |
| ----------- | ------------------------ |
| 400         | Invalid or expired token |
| 404         | User not found           |
| 500         | Internal server error    |

---

### 1.3 Login

Authenticate a user and retrieve a JWT access token.

**Endpoint:** `POST /auth/login`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "strongpassword123"
}
```

**Request Parameters:**

| Field    | Type   | Required | Description              |
| -------- | ------ | -------- | ------------------------ |
| email    | string | Yes      | Registered email address |
| password | string | Yes      | User's password          |

**Success Response (200 OK):**

```json
{
  "success": true,
  "code": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "user"
    }
  }
}
```

**Error Responses:**

| Status Code | Description           |
| ----------- | --------------------- |
| 401         | Invalid credentials   |
| 403         | Email not verified    |
| 500         | Internal server error |

**Example Request (PowerShell):**

```powershell
$response = curl -Method POST "http://localhost:3000/api/auth/login" `
  -Headers @{ "Content-Type"="application/json" } `
  -Body '{"email":"john@example.com","password":"strongpassword123"}'
$token = ($response.Content | ConvertFrom-Json).data.access_token
```

---

### 1.4 Forgot Password

Initiate the password reset process. A reset token will be sent to the user's email.

**Endpoint:** `POST /auth/forgot-password`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Request Parameters:**

| Field | Type   | Required | Description              |
| ----- | ------ | -------- | ------------------------ |
| email | string | Yes      | Registered email address |

**Success Response (200 OK):**

```json
{
  "success": true,
  "code": 200,
  "message": "If email exists, reset token sent",
  "data": null
}
```

**Notes:**

- For security reasons, the API returns success even if the email doesn't exist
- Reset token is valid for 1 hour

---

### 1.5 Reset Password

Reset the user's password using the token received via email.

**Endpoint:** `POST /auth/reset-password`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "new_password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

**Request Parameters:**

| Field            | Type   | Required | Description                         |
| ---------------- | ------ | -------- | ----------------------------------- |
| token            | string | Yes      | Reset token from email              |
| new_password     | string | Yes      | New password (minimum 8 characters) |
| confirm_password | string | Yes      | Must match new_password             |

**Success Response (200 OK):**

```json
{
  "success": true,
  "code": 200,
  "message": "Password reset successful",
  "data": null
}
```

**Error Responses:**

| Status Code | Description                                        |
| ----------- | -------------------------------------------------- |
| 400         | Invalid or expired token, or passwords don't match |
| 422         | Validation error                                   |
| 500         | Internal server error                              |

---

### 1.6 OAuth Login (Google)

Initiate Google OAuth authentication flow.

**Endpoint:** `GET /auth/google`

**Response:**
Redirects to Google's OAuth consent screen.

**Flow:**

1. User clicks "Login with Google"
2. Redirected to Google consent screen
3. After approval, redirected to callback URL
4. Access token returned in callback response

---

### 1.7 OAuth Callback

Handles the OAuth callback from Google.

**Endpoint:** `GET /auth/google/callback`

**Query Parameters:**

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| code      | string | Authorization code from Google |

**Success Response:**
Returns JWT token in the same format as standard login.

**Notes:**

- This endpoint is typically handled automatically by the frontend
- State parameter is used for CSRF protection

---

## 2. User Management

Base path: `/user`

**Authentication Required:** All endpoints require Bearer token

### 2.1 Get Profile

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /user/profile`

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "code": 200,
  "message": "User profile",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user",
    "status": "active",
    "ai_daily_usage": 15,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-12-06T08:15:00Z"
  }
}
```

**Response Fields:**

| Field          | Type    | Description                                |
| -------------- | ------- | ------------------------------------------ |
| id             | string  | User UUID                                  |
| email          | string  | User's email address                       |
| full_name      | string  | User's full name                           |
| role           | string  | User role (user/admin)                     |
| status         | string  | Account status (active/inactive/suspended) |
| ai_daily_usage | integer | AI credits used today                      |
| created_at     | string  | Account creation timestamp (ISO 8601)      |
| updated_at     | string  | Last update timestamp (ISO 8601)           |

**Error Responses:**

| Status Code | Description              |
| ----------- | ------------------------ |
| 401         | Invalid or expired token |
| 404         | User not found           |
| 500         | Internal server error    |

**Example Request (PowerShell):**

```powershell
curl -Method GET "http://localhost:3000/api/user/profile" `
  -Headers @{ "Authorization"="Bearer $token" }
```

---

### 2.2 Update Profile

Update the authenticated user's profile information.

**Endpoint:** `PUT /user/profile`

**Request Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "full_name": "Johnathan Doe"
}
```

**Request Parameters:**

| Field     | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| full_name | string | No       | Updated full name (2-100 characters) |

**Success Response (200 OK):**

```json
{
  "success": true,
  "code": 200,
  "message": "Profile updated successfully",
  "data": null
}
```

**Error Responses:**

| Status Code | Description              |
| ----------- | ------------------------ |
| 400         | Invalid request body     |
| 401         | Invalid or expired token |
| 422         | Validation error         |
| 500         | Internal server error    |

**Example Request (PowerShell):**

```powershell
curl -Method PUT "http://localhost:3000/api/user/profile" `
  -Headers @{
    "Authorization"="Bearer $token"
    "Content-Type"="application/json"
  } `
  -Body '{"full_name":"Johnathan Doe"}'
```

---

### 2.3 Delete Account

Permanently delete the user's account and all associated data.

**Endpoint:** `DELETE /user/account`

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "code": 200,
  "message": "Account deleted successfully",
  "data": null
}
```

**Error Responses:**

| Status Code | Description              |
| ----------- | ------------------------ |
| 401         | Invalid or expired token |
| 500         | Internal server error    |

**Warning:**

- This action is irreversible
- All user data, notes, and subscriptions will be permanently deleted
- Active subscriptions will be cancelled

---

## 3. Location Services

Base path: `/location`

**Authentication Required:** No

### 3.1 Detect Country

Automatically detect the user's country based on their IP address or browser settings.

**Endpoint:** `GET /location/detect-country`

**Success Response (200 OK):**

```json
{
  "country": "ID",
  "country_name": "Indonesia"
}
```

**Response Fields:**

| Field        | Type   | Description                     |
| ------------ | ------ | ------------------------------- |
| country      | string | ISO 3166-1 alpha-2 country code |
| country_name | string | Full country name               |

**Notes:**

- Currently defaults to Indonesia in development environment
- Production uses IP geolocation service

**Example Request (PowerShell):**

```powershell
curl -Method GET "http://localhost:3000/api/location/detect-country"
```

---

### 3.2 Search Cities

Search for cities within a specific country.

**Endpoint:** `GET /location/cities`

**Query Parameters:**

| Parameter | Type   | Required | Description                                    |
| --------- | ------ | -------- | ---------------------------------------------- |
| country   | string | Yes      | ISO 3166-1 alpha-2 country code (e.g., ID, US) |
| query     | string | Yes      | City name search term (minimum 2 characters)   |

**Success Response (200 OK):**

```json
{
  "country": "ID",
  "cities": [
    {
      "name": "KOTA ADM. JAKARTA PUSAT",
      "state": "DKI JAKARTA",
      "country": "Indonesia"
    },
    {
      "name": "KOTA ADM. JAKARTA SELATAN",
      "state": "DKI JAKARTA",
      "country": "Indonesia"
    }
  ]
}
```

**Error Responses:**

| Status Code | Description                 |
| ----------- | --------------------------- |
| 400         | Missing required parameters |
| 404         | No cities found             |
| 500         | Internal server error       |

**Example Request (PowerShell):**

```powershell
curl -Method GET "http://localhost:3000/api/location/cities?country=ID&query=jakarta"
```

---

### 3.3 Get States/Provinces

Retrieve states or provinces for a specific city.

**Endpoint:** `GET /location/states`

**Query Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| country   | string | Yes      | ISO 3166-1 alpha-2 country code |
| city      | string | Yes      | City name                       |

**Success Response (200 OK):**

```json
{
  "city": "Jakarta",
  "states": [
    {
      "name": "DKI JAKARTA",
      "code": "31",
      "province": "DKI JAKARTA"
    }
  ]
}
```

**Response Fields:**

| Field    | Type   | Description                          |
| -------- | ------ | ------------------------------------ |
| name     | string | State/province name                  |
| code     | string | Official state/province code         |
| province | string | Province name (may differ from name) |

**Example Request (PowerShell):**

```powershell
curl -Method GET "http://localhost:3000/api/location/states?country=ID&city=Jakarta"
```

---

### 3.4 Get ZIP Codes

Retrieve postal/ZIP codes for a specific location.

**Endpoint:** `GET /location/zipcodes`

**Query Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| country   | string | Yes      | ISO 3166-1 alpha-2 country code |
| city      | string | Yes      | City name                       |
| state     | string | Yes      | State/province name             |

**Success Response (200 OK):**

```json
{
  "city": "Jakarta",
  "state": "DKI JAKARTA",
  "zipcodes": [
    {
      "code": "10110",
      "area": "Gambir",
      "country": "Indonesia"
    },
    {
      "code": "10120",
      "area": "Pasar Baru",
      "country": "Indonesia"
    }
  ]
}
```

**Response Fields:**

| Field   | Type   | Description                    |
| ------- | ------ | ------------------------------ |
| code    | string | Postal/ZIP code                |
| area    | string | Specific area or district name |
| country | string | Country name                   |

**Example Request (PowerShell):**

```powershell
curl -Method GET "http://localhost:3000/api/location/zipcodes?country=ID&city=Jakarta&state=DKI%20JAKARTA"
```

---

## 4. Payment & Subscription

Base path: `/payment`

**Authentication Required:** All endpoints except Get Plans and Webhook

### 4.1 Get Subscription Plans

Retrieve all available subscription plans.

**Endpoint:** `GET /payment/plans`

**Authentication Required:** No

**Success Response (200 OK):**

```json
{
  "success": true,
  "code": 200,
  "message": "Success fetching plans",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Free Plan",
      "slug": "free",
      "price": 0,
      "currency": "IDR",
      "billing_period": "monthly",
      "description": "Basic features for getting started",
      "features": ["Basic Note Taking", "5 AI requests per day"],
      "ai_daily_credit_limit": 5,
      "is_active": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Pro Plan",
      "slug": "pro-monthly",
      "price": 100000,
      "currency": "IDR",
      "billing_period": "monthly",
      "description": "Unlock all AI features",
      "features": [
        "Unlimited Note Taking",
        "50 AI requests per day",
        "Semantic Search",
        "AI Chat Assistant",
        "Priority Support"
      ],
      "ai_daily_credit_limit": 50,
      "is_active": true
    }
  ]
}
```

**Response Fields:**

| Field                 | Type    | Description                                   |
| --------------------- | ------- | --------------------------------------------- |
| id                    | string  | Plan UUID                                     |
| name                  | string  | Plan display name                             |
| slug                  | string  | Plan identifier (used in checkout)            |
| price                 | integer | Price in smallest currency unit (e.g., cents) |
| currency              | string  | ISO 4217 currency code                        |
| billing_period        | string  | Billing frequency (monthly/yearly)            |
| description           | string  | Plan description                              |
| features              | array   | List of plan features                         |
| ai_daily_credit_limit | integer | Daily AI request limit                        |
| is_active             | boolean | Whether plan is available for purchase        |

**Example Request (PowerShell):**

```powershell
curl -Method GET "http://localhost:3000/api/payment/plans"
```

---

### 4.2 Checkout (Create Subscription)

Create a new subscription and initiate payment process.

**Endpoint:** `POST /payment/checkout`

**Request Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "plan_id": "550e8400-e29b-41d4-a716-446655440001",
  "first_name": "Budi",
  "last_name": "Santoso",
  "email": "budi@example.com",
  "phone": "08123456789",
  "address_line1": "Jl. Sudirman No. 1",
  "address_line2": "Lantai 5",
  "city": "Jakarta",
  "state": "DKI Jakarta",
  "postal_code": "10220",
  "country": "Indonesia"
}
```

**Request Parameters:**

| Field         | Type   | Required | Description                                     |
| ------------- | ------ | -------- | ----------------------------------------------- |
| plan_id       | string | Yes      | UUID of the subscription plan                   |
| first_name    | string | Yes      | Customer's first name                           |
| last_name     | string | Yes      | Customer's last name                            |
| email         | string | Yes      | Billing email address                           |
| phone         | string | Yes      | Contact phone number                            |
| address_line1 | string | Yes      | Primary address line                            |
| address_line2 | string | No       | Secondary address line (apartment, suite, etc.) |
| city          | string | Yes      | City name                                       |
| state         | string | Yes      | State/province name                             |
| postal_code   | string | Yes      | ZIP/postal code                                 |
| country       | string | Yes      | Country name                                    |

**Success Response (200 OK):**

```json
{
  "success": true,
  "code": 200,
  "message": "Subscription created successfully",
  "data": {
    "subscription_id": "550e8400-e29b-41d4-a716-446655440002",
    "order_id": "ORDER-20241206-ABC123",
    "status": "pending",
    "snap_token": "66e4fa55-fdac-4ef9-91b5-733b97d1b862",
    "snap_redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/66e4fa55-fdac-4ef9-91b5-733b97d1b862"
  }
}
```

**Response Fields:**

| Field             | Type   | Description                                    |
| ----------------- | ------ | ---------------------------------------------- |
| subscription_id   | string | Subscription UUID                              |
| order_id          | string | Order reference number                         |
| status            | string | Subscription status (pending/active/cancelled) |
| snap_token        | string | Midtrans Snap token for payment                |
| snap_redirect_url | string | Payment page URL                               |

**Payment Flow:**

1. Create subscription via this endpoint
2. Redirect user to `snap_redirect_url`
3. User completes payment on Midtrans
4. Webhook updates subscription status
5. User redirected back to application

**Error Responses:**

| Status Code | Description                          |
| ----------- | ------------------------------------ |
| 400         | Invalid plan_id or request body      |
| 401         | Invalid or expired token             |
| 409         | User already has active subscription |
| 422         | Validation error                     |
| 500         | Internal server error                |

**Example Request (PowerShell):**

```powershell
$body = @{
    plan_id = "550e8400-e29b-41d4-a716-446655440001"
    first_name = "Budi"
    last_name = "Santoso"
    email = "budi@example.com"
    phone = "08123456789"
    address_line1 = "Jl. Sudirman No. 1"
    city = "Jakarta"
    state = "DKI Jakarta"
    postal_code = "10220"
    country = "Indonesia"
} | ConvertTo-Json

curl -Method POST "http://localhost:3000/api/payment/checkout" `
  -Headers @{
    "Authorization"="Bearer $token"
    "Content-Type"="application/json"
  } `
  -Body $body
```

---

### 4.3 Get Subscription Status

Retrieve the authenticated user's current subscription status.

**Endpoint:** `GET /payment/status`

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "code": 200,
  "message": "Subscription status",
  "data": {
    "subscription_id": "550e8400-e29b-41d4-a716-446655440002",
    "plan_name": "Pro Plan",
    "plan_slug": "pro-monthly",
    "status": "active",
    "current_period_start": "2024-12-01T00:00:00Z",
    "current_period_end": "2024-12-31T23:59:59Z",
    "ai_daily_credit_limit": 50,
    "ai_daily_usage": 15,
    "is_active": true,
    "auto_renew": true
  }
}
```

**Response Fields:**

| Field                 | Type    | Description                                    |
| --------------------- | ------- | ---------------------------------------------- |
| subscription_id       | string  | Subscription UUID                              |
| plan_name             | string  | Current plan name                              |
| plan_slug             | string  | Plan identifier                                |
| status                | string  | Subscription status (active/cancelled/expired) |
| current_period_start  | string  | Billing period start date (ISO 8601)           |
| current_period_end    | string  | Billing period end date (ISO 8601)             |
| ai_daily_credit_limit | integer | Daily AI request limit                         |
| ai_daily_usage        | integer | AI requests used today                         |
| is_active             | boolean | Whether subscription is currently active       |
| auto_renew            | boolean | Whether subscription will auto-renew           |

**Error Responses:**

| Status Code | Description                  |
| ----------- | ---------------------------- |
| 401         | Invalid or expired token     |
| 404         | No active subscription found |
| 500         | Internal server error        |

**Example Request (PowerShell):**

```powershell
curl -Method GET "http://localhost:3000/api/payment/status" `
  -Headers @{ "Authorization"="Bearer $token" }
```

---

### 4.4 Cancel Subscription

Cancel the user's current active subscription.

**Endpoint:** `POST /payment/cancel`

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "code": 200,
  "message": "Subscription cancelled successfully",
  "data": {
    "subscription_id": "550e8400-e29b-41d4-a716-446655440002",
    "status": "cancelled",
    "cancelled_at": "2024-12-06T10:30:00Z",
    "access_until": "2024-12-31T23:59:59Z"
  }
}
```

**Response Fields:**

| Field           | Type   | Description                          |
| --------------- | ------ | ------------------------------------ |
| subscription_id | string | Subscription UUID                    |
| status          | string | Updated status (cancelled)           |
| cancelled_at    | string | Cancellation timestamp (ISO 8601)    |
| access_until    | string | End of paid access period (ISO 8601) |

**Notes:**

- Cancellation is immediate but access continues until end of billing period
- No refunds for partial periods
- User will revert to free plan after access period ends

**Error Responses:**

| Status Code | Description                    |
| ----------- | ------------------------------ |
| 401         | Invalid or expired token       |
| 404         | No active subscription found   |
| 409         | Subscription already cancelled |
| 500         | Internal server error          |

**Example Request (PowerShell):**

```powershell
curl -Method POST "http://localhost:3000/api/payment/cancel" `
  -Headers @{ "Authorization"="Bearer $token" }
```

---

### 4.5 Payment Webhook

Webhook endpoint for receiving payment notifications from Midtrans.

**Endpoint:** `POST /payment/webhook`

**Authentication Required:** No (Validated via signature)

**Notes:**

- This endpoint is called automatically by Midtrans
- Do not call this endpoint manually
- Used to update subscription status after payment completion

---

## Error Handling

All API endpoints follow a consistent error response format:

### Error Response Structure

```json
{
  "success": false,
  "code": 400,
  "message": "Detailed error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes

| Status Code | Meaning               | Description                             |
| ----------- | --------------------- | --------------------------------------- |
| 200         | OK                    | Request succeeded                       |
| 201         | Created               | Resource created successfully           |
| 400         | Bad Request           | Invalid request format or parameters    |
| 401         | Unauthorized          | Missing or invalid authentication token |
| 403         | Forbidden             | Authenticated but not authorized        |
| 404         | Not Found             | Resource not found                      |
| 409         | Conflict              | Resource already exists or conflict     |
| 422         | Unprocessable Entity  | Validation failed                       |
| 429         | Too Many Requests     | Rate limit exceeded                     |
| 500         | Internal Server Error | Server-side error                       |
| 503         | Service Unavailable   | Service temporarily unavailable         |

### Common Error Messages

**Authentication Errors:**

- `"Invalid or expired token"` - Token is invalid or has expired
- `"Email not verified"` - User must verify email before login
- `"Invalid credentials"` - Wrong email or password

**Validation Errors:**

- `"Invalid email format"` - Email address is malformed
- `"Password too short"` - Password doesn't meet minimum length
- `"Required field missing"` - Required parameter not provided

**Business Logic Errors:**

- `"User already exists"` - Email already registered
- `"No active subscription"` - User doesn't have active subscription
- `"Daily limit exceeded"` - AI request limit reached

---

## Rate Limiting

API endpoints are rate-limited to ensure fair usage and system stability.

### Rate Limit Headers

Every API response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

| Header                | Description                              |
| --------------------- | ---------------------------------------- |
| X-RateLimit-Limit     | Maximum requests allowed per time window |
| X-RateLimit-Remaining | Requests remaining in current window     |
| X-RateLimit-Reset     | Unix timestamp when limit resets         |

### Rate Limit Tiers

**Unauthenticated Requests:**

- 20 requests per minute per IP
- Applies to: Registration, Login, Forgot Password

**Authenticated Users (Free Plan):**

- 60 requests per minute
- 1,000 requests per day

**Authenticated Users (Pro Plan):**

- 120 requests per minute
- 10,000 requests per day

**AI-Specific Limits:**

- Governed by subscription plan's `ai_daily_credit_limit`
- Separate from general API rate limits

### Rate Limit Exceeded Response

When rate limit is exceeded:

```json
{
  "success": false,
  "code": 429,
  "message": "Rate limit exceeded. Please try again later.",
  "data": {
    "retry_after": 60
  }
}
```

---

## Best Practices

### Security

1. **Never expose tokens in URLs** - Always use Authorization header
2. **Store tokens securely** - Use secure storage mechanisms (HttpOnly cookies, encrypted storage)
3. **Implement token refresh** - Request new tokens before expiration
4. **Use HTTPS in production** - Never send credentials over unencrypted connections

### Performance

1. **Implement caching** - Cache responses when appropriate (plans, location data)
2. **Use pagination** - Request only needed data with proper limits
3. **Handle rate limits** - Implement exponential backoff when rate limited
4. **Minimize requests** - Batch operations when possible

### Error Handling

1. **Always check response status** - Don't assume success
2. **Handle all error codes** - Implement proper error handling for each status code
3. **Provide user feedback** - Show meaningful error messages to users
4. **Log errors** - Log errors for debugging and monitoring

### Testing

1. **Use sandbox environment** - Test with sandbox credentials
2. **Test error scenarios** - Verify error handling works correctly
   3
