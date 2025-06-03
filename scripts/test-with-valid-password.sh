#!/bin/bash

BASE_URL="https://iot-dashboard-platform-production.up.railway.app"

echo "🧪 Testing with Valid Credentials"
echo "================================="

# Test with 8+ character password
echo "Testing Registration with valid password..."
REG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$(date +%s)'@example.com","password":"test12345"}')

echo "Registration Response: $REG_RESPONSE"

# Test admin login
echo ""
echo "Testing Admin Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin123"}')

echo "Login Response: $LOGIN_RESPONSE"

# Test health
echo ""
echo "Testing Health..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/api/health")
echo "Health Response: $HEALTH_RESPONSE"