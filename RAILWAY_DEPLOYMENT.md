# Railway Deployment Guide

## 🚀 Railway Project Created!

**Project URL**: https://railway.com/project/a528197c-5884-466e-a7a8-a4eda9b04f93

## 📋 Manual Deployment Steps

Since we've created the Railway project, complete the deployment manually through the Railway dashboard:

### Step 1: Access Your Project
1. Go to: https://railway.com/project/a528197c-5884-466e-a7a8-a4eda9b04f93
2. You should see your `iot-dashboard-platform` project

### Step 2: Add Required Services

#### PostgreSQL Database
1. Click "New Service" → "Database" → "PostgreSQL"
2. Railway will auto-generate connection variables
3. Note the `DATABASE_URL` from the service variables

#### Redis Cache
1. Click "New Service" → "Database" → "Redis"
2. Railway will auto-generate connection variables
3. Note the `REDIS_URL` from the service variables

#### MQTT Broker (Optional - can use external)
1. Click "New Service" → "Docker Image"
2. Use image: `eclipse-mosquitto:2.0`
3. Add volume: `/mosquitto/data`
4. Expose port: `1883`

### Step 3: Deploy Web Application
1. Click "New Service" → "GitHub Repo"
2. Connect: https://github.com/PokeyPoke/iot-dashboard-platform
3. Railway will auto-detect Next.js and configure build
4. Wait for initial deployment

### Step 4: Configure Environment Variables

In the web service settings, add these environment variables:

#### Auto-Generated (by Railway services)
```bash
DATABASE_URL=postgresql://...  # From PostgreSQL service
REDIS_URL=redis://...          # From Redis service
NEXTAUTH_URL=https://...       # Auto-generated domain
```

#### Manual Configuration Required
```bash
# Security
NEXTAUTH_SECRET=your-32-character-random-secret
JWT_SECRET=your-32-character-random-secret
JWT_REFRESH_SECRET=your-different-32-character-secret

# External APIs (get free API keys)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
OPENWEATHER_API_KEY=your_openweather_key
COINAPI_KEY=your_coinapi_key
NEWS_API_KEY=your_newsapi_key

# Admin User
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password

# MQTT (use Railway internal if MQTT service added)
MQTT_BROKER_URL=mqtt://mosquitto.railway.internal:1883
MQTT_USERNAME=iot_user
MQTT_PASSWORD=your_mqtt_password

# Webhook Secrets
ESPN_WEBHOOK_SECRET=your_webhook_secret
SPORTSDATA_WEBHOOK_SECRET=your_webhook_secret
NWS_WEBHOOK_SECRET=your_webhook_secret
TRANSIT_WEBHOOK_SECRET=your_webhook_secret

# Production Settings
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
```

### Step 5: Generate Secrets

Generate secure random strings for secrets:

```bash
# On macOS/Linux
openssl rand -hex 32

# Or online at: https://randomkeygen.com/
```

### Step 6: Database Setup

After the web service is deployed:

1. Go to web service → "Deploy" tab
2. Wait for successful deployment
3. Database migrations will run automatically on first deploy
4. Check logs to confirm seeding completed

### Step 7: Get Your API Keys

#### Free API Keys:
- **Alpha Vantage** (Stock data): https://www.alphavantage.co/support/#api-key
- **OpenWeatherMap** (Weather): https://openweathermap.org/api
- **CoinGecko** (Crypto): Free tier available, no key required
- **NewsAPI** (News): https://newsapi.org/

#### Add API Keys to Railway:
1. Copy each API key
2. Add to Railway environment variables
3. Redeploy the service

### Step 8: Custom Domain (Optional)

1. Go to web service → "Settings" → "Domains"
2. Add your custom domain
3. Configure DNS records as shown
4. Railway will auto-generate SSL certificate

### Step 9: Test Deployment

1. Access your Railway-provided URL
2. Register a new account or login with admin credentials
3. Create your first dashboard
4. Add widgets (Stock, Weather, Crypto)
5. Test real-time data updates

### Step 10: IoT Device Setup

1. Go to dashboard → "Manage Devices"
2. Click "Add Device"
3. Copy the device token and MQTT settings
4. Flash ESP32 with the code from `iot-examples/esp32/`
5. Update WiFi and device credentials
6. Device should connect and display dashboard data

## 🔍 Monitoring

### Health Check
- URL: `https://your-app.railway.app/api/health`
- Should return: `{"status":"ok","services":{"database":"connected","redis":"connected"}}`

### Logs
- Access logs in Railway dashboard → Service → "Deploy" tab
- Monitor for errors during startup and runtime

### Performance
- Railway provides automatic scaling
- Monitor CPU and memory usage in dashboard
- Database connection pooling is configured automatically

## 🛠️ Troubleshooting

### Common Issues:

**Build Failures:**
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

**Database Connection Errors:**
- Verify DATABASE_URL is set correctly
- Check PostgreSQL service is running
- Ensure migrations completed successfully

**API Rate Limits:**
- Monitor external API usage
- Check API keys are valid
- Verify caching is working (Redis connection)

**MQTT Connection Issues:**
- Check MQTT broker service status
- Verify internal networking between services
- Test with external MQTT broker if needed

## 📈 Scaling

### Free Tier Limits:
- $5/month free credit
- Automatic scaling within limits
- Multiple services supported

### Production Scaling:
- Automatic horizontal scaling
- Database connection pooling
- Redis persistence
- CDN integration available

## 🔐 Security

### Production Checklist:
- ✅ All secrets are randomly generated
- ✅ HTTPS enforced (automatic with Railway)
- ✅ Database credentials secured
- ✅ API rate limiting enabled
- ✅ Input validation implemented
- ✅ CORS properly configured

## 📱 Mobile & IoT

### Responsive Design:
- Works on all screen sizes
- Touch-friendly interface
- PWA capabilities built-in

### IoT Integration:
- MQTT broker for real-time sync
- Device management dashboard
- ESP32 example code provided
- Custom device support via API

---

## 🎉 Your IoT Dashboard Platform is Ready!

Once deployed, you'll have a production-ready platform that can:
- Display real-time stock, weather, and crypto data
- Connect unlimited IoT devices (Premium tier)
- Handle multiple users with authentication
- Scale automatically with Railway
- Provide real-time updates via WebSocket and MQTT

**Next Steps:**
1. Complete the Railway setup above
2. Get your free API keys
3. Test the web dashboard
4. Connect your first IoT device
5. Invite users to create their own dashboards!

**Project Dashboard**: https://railway.com/project/a528197c-5884-466e-a7a8-a4eda9b04f93