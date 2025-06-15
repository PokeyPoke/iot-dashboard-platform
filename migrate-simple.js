#!/usr/bin/env node

console.log('🚀 Simple programmatic migration starting...');

async function runMigrations() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🔄 Running database migrations...');
    
    try {
      // Try to check if tables exist first
      await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
      console.log('✅ Tables already exist, skipping migration');
    } catch (error) {
      // Tables don't exist, run migration step by step
      console.log('🔧 Creating database tables...');
      
      try {
        // Create enums first
        await prisma.$executeRaw`CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM')`;
        console.log('✅ Created SubscriptionTier enum');
      } catch (e) { 
        console.log('⚠️  SubscriptionTier enum already exists or failed');
      }
      
      try {
        await prisma.$executeRaw`CREATE TYPE "WidgetType" AS ENUM ('STOCK', 'WEATHER', 'CRYPTO', 'NEWS', 'SPORTS', 'TRANSIT', 'CUSTOM', 'LINE_CHART', 'GAUGE', 'INDICATOR', 'TEXT_DISPLAY', 'BAR_CHART')`;
        console.log('✅ Created WidgetType enum');
      } catch (e) { 
        console.log('⚠️  WidgetType enum already exists or failed');
      }
      
      try {
        await prisma.$executeRaw`CREATE TYPE "DeviceType" AS ENUM ('ESP32_DISPLAY', 'ARDUINO', 'RASPBERRY_PI', 'CUSTOM')`;
        console.log('✅ Created DeviceType enum');
      } catch (e) { 
        console.log('⚠️  DeviceType enum already exists or failed');
      }
      
      try {
        await prisma.$executeRaw`CREATE TYPE "ServiceName" AS ENUM ('ALPHA_VANTAGE', 'OPENWEATHER', 'COINAPI', 'NEWS_API', 'ESPN_API', 'TRANSIT_API')`;
        console.log('✅ Created ServiceName enum');
      } catch (e) { 
        console.log('⚠️  ServiceName enum already exists or failed');
      }
      
      // Create tables
      try {
        await prisma.$executeRaw`
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
          )
        `;
        console.log('✅ Created User table');
      } catch (e) { 
        console.log('⚠️  User table already exists or failed');
      }
      
      try {
        await prisma.$executeRaw`
          CREATE TABLE "Session" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "refreshToken" TEXT NOT NULL,
            "expiresAt" TIMESTAMP(3) NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
          )
        `;
        console.log('✅ Created Session table');
      } catch (e) { 
        console.log('⚠️  Session table already exists or failed');
      }
      
      try {
        await prisma.$executeRaw`
          CREATE TABLE "Dashboard" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "layoutConfig" JSONB NOT NULL DEFAULT '{}',
            "isDefault" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
          )
        `;
        console.log('✅ Created Dashboard table');
      } catch (e) { 
        console.log('⚠️  Dashboard table already exists or failed');
      }
      
      try {
        await prisma.$executeRaw`
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
          )
        `;
        console.log('✅ Created Widget table');
      } catch (e) { 
        console.log('⚠️  Widget table already exists or failed');
      }
      
      try {
        await prisma.$executeRaw`
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
          )
        `;
        console.log('✅ Created Device table');
      } catch (e) { 
        console.log('⚠️  Device table already exists or failed');
      }
      
      try {
        await prisma.$executeRaw`
          CREATE TABLE "ApiKey" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "serviceName" "ServiceName" NOT NULL,
            "encryptedKey" TEXT NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
          )
        `;
        console.log('✅ Created ApiKey table');
      } catch (e) { 
        console.log('⚠️  ApiKey table already exists or failed');
      }
      
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