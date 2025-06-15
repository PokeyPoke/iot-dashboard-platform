import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingUser) {
      return NextResponse.json({
        status: 'success',
        message: 'Admin user already exists',
        email: adminEmail
      })
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    const adminUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: adminEmail,
        username: 'admin',
        passwordHash: hashedPassword,
        subscriptionTier: 'PREMIUM',
        emailVerified: new Date()
      }
    })
    
    // Create default dashboard
    const dashboard = await prisma.dashboard.create({
      data: {
        id: uuidv4(),
        userId: adminUser.id,
        name: 'My Dashboard',
        isDefault: true,
        layoutConfig: {}
      }
    })
    
    return NextResponse.json({
      status: 'success',
      message: 'Admin user and dashboard created successfully',
      email: adminEmail,
      userId: adminUser.id,
      dashboardId: dashboard.id
    })
    
  } catch (error) {
    console.error('Admin creation failed:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}