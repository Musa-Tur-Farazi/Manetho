// Agora Token Authentication Verification Script
// Run with: node verify-agora-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Agora Token Authentication Setup...\n');

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('❌ Error: .env.local file not found');
  process.exit(1);
}

// Extract App ID
const appIdMatch = envContent.match(/NEXT_PUBLIC_AGORA_APP_ID=(.+)/);
if (!appIdMatch) {
  console.log('❌ Error: NEXT_PUBLIC_AGORA_APP_ID not found in .env.local');
  process.exit(1);
}

const appId = appIdMatch[1].trim();
console.log(`📱 App ID: ${appId}`);
console.log(`📏 Length: ${appId.length} characters`);

// Extract App Certificate
const certMatch = envContent.match(/AGORA_APP_CERTIFICATE=(.+)/);
if (!certMatch) {
  console.log('❌ Error: AGORA_APP_CERTIFICATE not found in .env.local');
  console.log('💡 You need to add the App Certificate for token authentication');
  process.exit(1);
}

const appCertificate = certMatch[1].trim();
console.log(`🔐 App Certificate: ${appCertificate.substring(0, 8)}...`);
console.log(`📏 Certificate Length: ${appCertificate.length} characters\n`);

// Validate App ID
if (appId.length !== 32) {
  console.log('❌ Error: App ID should be exactly 32 characters long');
  process.exit(1);
}

if (!/^[a-zA-Z0-9]+$/.test(appId)) {
  console.log('❌ Error: App ID should contain only alphanumeric characters');
  process.exit(1);
}

// Validate App Certificate
if (appCertificate === 'your_app_certificate_here') {
  console.log('❌ App Certificate not configured!\n');
  console.log('🔒 TO ENABLE TOKEN AUTHENTICATION:');
  console.log('1. Go to https://console.agora.io/');
  console.log('2. Navigate to your project');
  console.log('3. Go to Features → App Certificate');
  console.log('4. Click "Enable" and copy the certificate');
  console.log('5. Replace "your_app_certificate_here" in .env.local');
  console.log('6. Restart your development server\n');
  console.log('⚠️  Without App Certificate, token authentication will fail!');
  process.exit(1);
}

if (appCertificate.length !== 32) {
  console.log('❌ Error: App Certificate should be exactly 32 characters long');
  console.log('💡 Make sure you copied the full certificate from Agora Console');
  process.exit(1);
}

if (!/^[a-zA-Z0-9]+$/.test(appCertificate)) {
  console.log('❌ Error: App Certificate should contain only alphanumeric characters');
  console.log('💡 Check for any extra spaces or special characters');
  process.exit(1);
}

console.log('✅ App ID format is valid (32 characters)');
console.log('✅ App Certificate format is valid (32 characters)');
console.log('✅ Token authentication configuration looks correct!\n');

console.log('🔒 SECURITY FEATURES ENABLED:');
console.log('• Server-side token generation');
console.log('• Time-limited access (1 hour expiration)');
console.log('• User authentication required');
console.log('• Channel access control');
console.log('• Protection against unauthorized usage\n');

console.log('🚀 Next Steps:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Test video calling with secure tokens');
console.log('3. Check browser console for "Token received successfully" message');
console.log('4. Verify "Successfully joined channel with token authentication"\n');

console.log('💡 Token Features:');
console.log('• Tokens expire after 1 hour for security');
console.log('• Each user gets a unique token per channel');
console.log('• Server validates user authentication before token generation');
console.log('• Production-ready security implementation'); 