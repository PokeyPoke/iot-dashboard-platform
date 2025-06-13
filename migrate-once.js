#!/usr/bin/env node

const { spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');

console.log('🚀 One-time migration script starting...');

// Function to run command with proper output handling
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function runMigrations() {
  try {
    // Try to run migrations with different approaches
    console.log('🔄 Running database migrations...');
    
    try {
      // Try npx first
      await runCommand('npx', ['prisma', 'migrate', 'deploy']);
      console.log('✅ Migrations completed successfully');
    } catch (error) {
      try {
        // Try direct node_modules path
        await runCommand('./node_modules/.bin/prisma', ['migrate', 'deploy']);
        console.log('✅ Migrations completed successfully');
      } catch (error2) {
        // Try with npm exec
        await runCommand('npm', ['exec', 'prisma', 'migrate', 'deploy']);
        console.log('✅ Migrations completed successfully');
      }
    }
    
    // Run seed
    console.log('🌱 Seeding database...');
    try {
      await runCommand('npm', ['run', 'db:seed']);
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Seeding failed:', error.message);
      console.log('⚠️  Continuing without seed data...');
    }
    
    console.log('🎉 Database setup complete! You can now login.');
    console.log('👤 Admin credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: (whatever you set in ADMIN_PASSWORD)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();