#!/bin/bash

BASE_URL="https://iot-dashboard-platform-production.up.railway.app"

echo "🧪 Testing IoT Dashboard Deployment"
echo "===================================="

# Test 1: Health Check
echo ""
echo "1️⃣  Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/api/health")
echo "Response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed - Database likely not connected"
fi

# Test 2: Frontend Loading
echo ""
echo "2️⃣  Testing Frontend Loading..."
FRONTEND_RESPONSE=$(curl -s "$BASE_URL" | head -c 100)
if echo "$FRONTEND_RESPONSE" | grep -q "IoT Dashboard"; then
    echo "✅ Frontend loads correctly"
else
    echo "❌ Frontend loading failed"
fi

# Test 3: Registration Endpoint
echo ""
echo "3️⃣  Testing User Registration..."
REG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$(date +%s)'@example.com","password":"test123"}')

if echo "$REG_RESPONSE" | grep -q "accessToken"; then
    echo "✅ Registration works"
else
    echo "❌ Registration failed"
    echo "Response: $REG_RESPONSE"
fi

# Test 4: Admin Login
echo ""
echo "4️⃣  Testing Admin Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo "✅ Admin login works"
    echo "🎉 Deployment is fully functional!"
else
    echo "❌ Admin login failed"
    echo "Response: $LOGIN_RESPONSE"
fi

echo ""
echo "🔗 Live URL: $BASE_URL"
echo "📧 Admin Email: admin@example.com"
echo "🔒 Admin Password: admin123"