#!/bin/sh

echo "🚀 Starting IoT Dashboard Platform..."

# Always check database connection
echo "🗄️  Checking database connection..."
if [ -n "$DATABASE_URL" ]; then
  echo "✅ Database URL configured"
else
  echo "❌ No DATABASE_URL found!"
fi

# Check if we need to run migrations
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "🔄 Running database migrations..."
  npx prisma migrate deploy
  
  if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
  else
    echo "❌ Migration failed!"
    exit 1
  fi
  
  # Run seed if specified
  if [ "$RUN_SEED" = "true" ]; then
    echo "🌱 Seeding database with initial data..."
    npx prisma db seed
    
    if [ $? -eq 0 ]; then
      echo "✅ Database seeded successfully"
    else
      echo "❌ Seeding failed!"
      exit 1
    fi
  fi
else
  echo "⏭️  Skipping migrations (RUN_MIGRATIONS not set to true)"
fi

# Start the application
echo "🌐 Starting Next.js server..."
exec node server.js