# How to Check and Fix Database URL in Railway

## Step 1: Check Your PostgreSQL Service Name

1. Go to your Railway project: https://railway.com/project/50e639cb-4818-4eac-9740-0a83ee764f0c
2. Look at all your services - you should see:
   - Your web service (iot-dashboard-platform)
   - A PostgreSQL service (might be named "Postgres", "PostgreSQL", or something similar)

## Step 2: Check the Database URL Variable

1. Click on your **web service** (iot-dashboard-platform)
2. Go to the **Variables** tab
3. Look for `DATABASE_URL`

The value should look like: `${{ServiceName.DATABASE_URL}}`

Where `ServiceName` is exactly the name of your PostgreSQL service.

## Common Issues and Fixes:

### Issue 1: Wrong Service Name
If your PostgreSQL service is named "PostgreSQL" but your variable says `${{Postgres.DATABASE_URL}}`, change it to:
```
DATABASE_URL=${{PostgreSQL.DATABASE_URL}}
```

### Issue 2: No DATABASE_URL Variable
If you don't see a DATABASE_URL variable, add it:
```
DATABASE_URL=${{YourPostgreSQLServiceName.DATABASE_URL}}
```

### Issue 3: PostgreSQL Service Not Connected
If the variable exists but the database connection fails:
1. Check that your PostgreSQL service is running (green status)
2. Make sure both services are in the same project
3. Try redeploying after setting the variable

## Step 3: Find the Exact Service Name

If you're unsure of the exact service name:
1. Click on your PostgreSQL service
2. Look at the **Connect** tab
3. Copy the service name from the connection string examples

## Step 4: Required Environment Variables

Make sure you have ALL these variables in your web service:

```
DATABASE_URL=${{YourPostgreSQLServiceName.DATABASE_URL}}
JWT_SECRET=your-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-secure-refresh-secret-here
NODE_ENV=production
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
RUN_MIGRATIONS=true
RUN_SEED=true
```

## Step 5: Test the Connection

After setting the variables correctly:
1. Save the variables
2. Redeploy your web service
3. Check the logs to see if the database connection works

## Quick Check Command

If you can access the Railway CLI locally, you can check variables with:
```bash
railway variables
```