# Complete Railway Setup - Ready to Execute

## Current Status
- ✅ Project created: iot-dashboard-platform  
- ✅ Web application deployed
- ❌ Database NOT configured
- ❌ Environment variables NOT set

## Immediate Action Required

### Step 1: Add PostgreSQL Database
Go to: https://railway.com/project/50e639cb-4818-4eac-9740-0a83ee764f0c

1. Click "New Service" 
2. Select "Database"
3. Click "Add PostgreSQL"
4. Wait for provisioning to complete

### Step 2: Set Environment Variables

Click on your **web service** (purple box), then go to **Variables** tab and add these:

```
JWT_SECRET=jyPrknW6VgBIfsuZhPnfwk7pM1+Av8L7o3EarY/47iU=
JWT_REFRESH_SECRET=/jHWfa721Y6lydxsFlgqRwtnE2Sh4+JfwUEJ3eHSnPk=
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
NODE_ENV=production
```

### Step 3: Connect Database
1. Click on the **PostgreSQL service** 
2. Go to **Variables** tab
3. Copy the `DATABASE_URL` value
4. Go back to your **web service** → **Variables** tab  
5. Add: `DATABASE_URL=[paste the copied value]`

### Step 4: Redeploy
The service will automatically redeploy when you add variables.

## Verification Commands

After setup, test these endpoints:

```bash
# Should return "healthy" status
curl https://iot-dashboard-platform-production.up.railway.app/api/health

# Should accept registration
curl -X POST https://iot-dashboard-platform-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Should accept login  
curl -X POST https://iot-dashboard-platform-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Expected Result
- ✅ Login/Register works
- ✅ Dashboard loads with widgets
- ✅ Add Widget modal shows Stock/Weather options
- ✅ Widgets save and display real data
- ✅ Drag & drop persists positions

## Default Login After Setup
- Email: `admin@example.com`
- Password: `admin123`

---

**Once you complete these 4 steps, the application will be fully functional!**