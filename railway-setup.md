# Railway Environment Variables Setup

To complete the deployment, you need to set these environment variables in Railway:

## Required Variables

Go to your Railway project dashboard: https://railway.com/project/50e639cb-4818-4eac-9740-0a83ee764f0c

Click on your web service, then go to the "Variables" tab and add:

### Database & Authentication
```
DATABASE_URL=postgresql://[PROVIDED_BY_RAILWAY_POSTGRES_SERVICE]
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
NODE_ENV=production
```

### Optional API Keys (for real data)
```
NEXT_PUBLIC_ALPHA_VANTAGE_KEY=your-alpha-vantage-api-key
NEXT_PUBLIC_OPENWEATHER_KEY=your-openweather-api-key
```

### Admin User (for seeding)
```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## Services to Add in Railway

1. **PostgreSQL Database**
   - Click "New Service" → "Database" → "Add PostgreSQL"
   - Copy the DATABASE_URL to your environment variables

2. **Redis Cache** (Optional but recommended)
   - Click "New Service" → "Database" → "Add Redis"
   - Copy the REDIS_URL if you want caching

## After Setting Up Variables

1. Redeploy your web service
2. The database will auto-migrate on startup
3. An admin user will be created automatically

## Database Commands (if needed)

If you need to manually run database operations:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

## Default Login Credentials

Once deployed with the admin user environment variables:
- Email: admin@example.com
- Password: admin123

## Getting API Keys (Free Options)

- **Alpha Vantage (Stock Data)**: https://www.alphavantage.co/support/#api-key
- **OpenWeatherMap (Weather)**: https://openweathermap.org/api

Without these keys, the app will use realistic mock data for demonstrations.