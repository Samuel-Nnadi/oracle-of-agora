import 'dotenv/config';
import { registerEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets';

const apiKey = process.env.CIRCLE_API_KEY!;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET!;

// The entity secret value is the third part (the actual hex secret)
// But registerEntitySecretCiphertext needs a 64-char hex string as entitySecret
// and the full API key string for auth.

// Extract the raw 32-byte hex secret from the CIRCLE_ENTITY_SECRET
// Format is PREFIX:ID:SECRET — we need just the hex portion for registration
const parts = entitySecret.split(':');
const rawSecret = parts.length === 3 ? parts[1] + parts[2] : entitySecret;

console.log('🔑 Registering entity secret with Circle...');
console.log('   API Key:', apiKey.slice(0, 12) + '...');
console.log('   Entity Secret (raw hex):', rawSecret.slice(0, 8) + '... (' + rawSecret.length + ' chars)');

try {
  const response = await registerEntitySecretCiphertext({
    apiKey,
    entitySecret: rawSecret,
    baseUrl: 'https://api.circle.com',
  });

  console.log('\n✅ Entity secret registered successfully!');
  if (response.data?.recoveryFile) {
    console.log('📄 Recovery File Content (SAVE THIS):');
    console.log(response.data.recoveryFile);
    
    // Also save to file
    const fs = await import('fs');
    fs.writeFileSync('recovery_file.dat', response.data.recoveryFile);
    console.log('\n💾 Recovery file saved to: recovery_file.dat');
  }
} catch (err: any) {
  console.error('\n❌ Registration failed:', err?.message || err);
  if (err?.response?.data) {
    console.error('   Details:', JSON.stringify(err.response.data, null, 2));
  }
}