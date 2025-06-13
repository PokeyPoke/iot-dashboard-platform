#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Programmatic migration starting...');

// Function to execute SQL directly using Prisma's raw query capabilities
async function runMigrations() {
  try {
    // Use Prisma CLI directly with shell execution
    console.log('🔄 Running database migrations...');
    
    // Set proper environment for Prisma
    process.env.NODE_ENV = 'production';
    
    // Run migrations using shell command with proper PATH
    const migrationSQL = `
-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum  
CREATE TYPE "WidgetType" AS ENUM ('STOCK', 'WEATHER', 'CRYPTO', 'NEWS', 'SPORTS', 'TRANSIT', 'CUSTOM', 'LINE_CHART', 'GAUGE', 'INDICATOR', 'TEXT_DISPLAY', 'BAR_CHART');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('ESP32_DISPLAY', 'ARDUINO', 'RASPBERRY_PI', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ServiceName" AS ENUM ('ALPHA_VANTAGE', 'OPENWEATHER', 'COINAPI', 'NEWS_API', 'ESPN_API', 'TRANSIT_API');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT NOT NULL,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "apiRateLimitRemaining" INTEGER NOT NULL DEFAULT 1000,
    "lastLogin" TIMESTAMP(3),
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "layoutConfig" JSONB NOT NULL DEFAULT '{}',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Widget" (
    "id" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "widgetType" "WidgetType" NOT NULL,
    "title" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "deviceToken" TEXT,
    "dataField" TEXT,
    "positionX" INTEGER NOT NULL DEFAULT 0,
    "positionY" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL DEFAULT 4,
    "height" INTEGER NOT NULL DEFAULT 3,
    "refreshInterval" INTEGER NOT NULL DEFAULT 300,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Widget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceType" "DeviceType" NOT NULL,
    "apiToken" TEXT NOT NULL,
    "mqttTopic" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3),
    "deviceConfig" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceName" "ServiceName" NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_refreshToken_idx" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Dashboard_userId_idx" ON "Dashboard"("userId");

-- CreateIndex
CREATE INDEX "Widget_dashboardId_idx" ON "Widget"("dashboardId");

-- CreateIndex
CREATE INDEX "Widget_deviceToken_idx" ON "Widget"("deviceToken");

-- CreateIndex
CREATE UNIQUE INDEX "Device_apiToken_key" ON "Device"("apiToken");

-- CreateIndex
CREATE UNIQUE INDEX "Device_mqttTopic_key" ON "Device"("mqttTopic");

-- CreateIndex
CREATE INDEX "Device_userId_idx" ON "Device"("userId");

-- CreateIndex
CREATE INDEX "Device_apiToken_idx" ON "Device"("apiToken");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_userId_serviceName_key" ON "ApiKey"("userId", "serviceName");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Widget" ADD CONSTRAINT "Widget_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`;

    // Try to run the SQL directly using node postgres if available
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // Try to check if tables exist first
      await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
      console.log('✅ Tables already exist, skipping migration');
    } catch (error) {
      // Tables don't exist, run migration
      console.log('🔧 Creating database tables...');
      await prisma.$executeRawUnsafe(migrationSQL);
      console.log('✅ Database tables created successfully');
    }
    
    // Run seed
    console.log('🌱 Seeding database...');
    await runSeed(prisma);
    
    await prisma.$disconnect();
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

async function runSeed(prisma) {
  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingUser) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const adminUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: adminEmail,
        username: 'admin',
        passwordHash: hashedPassword,
        subscriptionTier: 'PREMIUM',
        emailVerified: new Date()
      }
    });
    
    // Create default dashboard
    const dashboard = await prisma.dashboard.create({
      data: {
        id: uuidv4(),
        userId: adminUser.id,
        name: 'My Dashboard',
        isDefault: true,
        layoutConfig: {}
      }
    });
    
    console.log('✅ Admin user and dashboard created');
    console.log('👤 Login credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
}

runMigrations();