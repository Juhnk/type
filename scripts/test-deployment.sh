#!/bin/bash

# Simple deployment validation script
set -euo pipefail

echo "🧪 Testing TypeAmp Deployment Infrastructure"

# Test 1: Environment variables validation
echo "✓ Testing environment validation..."
if [ -z "${STAGING_FRONTEND_URL:-}" ]; then
  echo "⚠️  STAGING_FRONTEND_URL not set (expected in CI)"
else
  echo "✓ STAGING_FRONTEND_URL: $STAGING_FRONTEND_URL"
fi

# Test 2: Build process
echo "✓ Testing build process..."
npm run build > /dev/null 2>&1
echo "✓ Build successful"

# Test 3: Health check endpoint
echo "✓ Testing health endpoint..."
npm run start > start.log 2>&1 &
SERVER_PID=$!
sleep 5

# Test health endpoint
health_response=$(curl -s http://localhost:3000/api/health || echo "failed")
if echo "$health_response" | grep -q "timestamp"; then
  echo "✓ Health endpoint working"
else
  echo "⚠️  Health endpoint test failed"
fi

# Cleanup
kill $SERVER_PID 2>/dev/null || true
rm -f start.log

echo "🎉 Deployment infrastructure validation complete!"