#!/bin/sh

echo "Starting application..."

# Check if we need to run migrations
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
  
  # Run seed if specified
  if [ "$RUN_SEED" = "true" ]; then
    echo "Seeding database..."
    npx prisma db seed
  fi
fi

# Start the application
echo "Starting Next.js server..."
exec node server.js