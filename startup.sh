#!/bin/sh

echo "🚀 Starting IoT Dashboard Platform v5..."

# Always check database connection
echo "🗄️  Checking database connection..."
if [ -n "$DATABASE_URL" ]; then
  echo "✅ Database URL configured"
else
  echo "❌ No DATABASE_URL found!"
  exit 1
fi

# Run migrations using the simple migration script
echo "🔄 Running database migrations and seeding..."
node migrate-simple.js

if [ $? -eq 0 ]; then
  echo "✅ Database setup completed successfully"
else
  echo "❌ Database setup failed - continuing anyway..."
fi

# Start the application
echo "🌐 Starting Next.js server..."
exec node server.js