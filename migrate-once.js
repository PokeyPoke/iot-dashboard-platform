#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🚀 One-time migration script starting...');

// Run migration
console.log('🔄 Running database migrations...');
exec('npx prisma migrate deploy', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Migration failed:', error);
    return;
  }
  
  console.log('✅ Migration output:', stdout);
  if (stderr) console.log('Migration warnings:', stderr);
  
  // Run seed after migration
  console.log('🌱 Seeding database...');
  exec('npx prisma db seed', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Seeding failed:', error);
      return;
    }
    
    console.log('✅ Seed output:', stdout);
    if (stderr) console.log('Seed warnings:', stderr);
    
    console.log('🎉 Database setup complete! You can now login.');
    console.log('👤 Admin credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: (whatever you set in ADMIN_PASSWORD)');
  });
});