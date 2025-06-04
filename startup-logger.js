// Startup logging utility
console.log('🚀 Application startup beginning...')
console.log('📊 Environment variables check:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('REDIS_URL exists:', !!process.env.REDIS_URL)
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
console.log('JWT_REFRESH_SECRET exists:', !!process.env.JWT_REFRESH_SECRET)
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT)
console.log('PORT:', process.env.PORT || 'not set')

// Add more detailed database URL logging (without exposing the full URL)
if (process.env.DATABASE_URL) {
  const dbUrl = new URL(process.env.DATABASE_URL)
  console.log('🗄️ Database connection details:')
  console.log('- Protocol:', dbUrl.protocol)
  console.log('- Host:', dbUrl.hostname)
  console.log('- Port:', dbUrl.port)
  console.log('- Database:', dbUrl.pathname)
} else {
  console.log('❌ DATABASE_URL not found')
}

console.log('🔧 Starting Next.js application...')