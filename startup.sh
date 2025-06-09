#!/bin/sh

echo "🚀 Starting IoT Dashboard Platform..."

# Always check database connection
echo "🗄️  Checking database connection..."
if [ -n "$DATABASE_URL" ]; then
  echo "✅ Database URL configured"
else
  echo "❌ No DATABASE_URL found!"
fi

# Debug environment variables
echo "🔍 Environment variables check:"
echo "RUN_MIGRATIONS=${RUN_MIGRATIONS}"
echo "FORCE_MIGRATIONS=${FORCE_MIGRATIONS}"
echo "RUN_SEED=${RUN_SEED}"

# Force run migrations for initial deployment - we'll check if tables exist
echo "🔄 Checking if database tables exist..."
TABLE_CHECK=$(npx prisma db execute --stdin <<< "SELECT to_regclass('public.\"User\"');" 2>/dev/null | grep -c "User" || echo "0")

if [ "$TABLE_CHECK" = "0" ] || [ "$RUN_MIGRATIONS" = "true" ] || [ "$FORCE_MIGRATIONS" = "true" ]; then
  echo "🔄 Running database migrations (tables missing or forced)..."
  npx prisma migrate deploy
  
  if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
    
    # Always run seed after successful migration
    echo "🌱 Seeding database with initial data..."
    npx prisma db seed
    
    if [ $? -eq 0 ]; then
      echo "✅ Database seeded successfully"
    else
      echo "❌ Seeding failed!"
      exit 1
    fi
  else
    echo "❌ Migration failed!"
    exit 1
  fi
else
  echo "⏭️  Database tables exist, skipping migrations"
fi

# Start the application
echo "🌐 Starting Next.js server..."
exec node server.js