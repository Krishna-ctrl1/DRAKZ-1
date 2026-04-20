# DRAKZ Platform Test Suite Documentation

This document contains a comprehensive list of all integration and unit tests passing in our Vitest automation suite. These tests guarantee backend reliability, data security, and cache performance.

## 1. Authentication Integration Tests (`tests/api/auth.test.js`)
*These tests ensure that user creation and token management are completely secure.*
- [x] should register a new user and return a token
- [x] should reject duplicate email registration
- [x] should reject registration without required fields
- [x] should login with valid credentials
- [x] should reject login with wrong password
- [x] should reject login with non-existent email
- [x] should return user profile with valid token (`/me`)
- [x] should reject request without token
- [x] should reject request with invalid token

## 2. Protected Routes Guard (`tests/api/protected.test.js`)
*These tests dynamically loop through all critical API endpoints ensuring absolute RBAC protection against unauthenticated attacks.*
- [x] should reject unauthenticated requests (401) for `/api/credit-score/me`
- [x] should reject unauthenticated requests (401) for `/api/account-summary`
- [x] should reject unauthenticated requests (401) for `/api/spendings/weekly`
- [x] should reject unauthenticated requests (401) for `/api/spendings/distribution-pie`
- [x] should reject unauthenticated requests (401) for `/api/investments/user-investments`
- [x] should reject unauthenticated requests (401) for `/api/investments/investment-history`
- [x] should reject unauthenticated requests (401) for `/api/blogs/my-blogs`
- [x] should reject unauthenticated requests (401) for `/api/cards`
- [x] should reject unauthenticated requests (401) for `/api/user/advisors`
- [x] should reject unauthenticated requests (401) for `/api/user/advisor/status`
- [x] should accept authenticated requests (200) for all of the above guarded endpoints
- [x] should create a spending record securely
- [x] should get weekly summary securely
- [x] should get spending list securely
- [x] should submit a contact message

## 3. Blog & Search Integration (`tests/api/blogs.test.js`)
*Validates the public and heavily indexed text search systems.*
- [x] should return public blog list without auth
- [x] should create a blog with valid token
- [x] should reject blog creation without auth
- [x] should reject blog creation with missing fields
- [x] should return blogs owned by the user
- [x] should require auth for `my-blogs` endpoint

## 4. Redis Cache Middleware Unit Tests (`tests/unit/redisCache.test.js`)
*Crucial tests proving the implementation of our database caching mechanisms.*
- [x] should return cached data on cache HIT
- [x] should call `next()` on cache MISS and gracefully intercept the db response
- [x] should use a custom dynamic key generator when provided
- [x] should fallback gracefully when Redis connection drops or errors
- [x] should successfully delete matching keys during invalidation sweeps
- [x] should handle invalidation commands with no matching keys gracefully

## 5. Security & RBAC Unit Tests (`tests/unit/auth.middleware.test.js`)
*Unit testing the custom Express middleware that guards the system.*
- [x] should call `next()` with a valid Bearer token
- [x] should call `next()` with legacy x-auth-token headers
- [x] should return 401 if no token is provided
- [x] should return 401 if token is maliciously modified/invalid
- [x] should return 401 if token is expired
- [x] should allow user with strictly matching roles (`requireRole`)
- [x] should allow user if their role exists within allowed array
- [x] should deny user with a non-matching unprivileged role
- [x] should strictly allow only admin users (`requireAdmin`)
- [x] should strictly deny non-admin users from admin portals
