# Usage Limits API Documentation
> **For Frontend Team** - Complete reference for the dynamic usage limits system
---
## Table of Contents
1. [Overview](#overview)
2. [Database Changes](#database-changes)
3. [New Endpoints](#new-endpoints)
4. [Changed Endpoints](#changed-endpoints)
5. [Limit Checking Flow](#limit-checking-flow)
6. [Error Handling](#error-handling)
7. [Request/Response Examples](#requestresponse-examples)
8. [Seed Data SQL](#seed-data-sql)
---
## Overview
The system now enforces usage limits based on subscription plans:
| Resource | Free Plan | Pro Plan |
|----------|-----------|----------|
| Max Notebooks (Folders) | 3 | 20 |
| Max Notes per Notebook | 10 | 50 |
| AI Chat / Day | Disabled | 50 |
| Semantic Search / Day | Disabled | 30 |
### Key Concepts
- **Storage Limits** (notebooks, notes): Cumulative, don't reset
- **Daily Limits** (AI chat, search): Reset at midnight
- **-1 = Unlimited**, **0 = Disabled**
---
## Database Changes
### New Table: `plan_features`
Stores admin-configurable feature text for pricing modal.
```sql
CREATE TABLE plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL, -- e.g., 'basic_notes', 'ai_chat'
    display_text TEXT NOT NULL, -- e.g., 'AI Chat Assistant'
    is_enabled BOOLEAN DEFAULT true, -- Show checkmark or X
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```
### Updated Table: `subscription_plans`
New columns added:
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `tagline` | TEXT | null | Modal subtitle |
| `max_notebooks` | INT | 3 | Max folders allowed |
| `max_notes_per_notebook` | INT | 10 | Max notes per folder |
| `ai_chat_daily_limit` | INT | 0 | Daily AI chat limit |
| `semantic_search_daily_limit` | INT | 0 | Daily search limit |
| `is_most_popular` | BOOL | false | Show badge |
| `is_active` | BOOL | true | Show in modal |
| `sort_order` | INT | 0 | Display order |
### Renamed Columns
| Old Column | New Column |
|------------|------------|
| `ai_daily_credit_limit` | `ai_chat_daily_limit` |
| `max_notes` | (Removed - replaced by `max_notebooks` + `max_notes_per_notebook`) |
---
## Seed Data SQL
Run this SQL to set up initial plans with features:
```sql
-- 1. Update existing plans with new fields
UPDATE subscription_plans SET
    tagline = 'Get started with basic note-taking',
    max_notebooks = 3,
    max_notes_per_notebook = 10,
    ai_chat_daily_limit = 0,
    semantic_search_daily_limit = 0,
    is_active = true,
    sort_order = 0
WHERE slug = 'free' OR price = 0;
UPDATE subscription_plans SET
    tagline = 'Unlock AI Chat and Semantic Search',
    max_notebooks = 20,
    max_notes_per_notebook = 50,
    ai_chat_daily_limit = 50,
    semantic_search_daily_limit = 30,
    is_most_popular = true,
    is_active = true,
    sort_order = 1
WHERE slug = 'pro' OR name ILIKE '%pro%';
-- 2. Insert features for Free plan
INSERT INTO plan_features (plan_id, feature_key, display_text, is_enabled, sort_order)
SELECT id, 'basic_notes', 'Basic Note Taking', true, 1 FROM subscription_plans WHERE slug = 'free' OR price = 0
ON CONFLICT DO NOTHING;
INSERT INTO plan_features (plan_id, feature_key, display_text, is_enabled, sort_order)
SELECT id, 'semantic_search', 'Semantic Search', false, 2 FROM subscription_plans WHERE slug = 'free' OR price = 0
ON CONFLICT DO NOTHING;
INSERT INTO plan_features (plan_id, feature_key, display_text, is_enabled, sort_order)
SELECT id, 'ai_chat', 'AI Chat Assistant', false, 3 FROM subscription_plans WHERE slug = 'free' OR price = 0
ON CONFLICT DO NOTHING;
-- 3. Insert features for Pro plan
INSERT INTO plan_features (plan_id, feature_key, display_text, is_enabled, sort_order)
SELECT id, 'basic_notes', 'Basic Note Taking', true, 1 FROM subscription_plans WHERE slug = 'pro' OR name ILIKE '%pro%'
ON CONFLICT DO NOTHING;
INSERT INTO plan_features (plan_id, feature_key, display_text, is_enabled, sort_order)
SELECT id, 'semantic_search', 'Semantic Search', true, 2 FROM subscription_plans WHERE slug = 'pro' OR name ILIKE '%pro%'
ON CONFLICT DO NOTHING;
INSERT INTO plan_features (plan_id, feature_key, display_text, is_enabled, sort_order)
SELECT id, 'ai_chat', 'AI Chat Assistant', true, 3 FROM subscription_plans WHERE slug = 'pro' OR name ILIKE '%pro%'
ON CONFLICT DO NOTHING;
```
---
## New Endpoints
### 1. Get All Plans (Public)
Fetch all active subscription plans for the pricing modal.
```http
GET /api/plans
```
**Authentication:** None required
**Response:**
```json
{
  "success": true,
  "code": 200,
  "message": "Plans retrieved",
  "data": [
    {
      "id": "uuid",
      "name": "Free",
      "slug": "free",
      "tagline": "Get started with basic note-taking",
      "price": 0,
      "billing_period": "monthly",
      "is_most_popular": false,
      "limits": {
        "max_notebooks": 3,
        "max_notes_per_notebook": 10,
        "ai_chat_daily": 0,
        "semantic_search_daily": 0
      },
      "features": [
        { "key": "basic_notes", "text": "Basic Note Taking", "is_enabled": true },
        { "key": "semantic_search", "text": "Semantic Search", "is_enabled": false },
        { "key": "ai_chat", "text": "AI Chat Assistant", "is_enabled": false }
      ]
    },
    {
      "id": "uuid",
      "name": "Pro Plan",
      "slug": "pro",
      "tagline": "Unlock AI Chat and Semantic Search",
      "price": 500.00,
      "billing_period": "yearly",
      "is_most_popular": true,
      "limits": {
        "max_notebooks": 20,
        "max_notes_per_notebook": 50,
        "ai_chat_daily": 50,
        "semantic_search_daily": 30
      },
      "features": [
        { "key": "basic_notes", "text": "Basic Note Taking", "is_enabled": true },
        { "key": "semantic_search", "text": "Semantic Search", "is_enabled": true },
        { "key": "ai_chat", "text": "AI Chat Assistant", "is_enabled": true }
      ]
    }
  ]
}
```
---
### 2. Get User Usage Status (Authenticated)
Check current usage vs limits before performing actions.
```http
GET /api/user/usage-status
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "code": 200,
  "message": "Usage status retrieved",
  "data": {
    "plan": {
      "id": "uuid",
      "name": "Pro Plan",
      "slug": "pro"
    },
    "storage": {
      "notebooks": {
        "used": 5,
        "limit": 20,
        "can_use": true
      },
      "notes": {
        "used": 0,
        "limit": 50,
        "can_use": true
      }
    },
    "daily": {
      "ai_chat": {
        "used": 12,
        "limit": 50,
        "can_use": true,
        "resets_at": "2025-12-22T00:00:00Z"
      },
      "semantic_search": {
        "used": 5,
        "limit": 30,
        "can_use": true,
        "resets_at": "2025-12-22T00:00:00Z"
      }
    },
    "upgrade_available": false
  }
}
```
---
## Changed Endpoints
### 1. GET /api/user/subscription/status
**Changed Fields:**
| Old Field | New Field |
|-----------|-----------|
| `ai_daily_credit_limit` | `ai_chat_daily_limit` |
| - | `semantic_search_daily_limit` (NEW) |
| `features.max_notes` | `features.max_notebooks` |
| - | `features.max_notes_per_notebook` (NEW) |
**New Response:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "uuid",
    "plan_name": "Pro Plan",
    "status": "active",
    "current_period_end": "2026-12-21T00:00:00Z",
    "ai_chat_daily_limit": 50,
    "semantic_search_daily_limit": 30,
    "is_active": true,
    "features": {
      "ai_chat": true,
      "semantic_search": true,
      "max_notebooks": 20,
      "max_notes_per_notebook": 50
    }
  }
}
```
---
### 2. Admin Plan Management
**Changed Request/Response:**
#### Create Plan: `POST /api/admin/plans`
```json
{
  "name": "Pro Plan",
  "slug": "pro",
  "price": 500.00,
  "tax_rate": 0.11,
  "billing_period": "yearly",
  "features": {
    "max_notebooks": 20,
    "max_notes_per_notebook": 50,
    "semantic_search": true,
    "ai_chat": true,
    "ai_chat_daily_limit": 50,
    "semantic_search_daily_limit": 30
  }
}
```
---
### 3. Admin Plan Feature CRUD (NEW)
Manage the features displayed in the pricing modal for each plan.
#### Get Plan Features
```http
GET /api/admin/plans/:id/features
Authorization: Bearer <admin_token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "plan_id": "uuid",
      "feature_key": "basic_notes",
      "display_text": "Basic Note Taking",
      "is_enabled": true,
      "sort_order": 1
    },
    {
      "id": "uuid",
      "plan_id": "uuid",
      "feature_key": "ai_chat",
      "display_text": "AI Chat Assistant",
      "is_enabled": true,
      "sort_order": 2
    }
  ]
}
```
#### Create Plan Feature
```http
POST /api/admin/plans/:id/features
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "feature_key": "custom_feature",
  "display_text": "Custom Feature Name",
  "is_enabled": true,
  "sort_order": 4
}
```
**Response:**
```json
{
  "success": true,
  "message": "Feature created",
  "data": {
    "id": "uuid",
    "plan_id": "uuid",
    "feature_key": "custom_feature",
    "display_text": "Custom Feature Name",
    "is_enabled": true,
    "sort_order": 4
  }
}
```
#### Update Plan Feature
```http
PUT /api/admin/plans/features/:featureId
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "display_text": "Updated Feature Name",
  "is_enabled": false,
  "sort_order": 5
}
```
#### Delete Plan Feature
```http
DELETE /api/admin/plans/features/:featureId
Authorization: Bearer <admin_token>
```
---
## Limit Checking Flow
### Frontend Pre-Check Pattern
Before any limited action, call the usage-status endpoint:
```typescript
// Before creating a notebook
async function canCreateNotebook(): Promise<boolean> {
  const response = await fetch('/api/user/usage-status', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await response.json();
  return data.storage.notebooks.can_use;
}
// Usage
if (await canCreateNotebook()) {
  await createNotebook();
} else {
  showPricingModal();
}
```
### When to Check Limits
| Action | Check Field |
|--------|-------------|
| Create Folder/Notebook | `storage.notebooks.can_use` |
| Create Note | `storage.notes.can_use` |
| Send AI Chat Message | `daily.ai_chat.can_use` |
| Perform Semantic Search | `daily.semantic_search.can_use` |
---
## Error Handling
### Limit Exceeded Response (HTTP 429)
When a limit is exceeded, the backend returns:
```json
{
  "success": false,
  "code": 429,
  "message": "Daily AI chat limit reached",
  "data": {
    "limit": 50,
    "used": 50,
    "reset_after": "2025-12-22T00:00:00Z",
    "show_modal_pricing": true
  }
}
```
### Frontend Error Handler
```typescript
async function handleApiResponse(response: Response) {
  const data = await response.json();
  if (response.status === 429) {
    // Limit exceeded
    if (data.data?.show_modal_pricing) {
      showPricingModal();
    } else {
      showLimitWarning({
        used: data.data.used,
        limit: data.data.limit,
        resetsAt: data.data.reset_after
      });
    }
    return null;
  }
  if (response.status === 403) {
    // Feature requires upgrade
    showPricingModal();
    return null;
  }
  return data;
}
```
---
## Request/Response Examples
### Complete Flow Example
#### Step 1: User Opens App → Check Usage Status
```http
GET /api/user/usage-status
Authorization: Bearer eyJhbG...
```
```json
{
  "success": true,
  "data": {
    "plan": { "name": "Free", "slug": "free" },
    "storage": {
      "notebooks": { "used": 3, "limit": 3, "can_use": false }
    },
    "daily": {
      "ai_chat": { "used": 0, "limit": 0, "can_use": false }
    },
    "upgrade_available": true
  }
}
```
#### Step 2: User Tries to Create Notebook → Blocked
UI reads `storage.notebooks.can_use = false` → Show upgrade modal
#### Step 3: User Clicks Upgrade → Fetch Plans
```http
GET /api/plans
```
```json
{
  "success": true,
  "data": [
    {
      "name": "Pro Plan",
      "slug": "pro",
      "tagline": "Unlock AI Chat and Semantic Search",
      "price": 500.00,
      "is_most_popular": true,
      "features": [
        { "text": "Basic Note Taking", "is_enabled": true },
        { "text": "Semantic Search", "is_enabled": true },
        { "text": "AI Chat Assistant", "is_enabled": true }
      ]
    }
  ]
}
```
---
## Summary of API Changes
### New Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/plans` | | Get all plans for pricing modal |
| GET | `/api/user/usage-status` | User | Get current usage vs limits |
| GET | `/api/admin/plans/:id/features` | Admin | Get plan features |
| POST | `/api/admin/plans/:id/features` | Admin | Create plan feature |
| PUT | `/api/admin/plans/features/:featureId` | Admin | Update plan feature |
| DELETE | `/api/admin/plans/features/:featureId` | Admin | Delete plan feature |
### Changed DTOs
| DTO | Changes |
|-----|---------|
| [SubscriptionStatusResponse](file:///d:/notetaker/notefiber-BE/internal/dto/user_dto.go#34-43) | Added `semantic_search_daily_limit`, changed field names |
| [SubscriptionFeatures](file:///d:/notetaker/notefiber-BE/internal/dto/user_dto.go#27-33) | Changed `max_notes` → `max_notebooks` + `max_notes_per_notebook` |
| [PlanFeaturesDTO](file:///d:/notetaker/notefiber-BE/internal/dto/admin_dto.go#96-104) (Admin) | Same changes as above |
| **429 Error Response** | Now returns structured [LimitExceededError](file:///d:/notetaker/notefiber-BE/internal/dto/chatbot_dto.go#53-58) |
### Field Name Changes
| Old | New |
|-----|-----|
| `ai_daily_credit_limit` | `ai_chat_daily_limit` |
| `max_notes` | `max_notebooks` |
| - | `max_notes_per_notebook` |
| - | `semantic_search_daily_limit` |
---
## Notes for Frontend Team
1. **Always pre-check limits** before allowing create/chat/search actions
2. **Cache usage status** locally and refresh periodically (every 30s or on action)
3. **Handle 429 gracefully** by showing the pricing modal
4. **Feature text is dynamic** - use the `features` array from `/api/plans`, not hardcoded text
5. **Daily limits reset at midnight** - show countdown using `resets_at` field
# Usage Limits API Documentation
> **For Frontend Team** - Complete reference for the dynamic usage limits system
---
## Table of Contents
1. [Overview](#overview)
2. [Database Changes](#database-changes)
3. [New Endpoints](#new-endpoints)
4. [Changed Endpoints](#changed-endpoints)
5. [Limit Checking Flow](#limit-checking-flow)
6. [Error Handling](#error-handling)
7. [Request/Response Examples](#requestresponse-examples)
8. [Seed Data SQL](#seed-data-sql)
---
## Overview
The system now enforces usage limits based on subscription plans:
| Resource | Free Plan | Pro Plan |
|----------|-----------|----------|
| Max Notebooks (Folders) | 3 | 20 |
| Max Notes per Notebook | 10 | 50 |
| AI Chat / Day | Disabled | 50 |
| Semantic Search / Day | Disabled | 30 |
### Key Concepts
- **Storage Limits** (notebooks, notes): Cumulative, don't reset
- **Daily Limits** (AI chat, search): Reset at midnight
- **-1 = Unlimited**, **0 = Disabled**
---
## Database Changes
### New Table: `plan_features`
Stores admin-configurable feature text for pricing modal.
```sql
CREATE TABLE plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL, -- e.g., 'basic_notes', 'ai_chat'
    display_text TEXT NOT NULL, -- e.g., 'AI Chat Assistant'
    is_enabled BOOLEAN DEFAULT true, -- Show checkmark or X
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```
### Updated Table: `subscription_plans`
New columns added:
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `tagline` | TEXT | null | Modal subtitle |
| `max_notebooks` | INT | 3 | Max folders allowed |
| `max_notes_per_notebook` | INT | 10 | Max notes per folder |
| `ai_chat_daily_limit` | INT | 0 | Daily AI chat limit |
| `semantic_search_daily_limit` | INT | 0 | Daily search limit |
| `is_most_popular` | BOOL | false | Show badge |
| `is_active` | BOOL | true | Show in modal |
| `sort_order` | INT | 0 | Display order |
### Renamed Columns
| Old Column | New Column |
|------------|------------|
| `ai_daily_credit_limit` | `ai_chat_daily_limit` |
| `max_notes` | (Removed - replaced by `max_notebooks` + `max_notes_per_notebook`) |
---
## Seed Data SQL
Run this SQL to set up initial plans with features:
```sql
-- 1. Update existing plans with new fields
UPDATE subscription_plans SET
    tagline = 'Get started with basic note-taking',
    max_notebooks = 3,
    max_notes_per_notebook = 10,
    ai_chat_daily_limit = 0,
    semantic_search_daily_limit = 0,
    is_active = true,
    sort_order = 0
WHERE slug = 'free' OR price = 0;
UPDATE subscription_plans SET
    tagline = 'Unlock AI Chat and Semantic Search',
    max_notebooks = 20,
    max_notes_per_notebook = 50,
    ai_chat_daily_limit = 50,
    semantic_search_daily_limit = 30,
    is_most_popular = true,
    is_active = true,
    sort_order = 1
WHERE slug = 'pro' OR name ILIKE '%pro%';
-- 2. Insert features for Free plan
INSERT INTO plan_features (plan_id, feature_key, display_text, is_enabled, sort_order)
SELECT id, 'basic_notes', 'Basic Note Taking', true, 1 FROM subscription_plans WHERE slug = 'free' OR price = 0
ON CONFLICT DO NOTHING;
INSERT INTO plan_features (plan_id, feature_key, display_text, is_enabled, sort_order)
SELECT id, 'semantic_search', 'Semantic Search', false, 2 FROM subscription_plans WHERE slug = 'free' OR price = 0
ON CONFLICT DO NOTHING;
INSERT INTO plan_features (plan_id, feature_key, display_text, is_enabled, sort_order)
SELECT id, 'ai_chat', 'AI Chat Assistant', false, 3 FROM subscription_plans WHERE slug = 'free' OR price = 0
ON CONFLICT DO NOTHING;
-- 3. Insert features for Pro plan
INSERT INTO plan_features (plan_id, feature_key, display_text, is_enabled, sort_order)
SELECT id, 'basic_notes', 'Basic Note Taking', true, 1 FROM subscription_plans WHERE slug = 'pro' OR name ILIKE '%pro%'
ON CONFLICT DO NOTHING;
INSERT INTO plan_features (plan_id, feature_key, display_text, is_enabled, sort_order)
SELECT id, 'semantic_search', 'Semantic Search', true, 2 FROM subscription_plans WHERE slug = 'pro' OR name ILIKE '%pro%'
ON CONFLICT DO NOTHING;
INSERT INTO plan_features (plan_id, feature_key, display_text, is_enabled, sort_order)
SELECT id, 'ai_chat', 'AI Chat Assistant', true, 3 FROM subscription_plans WHERE slug = 'pro' OR name ILIKE '%pro%'
ON CONFLICT DO NOTHING;
```
---
## New Endpoints
### 1. Get All Plans (Public)
Fetch all active subscription plans for the pricing modal.
```http
GET /api/plans
```
**Authentication:** None required
**Response:**
```json
{
  "success": true,
  "code": 200,
  "message": "Plans retrieved",
  "data": [
    {
      "id": "uuid",
      "name": "Free",
      "slug": "free",
      "tagline": "Get started with basic note-taking",
      "price": 0,
      "billing_period": "monthly",
      "is_most_popular": false,
      "limits": {
        "max_notebooks": 3,
        "max_notes_per_notebook": 10,
        "ai_chat_daily": 0,
        "semantic_search_daily": 0
      },
      "features": [
        { "key": "basic_notes", "text": "Basic Note Taking", "is_enabled": true },
        { "key": "semantic_search", "text": "Semantic Search", "is_enabled": false },
        { "key": "ai_chat", "text": "AI Chat Assistant", "is_enabled": false }
      ]
    },
    {
      "id": "uuid",
      "name": "Pro Plan",
      "slug": "pro",
      "tagline": "Unlock AI Chat and Semantic Search",
      "price": 500.00,
      "billing_period": "yearly",
      "is_most_popular": true,
      "limits": {
        "max_notebooks": 20,
        "max_notes_per_notebook": 50,
        "ai_chat_daily": 50,
        "semantic_search_daily": 30
      },
      "features": [
        { "key": "basic_notes", "text": "Basic Note Taking", "is_enabled": true },
        { "key": "semantic_search", "text": "Semantic Search", "is_enabled": true },
        { "key": "ai_chat", "text": "AI Chat Assistant", "is_enabled": true }
      ]
    }
  ]
}
```
---
### 2. Get User Usage Status (Authenticated)
Check current usage vs limits before performing actions.
```http
GET /api/user/usage-status
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "code": 200,
  "message": "Usage status retrieved",
  "data": {
    "plan": {
      "id": "uuid",
      "name": "Pro Plan",
      "slug": "pro"
    },
    "storage": {
      "notebooks": {
        "used": 5,
        "limit": 20,
        "can_use": true
      },
      "notes": {
        "used": 0,
        "limit": 50,
        "can_use": true
      }
    },
    "daily": {
      "ai_chat": {
        "used": 12,
        "limit": 50,
        "can_use": true,
        "resets_at": "2025-12-22T00:00:00Z"
      },
      "semantic_search": {
        "used": 5,
        "limit": 30,
        "can_use": true,
        "resets_at": "2025-12-22T00:00:00Z"
      }
    },
    "upgrade_available": false
  }
}
```
---
## Changed Endpoints
### 1. GET /api/user/subscription/status
**Changed Fields:**
| Old Field | New Field |
|-----------|-----------|
| `ai_daily_credit_limit` | `ai_chat_daily_limit` |
| - | `semantic_search_daily_limit` (NEW) |
| `features.max_notes` | `features.max_notebooks` |
| - | `features.max_notes_per_notebook` (NEW) |
**New Response:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "uuid",
    "plan_name": "Pro Plan",
    "status": "active",
    "current_period_end": "2026-12-21T00:00:00Z",
    "ai_chat_daily_limit": 50,
    "semantic_search_daily_limit": 30,
    "is_active": true,
    "features": {
      "ai_chat": true,
      "semantic_search": true,
      "max_notebooks": 20,
      "max_notes_per_notebook": 50
    }
  }
}
```
---
### 2. Admin Plan Management
**Changed Request/Response:**
#### Create Plan: `POST /api/admin/plans`
```json
{
  "name": "Pro Plan",
  "slug": "pro",
  "price": 500.00,
  "tax_rate": 0.11,
  "billing_period": "yearly",
  "features": {
    "max_notebooks": 20,
    "max_notes_per_notebook": 50,
    "semantic_search": true,
    "ai_chat": true,
    "ai_chat_daily_limit": 50,
    "semantic_search_daily_limit": 30
  }
}
```
---
### 3. Admin Plan Feature CRUD (NEW)
Manage the features displayed in the pricing modal for each plan.
#### Get Plan Features
```http
GET /api/admin/plans/:id/features
Authorization: Bearer <admin_token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "plan_id": "uuid",
      "feature_key": "basic_notes",
      "display_text": "Basic Note Taking",
      "is_enabled": true,
      "sort_order": 1
    },
    {
      "id": "uuid",
      "plan_id": "uuid",
      "feature_key": "ai_chat",
      "display_text": "AI Chat Assistant",
      "is_enabled": true,
      "sort_order": 2
    }
  ]
}
```
#### Create Plan Feature
```http
POST /api/admin/plans/:id/features
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "feature_key": "custom_feature",
  "display_text": "Custom Feature Name",
  "is_enabled": true,
  "sort_order": 4
}
```
**Response:**
```json
{
  "success": true,
  "message": "Feature created",
  "data": {
    "id": "uuid",
    "plan_id": "uuid",
    "feature_key": "custom_feature",
    "display_text": "Custom Feature Name",
    "is_enabled": true,
    "sort_order": 4
  }
}
```
#### Update Plan Feature
```http
PUT /api/admin/plans/features/:featureId
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "display_text": "Updated Feature Name",
  "is_enabled": false,
  "sort_order": 5
}
```
#### Delete Plan Feature
```http
DELETE /api/admin/plans/features/:featureId
Authorization: Bearer <admin_token>
```
---
## Limit Checking Flow
### Frontend Pre-Check Pattern
Before any limited action, call the usage-status endpoint:
```typescript
// Before creating a notebook
async function canCreateNotebook(): Promise<boolean> {
  const response = await fetch('/api/user/usage-status', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await response.json();
  return data.storage.notebooks.can_use;
}
// Usage
if (await canCreateNotebook()) {
  await createNotebook();
} else {
  showPricingModal();
}
```
### When to Check Limits
| Action | Check Field |
|--------|-------------|
| Create Folder/Notebook | `storage.notebooks.can_use` |
| Create Note | `storage.notes.can_use` |
| Send AI Chat Message | `daily.ai_chat.can_use` |
| Perform Semantic Search | `daily.semantic_search.can_use` |
---
## Error Handling
### Limit Exceeded Response (HTTP 429)
When a limit is exceeded, the backend returns:
```json
{
  "success": false,
  "code": 429,
  "message": "Daily AI chat limit reached",
  "data": {
    "limit": 50,
    "used": 50,
    "reset_after": "2025-12-22T00:00:00Z",
    "show_modal_pricing": true
  }
}
```
### Frontend Error Handler
```typescript
async function handleApiResponse(response: Response) {
  const data = await response.json();
  if (response.status === 429) {
    // Limit exceeded
    if (data.data?.show_modal_pricing) {
      showPricingModal();
    } else {
      showLimitWarning({
        used: data.data.used,
        limit: data.data.limit,
        resetsAt: data.data.reset_after
      });
    }
    return null;
  }
  if (response.status === 403) {
    // Feature requires upgrade
    showPricingModal();
    return null;
  }
  return data;
}
```
---
## Request/Response Examples
### Complete Flow Example
#### Step 1: User Opens App → Check Usage Status
```http
GET /api/user/usage-status
Authorization: Bearer eyJhbG...
```
```json
{
  "success": true,
  "data": {
    "plan": { "name": "Free", "slug": "free" },
    "storage": {
      "notebooks": { "used": 3, "limit": 3, "can_use": false }
    },
    "daily": {
      "ai_chat": { "used": 0, "limit": 0, "can_use": false }
    },
    "upgrade_available": true
  }
}
```
#### Step 2: User Tries to Create Notebook → Blocked
UI reads `storage.notebooks.can_use = false` → Show upgrade modal
#### Step 3: User Clicks Upgrade → Fetch Plans
```http
GET /api/plans
```
```json
{
  "success": true,
  "data": [
    {
      "name": "Pro Plan",
      "slug": "pro",
      "tagline": "Unlock AI Chat and Semantic Search",
      "price": 500.00,
      "is_most_popular": true,
      "features": [
        { "text": "Basic Note Taking", "is_enabled": true },
        { "text": "Semantic Search", "is_enabled": true },
        { "text": "AI Chat Assistant", "is_enabled": true }
      ]
    }
  ]
}
```
---
## Summary of API Changes
### New Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/plans` | | Get all plans for pricing modal |
| GET | `/api/user/usage-status` | User | Get current usage vs limits |
| GET | `/api/admin/plans/:id/features` | Admin | Get plan features |
| POST | `/api/admin/plans/:id/features` | Admin | Create plan feature |
| PUT | `/api/admin/plans/features/:featureId` | Admin | Update plan feature |
| DELETE | `/api/admin/plans/features/:featureId` | Admin | Delete plan feature |
### Changed DTOs
| DTO | Changes |
|-----|---------|
| [SubscriptionStatusResponse](file:///d:/notetaker/notefiber-BE/internal/dto/user_dto.go#34-43) | Added `semantic_search_daily_limit`, changed field names |
| [SubscriptionFeatures](file:///d:/notetaker/notefiber-BE/internal/dto/user_dto.go#27-33) | Changed `max_notes` → `max_notebooks` + `max_notes_per_notebook` |
| [PlanFeaturesDTO](file:///d:/notetaker/notefiber-BE/internal/dto/admin_dto.go#96-104) (Admin) | Same changes as above |
| **429 Error Response** | Now returns structured [LimitExceededError](file:///d:/notetaker/notefiber-BE/internal/dto/chatbot_dto.go#53-58) |
### Field Name Changes
| Old | New |
|-----|-----|
| `ai_daily_credit_limit` | `ai_chat_daily_limit` |
| `max_notes` | `max_notebooks` |
| - | `max_notes_per_notebook` |
| - | `semantic_search_daily_limit` |
---
## Notes for Frontend Team
1. **Always pre-check limits** before allowing create/chat/search actions
2. **Cache usage status** locally and refresh periodically (every 30s or on action)
3. **Handle 429 gracefully** by showing the pricing modal
4. **Feature text is dynamic** - use the `features` array from `/api/plans`, not hardcoded text
5. **Daily limits reset at midnight** - show countdown using `resets_at` field
