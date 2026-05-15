import 'dotenv/config';
import { AgoraOracle } from './src/logic/deliberator.js';
import * as fs from 'fs';
import express from 'express';

// --- Hugging Face Health Check ---
const app = express();
const port = process.env.PORT || 7860;

app.get('/', (req, res) => res.send('Oracle of Agora is active and listening.'));
app.listen(port, '0.0.0.0', () => console.log(`\n✅ Health check listening on port ${port}`));
// ---------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error('❌ Missing GOOGLE_API_KEY in .env');
  console.error('   Add: GOOGLE_API_KEY=your_gemini_api_key');
  process.exit(1);
}

// ── Simulate a social signal ────────────────────────────
const testSignals = [
  // Signal 1: Bullish hype — test if the Skeptic catches it
  `🚀🚀🚀 BREAKING: Major institutional player just bridged $50M USDC to Arc.network! 
   On-chain data shows massive liquidity inflows to Arc DEX pools. 
   Source: @CryptoWhale_Alpha (120K followers, 3 correct calls in last month)
   "Arc is about to become the stablecoin settlement layer. This is the big one."
   Multiple CT influencers confirming. Volume spike 400% in last hour.`,

  // Signal 2: Fear signal — test if the Opportunist finds a contrarian play
  `⚠️ ALERT: Circle just froze $2M in USDC on Arc.network per DOJ request.
   Regulatory FUD spreading across CT. Multiple accounts posting "Arc is done."
   However: On-chain TVL actually UP 2% in last 24h. Retail selling, institutions holding.
   Source: @OnChainSleuth (85K followers, known for accurate on-chain analysis)`,
];

const oracle = new AgoraOracle(GOOGLE_API_KEY, 'gemini-2.5-flash');

console.log('╔══════════════════════════════════════════════╗');
console.log('║     THE ORACLE OF AGORA — DELIBERATION TEST  ║');
console.log('╚══════════════════════════════════════════════╝\n');

// Run the first signal
const result = await oracle.deliberate(testSignals[0]);

// Save the rationale artifact
const outputDir = 'output';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(`${outputDir}/trade_rationale.md`, result.rationale);
console.log(`📝 Rationale saved to: ${outputDir}/trade_rationale.md`);

// Print the execution decision
console.log('\n╔══════════════════════════════════════════════╗');
if (result.shouldExecute) {
  console.log('║  🚀 TRADE AUTHORIZED — Would call Circle Wallet ║');
} else {
  console.log('║  🛑 TRADE REJECTED  — Threshold not met          ║');
}
console.log('╚══════════════════════════════════════════════╝\n');
