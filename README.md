# IoT Dashboard Platform

A comprehensive dashboard platform that allows users to create personalized widget-based dashboards displaying real-time data (stocks, weather, crypto, etc.) with the unique capability of connecting IoT devices (ESP32, displays, etc.) to access the same customized data feeds.

## 🚀 Features

### Core Platform
- **Customizable Dashboards** - Drag-and-drop widget interface
- **Real-time Data** - Stock prices, weather, cryptocurrency, news, sports
- **IoT Integration** - Connect ESP32, Arduino, Raspberry Pi devices
- **MQTT Communication** - Real-time data sync to IoT devices
- **Smart Caching** - Intelligent API optimization and cost reduction
- **Webhook Support** - Real-time event notifications

### Widget Types
- **Stock Market** - Real-time prices, charts, portfolio tracking
- **Weather** - Current conditions, forecasts, alerts
- **Cryptocurrency** - Price tracking, portfolio monitoring
- **News Feed** - Breaking news, custom sources
- **Sports Scores** - Live games, schedules, standings
- **Public Transit** - Real-time arrivals, service alerts

### IoT Device Support
- **ESP32 with Display** - Color LCD dashboard displays
- **Arduino** - Simple LED/segment displays
- **Raspberry Pi** - Full-featured displays and controls
- **Custom Devices** - Open API for any MQTT-capable device

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL with Redis caching
- **Authentication**: JWT with refresh tokens
- **IoT Communication**: MQTT (Mosquitto broker)
- **Deployment**: Railway platform
- **Real-time**: WebSockets + MQTT

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis instance
- MQTT broker (Mosquitto)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iot-dashboard-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Web interface: http://localhost:3000
   - Admin login: admin@localhost / admin123

### API Keys Required

Get free API keys from these providers:
- **Alpha Vantage** (Stock data): https://www.alphavantage.co/support/#api-key
- **OpenWeatherMap** (Weather): https://openweathermap.org/api
- **CoinGecko** (Crypto - free tier available)
- **NewsAPI** (News): https://newsapi.org/

## 🌐 Deployment

### Railway Deployment

1. **Create Railway project**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Set up services**
   - PostgreSQL database
   - Redis instance
   - MQTT broker
   - Web application

3. **Configure environment variables**
   Set all required environment variables in Railway dashboard

4. **Deploy**
   ```bash
   railway up
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up database**
   ```bash
   npx prisma migrate deploy
   ```

3. **Start production server**
   ```bash
   npm start
   ```

## 🔧 IoT Device Setup

### ESP32 Configuration

1. **Install required libraries**
   - WiFi
   - PubSubClient
   - ArduinoJson
   - TFT_eSPI

2. **Flash the firmware**
   ```cpp
   // Use the code in iot-examples/esp32/dashboard_display.ino
   // Update WiFi credentials and device token
   ```

3. **Pair the device**
   - Go to dashboard → Devices → Add Device
   - Copy the device token and pairing code
   - Update the Arduino code with your credentials

### MQTT Topics

```
dashboard/{userId}/{deviceId}/update     # Real-time widget updates
dashboard/{userId}/{deviceId}/heartbeat  # Device status
dashboard/{userId}/{deviceId}/config     # Configuration changes
```

## 📊 API Documentation

### Authentication
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

### Dashboards
```http
GET    /api/dashboards
POST   /api/dashboards
PUT    /api/dashboards/:id
DELETE /api/dashboards/:id
```

### Widgets
```http
GET    /api/widgets
POST   /api/widgets
PUT    /api/widgets/:id
DELETE /api/widgets/:id
```

### IoT Devices
```http
GET    /api/devices
POST   /api/devices
PUT    /api/devices/:id
DELETE /api/devices/:id
GET    /api/iot/:deviceToken/dashboard
```

### Data Endpoints
```http
GET /api/data/stocks/:symbol
GET /api/data/weather/:location
GET /api/data/crypto/:coin
GET /api/data/news
```

## 🔐 Security

- **JWT Authentication** with short-lived access tokens
- **Device API Tokens** with limited scope
- **Rate Limiting** per user and endpoint
- **Input Validation** and sanitization
- **SQL Injection Prevention** with Prisma
- **MQTT over TLS** for production

## 🎨 Widget Development

Create custom widgets using the widget framework:

```typescript
// 1. Define configuration schema
const widgetConfig = {
  title: "Custom Widget",
  configSchema: {
    apiEndpoint: { type: "string", required: true },
    refreshInterval: { type: "number", default: 300 }
  }
}

// 2. Implement data fetching
async function fetchData(config) {
  // Your data fetching logic
}

// 3. Create React component
function CustomWidget({ config, data, onRefresh }) {
  // Your widget UI
}
```

## 📈 Performance

- **Smart Caching** - Shared data across users reduces API calls by 90%+
- **Background Refresh** - Users never wait for fresh data
- **WebSocket Updates** - Real-time data without polling
- **CDN Integration** - Fast global content delivery
- **Database Optimization** - Indexed queries and connection pooling

## 🔄 Data Flow

1. **Web Dashboard** ← Real-time updates via WebSocket
2. **API Server** ← Fetches data from external APIs
3. **Redis Cache** ← Stores frequently accessed data
4. **MQTT Broker** ← Distributes updates to IoT devices
5. **IoT Devices** ← Display real-time dashboard data

## 🐛 Troubleshooting

### Common Issues

**Database connection failed**
- Check DATABASE_URL environment variable
- Ensure PostgreSQL is running
- Run `npx prisma migrate dev`

**MQTT connection issues**
- Verify MQTT broker is accessible
- Check MQTT credentials
- Ensure firewall allows MQTT port (1883/8883)

**API rate limits**
- Check your API key quotas
- Verify caching is working
- Consider upgrading API plans

### Logs and Monitoring

- **Application logs**: Check Railway logs or local console
- **Database logs**: Monitor slow queries in PostgreSQL
- **MQTT logs**: Check broker connection status
- **API usage**: Monitor external API call rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Prisma** - Database toolkit
- **Railway** - Deployment platform
- **Mosquitto** - MQTT broker
- **Tailwind CSS** - Styling framework

## 📞 Support

- **Documentation**: /docs
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@example.com

---

**Built with ❤️ for the IoT community**