# NoteFiber API Integration Architecture Guide

Version 1.0.0 | React + TypeScript

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Required Dependencies](#required-dependencies)
3. [Project Structure](#project-structure)
4. [Layer Responsibilities](#layer-responsibilities)
5. [Design Principles](#design-principles)
6. [Type System Guidelines](#type-system-guidelines)
7. [HTTP Client Configuration](#http-client-configuration)
8. [Error Handling Strategy](#error-handling-strategy)
9. [State Management Guidelines](#state-management-guidelines)
10. [Security Best Practices](#security-best-practices)
11. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

The API integration follows a **layered architecture** with strict separation of concerns. Each layer has a single responsibility and communicates only with adjacent layers through well-defined interfaces.

### Architecture Layers (Bottom to Top)

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │  React Components
│         (UI Components)                 │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         Application Layer               │  Custom Hooks
│         (Business Logic)                │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         Service Layer                   │  API Services
│         (API Communication)             │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         Infrastructure Layer            │  HTTP Client, Config
│         (HTTP, Storage, Utils)          │
└─────────────────────────────────────────┘
```

**Key Principle:** Components never call services directly. They always use custom hooks as intermediaries.

---

## Required Dependencies

### Core Dependencies

```json
{
  "axios": "^1.6.0",
  "react-query": "^5.0.0" or "@tanstack/react-query": "^5.0.0",
  "zod": "^3.22.0",
  "date-fns": "^3.0.0"
}
```

### Development Dependencies

```json
{
  "@types/node": "^20.0.0",
  "msw": "^2.0.0",
  "vitest": "^1.0.0"
}
```

### Optional but Recommended

```json
{
  "axios-retry": "^4.0.0",
  "axios-auth-refresh": "^3.3.0"
}
```

### Dependency Justification

- **axios**: Type-safe HTTP client with interceptor support
- **react-query**: Server state management, caching, and request deduplication
- **zod**: Runtime type validation for API responses
- **date-fns**: Date manipulation (ISO 8601 handling)
- **axios-retry**: Automatic retry logic for failed requests
- **axios-auth-refresh**: Token refresh mechanism
- **msw**: API mocking for testing

---

## Project Structure

```
# API Configuration
src/api/client/axios.client.ts           # Axios instance configuration
src/api/client/interceptors/auth.interceptor.ts   # JWT token injection
src/api/client/interceptors/error.interceptor.ts  # Global error handling
src/api/client/interceptors/retry.interceptor.ts  # Retry logic
src/api/client/index.ts                  # Barrel export for client

# API Services - Authentication
src/api/services/auth/auth.service.ts    # Auth API calls
src/api/services/auth/auth.types.ts      # Auth-specific types
src/api/services/auth/auth.schemas.ts    # Zod schemas for validation

# API Services - User
src/api/services/user/user.service.ts    # User API calls
src/api/services/user/user.types.ts      # User-specific types
src/api/services/user/user.schemas.ts    # User validation schemas

# API Services - Payment
src/api/services/payment/payment.service.ts    # Payment API calls
src/api/services/payment/payment.types.ts      # Payment-specific types
src/api/services/payment/payment.schemas.ts    # Payment validation schemas

# API Services - Location
src/api/services/location/location.service.ts  # Location API calls
src/api/services/location/location.types.ts    # Location-specific types
src/api/services/location/location.schemas.ts  # Location validation schemas

# API Services Export
src/api/services/index.ts                # Barrel export for all services

# API Types
src/api/types/common.types.ts            # Shared API types
src/api/types/error.types.ts             # Error response types
src/api/types/response.types.ts          # Generic response wrappers

# API Configuration
src/api/config/api.config.ts             # API URLs and constants
src/api/config/endpoints.ts              # Endpoint path constants

# React Hooks - Authentication
src/hooks/auth/useLogin.ts               # Login hook
src/hooks/auth/useRegister.ts            # Registration hook
src/hooks/auth/useVerifyEmail.ts         # Email verification hook
src/hooks/auth/useForgotPassword.ts      # Forgot password hook
src/hooks/auth/useResetPassword.ts       # Reset password hook
src/hooks/auth/useAuth.ts                # Auth context hook

# React Hooks - User
src/hooks/user/useUserProfile.ts         # Get user profile hook
src/hooks/user/useUpdateProfile.ts       # Update profile hook
src/hooks/user/useDeleteAccount.ts       # Delete account hook

# React Hooks - Payment
src/hooks/payment/useSubscriptionPlans.ts     # Get subscription plans hook
src/hooks/payment/useCheckout.ts              # Checkout process hook
src/hooks/payment/useSubscriptionStatus.ts    # Check subscription status hook
src/hooks/payment/useCancelSubscription.ts    # Cancel subscription hook

# React Hooks - Location
src/hooks/location/useDetectCountry.ts   # Country detection hook
src/hooks/location/useCities.ts          # Get cities hook
src/hooks/location/useStates.ts          # Get states/provinces hook
src/hooks/location/useZipcodes.ts        # Get zipcodes hook

# React Hooks Export
src/hooks/index.ts                       # Barrel export for all hooks

# React Contexts
src/contexts/AuthContext.tsx             # Authentication state management
src/contexts/QueryClientProvider.tsx     # React Query setup and configuration

# Utilities - Storage
src/utils/storage/token.storage.ts       # Token management utilities
src/utils/storage/secure.storage.ts      # Encrypted storage wrapper

# Utilities - Validators
src/utils/validators/email.validator.ts  # Email validation utilities
src/utils/validators/password.validator.ts  # Password validation utilities

# Utilities - Formatters
src/utils/formatters/date.formatter.ts   # Date formatting utilities
src/utils/formatters/currency.formatter.ts  # Currency formatting utilities

# Utilities - Error Handling
src/utils/error/error.mapper.ts          # Map API errors to user-friendly messages
src/utils/error/error.logger.ts          # Error logging utility

# Constants
src/constants/api.constants.ts           # API-related constants
src/constants/storage.constants.ts       # Storage keys and constants
src/constants/error.constants.ts         # Error messages and codes
```

---

## Layer Responsibilities

### 1. Infrastructure Layer (`api/client/`, `utils/`)

**Single Responsibility:** Provide low-level HTTP communication and utility functions.

**Rules:**
- Contains Axios instance configuration
- Implements interceptors for cross-cutting concerns
- No business logic
- No React dependencies
- No direct usage in components
- Pure functions only in utils
- No state management

**Exports:**
- Configured HTTP client
- Utility functions
- Storage abstractions

---

### 2. Service Layer (`api/services/`)

**Single Responsibility:** Encapsulate all API communication logic.

**Rules:**
- One service class/module per API domain (Auth, User, Payment, Location)
- Each service method maps to one API endpoint
- Methods return strongly-typed promises
- Validate responses using Zod schemas
- Transform API responses to domain types
- Handle service-specific errors
- No React dependencies (hooks, components, state)
- No direct DOM manipulation
- No business logic beyond API communication

**Method Structure:**
- Method name reflects the business operation (e.g., `loginUser`, not `postLogin`)
- Accept typed parameters
- Return typed responses wrapped in ApiResponse
- Throw typed errors

**Forbidden:**
- useState, useEffect, or any React hooks
- Direct access to localStorage/sessionStorage (use storage utils)
- Mixing multiple API calls in one method
- Side effects beyond HTTP requests

---

### 3. Application Layer (`hooks/`)

**Single Responsibility:** Bridge between UI and services, manage API state.

**Rules:**
- One hook per API operation
- Use React Query for server state management
- Transform service responses for UI consumption
- Handle loading, error, and success states
- Implement optimistic updates where appropriate
- Manage request cancellation
- No direct Axios calls
- No JSX or UI logic

**Hook Structure:**
- Named with `use` prefix
- Return object with: `{ data, isLoading, error, mutate/refetch }`
- Use React Query mutations for write operations
- Use React Query queries for read operations
- Invalidate related queries on mutations

**Forbidden:**
- Direct service imports in components
- Business logic in components
- Manual state management for server data

---

### 4. Presentation Layer (Components)

**Single Responsibility:** Render UI and handle user interactions.

**Rules:**
- Only use custom hooks for API interactions
- No direct service calls
- No Axios imports
- Focus on UI logic and rendering
- Delegate business logic to hooks
- Handle user input validation at form level

---

## Design Principles

### 1. Single Responsibility Principle (SRP)

**Application:**
- One service per API domain
- One hook per API operation
- One type file per service
- One schema file per service
- Each function does one thing

**Example Violations to Avoid:**
- ❌ Hook that calls multiple unrelated services
- ❌ Service method that combines login + profile fetch
- ❌ Component that directly uses Axios
- ❌ Utility function that does multiple transformations

---

### 2. Open/Closed Principle (OCP)

**Application:**
- Services are open for extension via inheritance/composition
- Closed for modification via interceptors
- Use strategy pattern for error handling
- Use factory pattern for service instantiation

**Guidelines:**
- Add new interceptors without modifying existing client
- Create new service methods without changing existing ones
- Extend error handlers without modifying core logic

---

### 3. Dependency Inversion Principle (DIP)

**Application:**
- Components depend on hook abstractions, not services
- Services depend on HTTP client interface, not Axios directly
- High-level modules don't depend on low-level modules

**Implementation:**
- Define interfaces for services
- Inject dependencies through constructors
- Use dependency injection for testing

---

### 4. Interface Segregation Principle (ISP)

**Application:**
- Hooks return only data needed by component
- Services expose only relevant methods
- Types are specific to use case, not generic

**Guidelines:**
- Split large service interfaces into smaller ones
- Create focused types for each operation
- Avoid "God objects" with too many properties

---

### 5. Separation of Concerns

**Rules:**
- API logic stays in services
- State management stays in hooks
- UI logic stays in components
- Configuration stays in config files
- Types stay in type files
- Validation schemas stay in schema files

**Boundaries:**
- Services never import from hooks
- Hooks never import from components
- Components never import from services
- Utils are pure and dependency-free

---

## Type System Guidelines

### 1. Type Organization

**Rules:**
- One type file per service (`auth.types.ts`, `user.types.ts`)
- Shared types in `common.types.ts`
- API response types in `response.types.ts`
- Error types in `error.types.ts`

### 2. Naming Conventions

**Interfaces:**
- Request DTOs: `{Operation}Request` (e.g., `LoginRequest`)
- Response DTOs: `{Operation}Response` (e.g., `LoginResponse`)
- Domain entities: `{Entity}` (e.g., `User`, `Subscription`)
- API responses: `ApiResponse<T>`, `ApiError`

**Types:**
- Union types: `{Entity}Status` (e.g., `SubscriptionStatus`)
- Enums: `{Entity}{Property}Enum` (e.g., `UserRoleEnum`)

### 3. Type Definition Rules

**Request Types:**
- Must match API request body exactly
- Required fields are non-optional
- Use discriminated unions for polymorphic requests

**Response Types:**
- Must match API response structure
- Validate at runtime using Zod schemas
- Transform to domain types after validation

**Domain Types:**
- Represent business entities
- Independent from API structure
- Used in application and presentation layers

### 4. Generic Type Usage

**Common Patterns:**
- `ApiResponse<T>` for standard API responses
- `PaginatedResponse<T>` for paginated data
- `ApiError` for error responses
- `QueryResult<T>` for React Query results

### 5. Type Safety Rules

**Mandatory:**
- No `any` types (use `unknown` if needed)
- Strict null checks enabled
- No type assertions without validation
- Runtime validation for external data

**Type Guards:**
- Create type guard functions for runtime checks
- Use Zod schemas for complex validations
- Validate all API responses

---

## HTTP Client Configuration

### 1. Axios Instance Configuration

**Requirements:**
- Single Axios instance per API base URL
- Configure base URL from environment variables
- Set default headers (Content-Type, Accept)
- Configure timeout
- Enable credentials for CORS

### 2. Interceptor Architecture

**Request Interceptors (Order Matters):**
1. **Auth Interceptor**: Inject JWT token
2. **Logging Interceptor**: Log outgoing requests (dev only)
3. **Request ID Interceptor**: Add correlation ID

**Response Interceptors (Order Matters):**
1. **Response Validation Interceptor**: Validate with Zod
2. **Auth Refresh Interceptor**: Handle 401 and refresh token
3. **Error Interceptor**: Transform errors to domain errors
4. **Logging Interceptor**: Log responses/errors (dev only)

### 3. Interceptor Rules

**Auth Interceptor:**
- Retrieve token from secure storage
- Attach to Authorization header
- Skip for public endpoints (login, register)
- Handle expired tokens

**Error Interceptor:**
- Transform Axios errors to domain errors
- Map HTTP status codes to user-friendly messages
- Extract API error details
- Log errors appropriately

**Retry Interceptor:**
- Retry on network errors
- Retry on 5xx server errors
- Don't retry on 4xx client errors
- Implement exponential backoff
- Maximum 3 retries

---

## Error Handling Strategy

### 1. Error Type Hierarchy

**Layers:**
```
ApiError (base)
├── NetworkError (connection issues)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── ValidationError (400, 422)
├── NotFoundError (404)
├── ConflictError (409)
├── RateLimitError (429)
└── ServerError (5xx)
```

### 2. Error Transformation Pipeline

**Steps:**
1. Axios throws error
2. Error interceptor catches
3. Map to domain error type
4. Extract user-friendly message
5. Log technical details
6. Throw transformed error
7. Hook catches error
8. Update error state
9. Component displays to user

### 3. Error Handling Rules

**Service Layer:**
- Throw typed errors
- Include original error for debugging
- Add context (endpoint, method, payload)
- Never swallow errors

**Hook Layer:**
- Catch service errors
- Map to UI-friendly messages
- Update error state
- Provide retry mechanism
- Log errors to monitoring service

**Component Layer:**
- Display error messages from hook
- Provide user actions (retry, cancel)
- Never show technical details to users
- Maintain error boundaries

### 4. Error Message Strategy

**Principles:**
- User-friendly messages in UI
- Technical details in logs
- Actionable error messages
- Consistent error format

**Message Sources:**
- API error message (if user-friendly)
- Predefined error constants
- Fallback generic messages

---

## State Management Guidelines

### 1. Server State (React Query)

**Use For:**
- API data fetching
- Caching API responses
- Request deduplication
- Optimistic updates
- Background refetching

**Configuration:**
- Set appropriate stale times
- Configure retry logic
- Enable/disable refetch on window focus
- Set cache times

**Query Key Structure:**
```typescript
// Pattern: [domain, operation, ...params]
['auth', 'profile']
['user', 'profile', userId]
['payment', 'plans']
['payment', 'subscription', userId]
['location', 'cities', { country, query }]
```

**Rules:**
- Consistent query key structure
- Invalidate related queries on mutations
- Use query key factories
- Prefetch predictable data

### 2. Client State (Context API / Zustand)

**Use For:**
- Authentication state (token, user)
- UI state (theme, language)
- Form state (Formik/React Hook Form)

**Rules:**
- Separate from server state
- Keep minimal
- Use Context API for simple state
- Use Zustand for complex state

### 3. State Synchronization

**Rules:**
- Server state is source of truth
- Update client state from server state
- Invalidate queries on auth changes
- Clear cache on logout

---

## Security Best Practices

### 1. Token Management

**Rules:**
- Store tokens in httpOnly cookies (preferred) or encrypted localStorage
- Never store tokens in plain localStorage
- Never expose tokens in URLs
- Clear tokens on logout
- Implement token refresh mechanism
- Set appropriate token expiration

### 2. Request Security

**Rules:**
- Always use HTTPS in production
- Include CSRF tokens for mutations
- Validate all inputs client-side
- Sanitize user inputs
- Implement request signing for sensitive operations

### 3. Sensitive Data Handling

**Rules:**
- Never log tokens or passwords
- Mask sensitive data in logs
- Clear sensitive data from memory after use
- Implement proper cleanup in useEffect

### 4. CORS Configuration

**Rules:**
- Configure allowed origins
- Set credentials: true
- Specify allowed headers
- Handle preflight requests

---

## Testing Strategy

### 1. Service Layer Testing

**Approach:**
- Mock Axios using MSW (Mock Service Worker)
- Test successful responses
- Test error scenarios
- Test request transformations
- Test response validations

**Coverage:**
- All service methods
- All error paths
- Request/response transformations
- Schema validations

### 2. Hook Testing

**Approach:**
- Use React Testing Library
- Mock services
- Test loading states
- Test error states
- Test success states
- Test invalidation logic

**Coverage:**
- All hooks
- All state transitions
- Query invalidation
- Optimistic updates

### 3. Integration Testing

**Approach:**
- Test full API flow
- Use MSW for API mocking
- Test authentication flow
- Test error recovery
- Test retry logic

---

## Additional Best Practices

### 1. Code Organization

**Rules:**
- Group by feature, not by type
- Keep related files together
- Use barrel exports (index.ts) sparingly
- Avoid circular dependencies

### 2. Documentation

**Required:**
- JSDoc for all public service methods
- Type documentation for complex types
- README per major module
- API endpoint documentation reference

### 3. Performance

**Rules:**
- Implement request cancellation
- Use request deduplication
- Cache static data aggressively
- Lazy load large dependencies
- Implement pagination
- Debounce search queries

### 4. Monitoring

**Implement:**
- Error tracking (Sentry)
- API performance monitoring
- Request/response logging (dev)
- User action tracking

---

## Integration Checklist

Before integrating an API endpoint:

- [ ] Define types in service-specific types file
- [ ] Create Zod schema for response validation
- [ ] Implement service method
- [ ] Create custom hook using React Query
- [ ] Handle loading, error, success states
- [ ] Implement error transformation
- [ ] Add query invalidation logic
- [ ] Write unit tests for service
- [ ] Write tests for hook
- [ ] Document usage in component
- [ ] Test error scenarios
- [ ] Verify token refresh works
- [ ] Check retry logic
- [ ] Validate type safety

---

## Common Anti-Patterns to Avoid

### ❌ Direct Axios Calls in Components
Components should never import Axios. Always use hooks.

### ❌ Hooks Calling Multiple Services
One hook should wrap one service operation. Compose hooks if needed.

### ❌ Services with React Dependencies
Services must be framework-agnostic. No hooks, no JSX.

### ❌ Mixed Concerns in Hooks
Hooks should not contain UI logic. Only state management.

### ❌ Generic "God" Services
Split large services into focused, single-responsibility services.

### ❌ Implicit Dependencies
Always inject dependencies explicitly. No hidden globals.

### ❌ Tight Coupling
Layers should communicate through interfaces, not implementations.

### ❌ Bypassing Layers
Never skip layers. Component → Hook → Service → Client.

---

## Conclusion

This architecture ensures:
- **Maintainability**: Clear separation makes changes isolated
- **Testability**: Each layer can be tested independently
- **Scalability**: Easy to add new features without touching existing code
- **Type Safety**: End-to-end type safety from API to UI
- **Developer Experience**: Clear structure reduces cognitive load

Follow these principles religiously for a robust, maintainable API integration layer.