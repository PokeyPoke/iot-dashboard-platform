#!/bin/sh

echo "🚀 Starting IoT Dashboard Platform v4..."

# Always check database connection
echo "🗄️  Checking database connection..."
if [ -n "$DATABASE_URL" ]; then
  echo "✅ Database URL configured"
else
  echo "❌ No DATABASE_URL found!"
  exit 1
fi

# Use the locally installed Prisma binary directly
echo "🔄 Running database migrations..."
./node_modules/.bin/prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
  
  # Run seed after successful migration
  echo "🌱 Seeding database with initial data..."
  ./node_modules/.bin/prisma db seed
  
  if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully"
  else
    echo "❌ Seeding failed - continuing anyway..."
  fi
else
  echo "❌ Migration failed - continuing anyway (tables might already exist)..."
fi

# Start the application
echo "🌐 Starting Next.js server..."
exec node server.js