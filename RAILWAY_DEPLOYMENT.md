# Railway Deployment Guide

## Current Status
Your application is deploying with the OpenSSL compatibility fixes. Once the build completes, follow these steps:

## 1. Add PostgreSQL Database to Railway

1. Go to your Railway project: https://railway.com/project/50e639cb-4818-4eac-9740-0a83ee764f0c
2. Click "New Service" → "Database" → "Add PostgreSQL"
3. Wait for the database to provision

## 2. Connect Database to Your App

1. Click on your web service (iot-dashboard-platform)
2. Go to the "Variables" tab
3. Add these environment variables:

```
# The DATABASE_URL will be automatically available from the PostgreSQL service
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Security keys (IMPORTANT: Change these in production!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long

# Environment
NODE_ENV=production

# Admin user (for initial setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-admin-password
```

## 3. Run Database Migrations

Once the database is connected and the app is deployed:

1. Go to your web service
2. Click on the "Settings" tab
3. Under "Deploy" section, temporarily update the start command to:
   ```
   npx prisma migrate deploy && npx prisma db seed && node server.js
   ```
4. Redeploy the service
5. After successful migration, change the start command back to:
   ```
   node server.js
   ```

## 4. Access Your Application

Your app will be available at the Railway-provided URL. You can find it:
1. Click on your web service
2. Look for the "Domains" section
3. Click on the generated domain or add a custom domain

## Login Credentials

After the database is seeded, you can login with:
- Email: admin@example.com (or whatever you set in ADMIN_EMAIL)
- Password: The password you set in ADMIN_PASSWORD

## Troubleshooting

If you still see errors:

1. **Check logs**: Click on your service → "Logs" tab
2. **Verify environment variables**: Ensure all required variables are set
3. **Check database connection**: Make sure the PostgreSQL service is running
4. **Restart the service**: Sometimes a manual restart helps after setting variables

## Optional: Add Redis for Caching

For better performance:
1. Click "New Service" → "Database" → "Add Redis"
2. Add to your app's environment variables:
   ```
   REDIS_URL=${{Redis.REDIS_URL}}
   ```