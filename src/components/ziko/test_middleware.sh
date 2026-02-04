#!/bin/bash

# Middleware Testing Script
# This script tests all middleware functionality

BASE_URL="http://localhost:3001"

echo "============================================"
echo "Middleware Testing Script"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Request without token (should fail with 401)
echo -e "${YELLOW}Test 1: GET /users without token${NC}"
echo "Expected: 401 Unauthorized"
curl -s -X GET "$BASE_URL/api/users" | jq . || echo "Error occurred"
echo ""

# Test 2: Request with invalid token (should fail with 401)
echo -e "${YELLOW}Test 2: GET /users with invalid token${NC}"
echo "Expected: 401 Invalid token"
curl -s -X GET "$BASE_URL/api/users" \
  -H "Authorization: Bearer invalid_token_here" | jq . || echo "Error occurred"
echo ""

# Test 3: Invalid user input (missing fields)
echo -e "${YELLOW}Test 3: POST /users with invalid data (no token)${NC}"
echo "Expected: 401 No token"
curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"John"}' | jq . || echo "Error occurred"
echo ""

# Test 4: Invalid email format
echo -e "${YELLOW}Test 4: POST /users with invalid email (need admin token)${NC}"
echo "Expected: 400 Invalid email format"
echo "Note: You need a valid admin token. Replace TOKEN_HERE with actual admin token"
curl -s -X POST "$BASE_URL/api/users" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"invalid","password":"123456","role":"admin"}' | jq . || echo "Error occurred"
echo ""

# Test 5: Password too short
echo -e "${YELLOW}Test 5: POST /users with short password (need admin token)${NC}"
echo "Expected: 400 Password must be at least 6 characters"
curl -s -X POST "$BASE_URL/api/users" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"123","role":"admin"}' | jq . || echo "Error occurred"
echo ""

# Test 6: Invalid role
echo -e "${YELLOW}Test 6: POST /users with invalid role (need admin token)${NC}"
echo "Expected: 400 Role must be one of: user, admin, advisor"
curl -s -X POST "$BASE_URL/api/users" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"123456","role":"invalid"}' | jq . || echo "Error occurred"
echo ""

echo -e "${GREEN}============================================${NC}"
echo "To test with valid requests, use an admin JWT token"
echo "============================================"
