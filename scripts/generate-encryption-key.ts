import crypto from 'crypto';

const key = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 Generated Encryption Key:');
console.log(key);
console.log('\n📋 Add this to your .env.local file:');
console.log(`ENCRYPTION_KEY="${key}"`);
console.log('\n⚠️  Keep this key secure and never commit it to git!\n');
