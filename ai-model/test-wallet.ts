import 'dotenv/config';
import { CircleDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

// ── Config ──────────────────────────────────────────────
const API_KEY = process.env.CIRCLE_API_KEY;
const ENTITY_SECRET_RAW = process.env.CIRCLE_ENTITY_SECRET;

if (!API_KEY || !ENTITY_SECRET_RAW) {
  console.error('❌ Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET in .env');
  process.exit(1);
}

// Entity secret format is PREFIX:ID:SECRET — the client needs the raw 64-char hex (ID+SECRET or just the hex portion)
const entitySecretParts = ENTITY_SECRET_RAW.split(':');
const ENTITY_SECRET = entitySecretParts.length === 3
  ? entitySecretParts[1] + entitySecretParts[2]   // Concatenate ID + SECRET to get 64-char hex
  : ENTITY_SECRET_RAW;

console.log('🔑 API Key:', API_KEY.slice(0, 12) + '...');
console.log('🔑 Entity Secret (raw):', ENTITY_SECRET.slice(0, 8) + '... (' + ENTITY_SECRET.length + ' chars)');

// ── Initialize Client ───────────────────────────────────
const client = new CircleDeveloperControlledWalletsClient({
  apiKey: API_KEY,
  entitySecret: ENTITY_SECRET,
  baseUrl: 'https://api.circle.com',
});

async function run() {
  try {
    // 1. Test connection — get public key
    console.log('\n── Step 1: Testing connection (getPublicKey) ──');
    const pubKey = await client.getPublicKey();
    console.log('✅ Public Key:', pubKey.data?.publicKey?.slice(0, 40) + '...');

    // 2. List existing wallet sets
    console.log('\n── Step 2: Listing wallet sets ──');
    const walletSets = await client.listWalletSets();
    const sets = walletSets.data?.walletSets || [];
    console.log(`📦 Found ${sets.length} wallet set(s)`);
    sets.forEach((s: any) => console.log(`   - ${s.id} "${s.name}" (${s.custodyType})`));

    // 3. Create a wallet set if none exist
    let walletSetId: string;
    if (sets.length === 0) {
      console.log('\n── Step 3: Creating wallet set "Oracle of Agora" ──');
      const newSet = await client.createWalletSet({ name: 'Oracle of Agora' });
      walletSetId = newSet.data?.walletSet?.id!;
      console.log('✅ Created wallet set:', walletSetId);
    } else {
      walletSetId = sets[0].id!;
      console.log(`\n── Step 3: Using existing wallet set: ${walletSetId} ──`);
    }

    // 4. List existing wallets
    console.log('\n── Step 4: Listing wallets ──');
    const wallets = await client.listWallets({ walletSetId });
    const existingWallets = wallets.data?.wallets || [];
    console.log(`💳 Found ${existingWallets.length} wallet(s)`);
    existingWallets.forEach((w: any) => {
      console.log(`   - ${w.id}`);
      console.log(`     Address: ${w.address}`);
      console.log(`     Chain: ${w.blockchain}`);
      console.log(`     State: ${w.state}`);
    });

    // 5. Find or create an ARC-TESTNET wallet (keep Sepolia for future cross-chain)
    let walletId: string;
    let walletAddress: string;
    const arcWallet = existingWallets.find((w: any) => w.blockchain === 'ARC-TESTNET');
    if (!arcWallet) {
      console.log('\n── Step 5: Creating wallet on ARC-TESTNET 🚀 ──');
      const newWallets = await client.createWallets({
        walletSetId,
        blockchains: ['ARC-TESTNET'],
        count: 1,
      });
      const created = newWallets.data?.wallets?.[0];
      walletId = created?.id!;
      walletAddress = created?.address!;
      console.log('✅ Created ARC-TESTNET wallet:', walletId);
      console.log('   Address:', walletAddress);
    } else {
      walletId = arcWallet.id!;
      walletAddress = arcWallet.address!;
      console.log(`\n── Step 5: Using existing ARC-TESTNET wallet: ${walletId} ──`);
      console.log(`   Address: ${walletAddress}`);
    }

    // 6. Check balance
    console.log('\n── Step 6: Checking token balance ──');
    const balance = await client.getWalletTokenBalance({ id: walletId });
    const tokens = balance.data?.tokenBalances || [];
    if (tokens.length === 0) {
      console.log('💰 No tokens found (wallet is empty)');
    } else {
      tokens.forEach((t: any) => {
        console.log(`   ${t.token?.symbol}: ${t.amount} (${t.token?.name})`);
      });
    }

    // 7. Request testnet USDC (native gas on Arc)
    console.log('\n── Step 7: Requesting testnet USDC (Arc native gas) ──');
    try {
      await client.requestTestnetTokens({
        address: walletAddress,
        blockchain: 'ARC-TESTNET',
        usdc: true,
      } as any);
      console.log('✅ Testnet USDC request sent! USDC is native gas on Arc — no ETH needed.');
    } catch (faucetErr: any) {
      console.log('⚠️  Faucet request:', faucetErr?.message || faucetErr);
    }

    // Summary
    console.log('\n══════════════════════════════════════════');
    console.log('📋 SUMMARY');
    console.log('══════════════════════════════════════════');
    console.log(`Wallet Set ID:  ${walletSetId}`);
    console.log(`Wallet ID:      ${walletId}`);
    console.log(`Address:        ${walletAddress}`);
    console.log('══════════════════════════════════════════');

  } catch (err: any) {
    console.error('\n❌ Error:', err?.message || err);
    if (err?.response?.data) {
      console.error('   Details:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

run();
