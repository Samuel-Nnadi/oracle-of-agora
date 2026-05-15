# 🏛️ Oracle of Agora

> *"Do not expect a single answer. The oracle deliberates."*

**Oracle of Agora** is an autonomous crypto trading agent that uses a multi-perspective AI deliberation framework ("Aristotelian Deliberation") to evaluate social signals from Crypto Twitter and decide — with strict criteria — whether to execute trades via a Circle Developer-Controlled Wallet on the [Arc.network](https://arc.network) blockchain.

---

## 🧠 Concept

The oracle doesn't react impulsively to market hype. Instead, it convenes a **council of three independent AI personas**, each with a different analytical lens, and only authorizes a trade if **all three criteria** are met:

| Criterion | Threshold |
|-----------|-----------|
| Average confidence across all three perspectives | **> 80%** |
| All three perspectives must unanimously agree | **Required** |
| Consensus action must not be HOLD | **Required** |

This prevents false positives from one overly-enthusiastic model and forces genuine convergence before capital is deployed.

---

## 🏗️ Architecture

```
Social Signal (e.g., Crypto Twitter post)
        │
        ▼
┌───────────────────────────────────────────────────────┐
│                  AgoraOracle.deliberate()              │
│                                                        │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│   │  🔴 Skeptic  │  │ 🟢 Opportunist│  │🔵 Strategist│  │
│   │              │  │              │  │            │  │
│   │ Challenges   │  │ Finds alpha  │  │ Designs    │  │
│   │ the signal.  │  │ & upside.    │  │ execution. │  │
│   │ Asks: Is     │  │ Asks: What's │  │ Asks: How  │  │
│   │ this a pump? │  │ the EV?      │  │ do we act? │  │
│   └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
│          │                 │                 │         │
│          └─────────────────┼─────────────────┘         │
│                            ▼                           │
│                   Consensus Engine                     │
│              (avg confidence + unanimity)              │
└───────────────────────────┬───────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
         shouldExecute                shouldExecute
           = true                       = false
              │                           │
              ▼                           ▼
   Circle Developer-Controlled       🛑 Trade Rejected
   Wallet → Arc.network Trade        Rationale Saved
```

All three perspectives are fired **in parallel** using `Promise.all()` with Gemini Flash for sub-20-second deliberation times.

---

## 🔬 The Three Perspectives

### 🔴 The Skeptic
A veteran market analyst who has survived three crypto winters. Ruthlessly challenges every signal — hunting for bot patterns, manufactured hype, coordinated posting, pump-and-dump setups, and macro conditions that contradict the signal. Protects capital above all else.

### 🟢 The Opportunist
A high-frequency quant trader who lives for alpha. Focuses on maximum profit potential: ideal entry points, expected move in percentage terms, Kelly Criterion position sizing, and asymmetric risk/reward ratios.

### 🔵 The Strategist
A risk-adjusted execution specialist for Arc.network. Designs the concrete execution plan: limit vs. market order, DCA approach, stop-loss/take-profit levels, MEV risk given Arc's sub-second settlement, and optimal USYC yield allocation vs. active trading.

---

## 💳 Wallet Infrastructure — Circle Developer-Controlled Wallets

The oracle uses **Circle's Developer-Controlled Wallets SDK** to manage a non-custodial wallet on **Arc Testnet**. Key design decisions:

- **USDC as native gas**: Arc.network uses USDC as the native gas token, so all transaction costs are stable and predictable — no ETH volatility in execution costs.
- **Sub-second settlement**: Dramatically reduces MEV (front-running / sandwich attack) risk for large market orders.
- **Developer-controlled**: The server holds the entity secret, meaning trades can be triggered programmatically without a human signing each transaction.

### Wallet Setup Flow

```
gen-secret.ts          → Generate a new 32-byte entity secret
register-secret.ts     → Encrypt & register the secret with Circle's API
                         (returns a recovery file — save this!)
test-wallet.ts         → Full end-to-end wallet test:
                           1. Verify API connection (getPublicKey)
                           2. List/create wallet sets
                           3. List/create ARC-TESTNET wallets
                           4. Check token balances
                           5. Request testnet USDC from faucet
```

---

## 📁 Project Structure

```
agora/
├── src/
│   └── logic/
│       └── deliberator.ts        # Core AgoraOracle class — all deliberation logic
│
├── gen-secret.ts                 # Utility: generate a new Circle entity secret
├── register-secret.ts            # Utility: register entity secret ciphertext with Circle
├── test-wallet.ts                # End-to-end wallet integration test (ARC-TESTNET)
├── test-deliberator.ts           # End-to-end deliberation test with sample signals
│
├── output/
│   └── trade_rationale.md        # Auto-generated markdown rationale from last deliberation
│
├── recovery_file.dat             # ⚠️ Circle wallet recovery file (keep this safe!)
├── .env                          # API keys (never commit this)
└── package.json
```

---

## ⚙️ Setup

### Prerequisites
- Node.js 20+
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- A [Circle Developer Console](https://console.circle.com) account with a Developer-Controlled Wallets project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
CIRCLE_API_KEY=TEST_API_KEY:your_circle_api_key_here
CIRCLE_ENTITY_SECRET=your_entity_secret_here
```

### 3. Generate & register entity secret (first-time only)

```bash
# Generate a new entity secret
npx tsx gen-secret.ts

# Register it with Circle (saves recovery_file.dat — keep this safe!)
npx tsx register-secret.ts
```

> ⚠️ **The `recovery_file.dat` is your only way to recover the wallet if the entity secret is lost. Back it up securely.**

---

## 🚀 Running the Agent

### Test wallet connectivity

Verifies the Circle API connection, wallet set creation, ARC-TESTNET wallet creation, and testnet USDC faucet request.

```bash
npx tsx test-wallet.ts
```

### Run a deliberation

Feeds a sample social signal through the full Aristotelian Deliberation and saves the rationale to `output/trade_rationale.md`.

```bash
npx tsx test-deliberator.ts
```

**Example output:**

```
╔══════════════════════════════════════════════╗
║     THE ORACLE OF AGORA — DELIBERATION TEST  ║
╚══════════════════════════════════════════════╝

🧠 ══════════════════════════════════════════
   ARISTOTELIAN DELIBERATION
   2026-05-13T00:31:25.000Z
══════════════════════════════════════════════
📡 Signal: "🚀🚀🚀 BREAKING: Major institutional player just bridged $50M USDC..."

🔴 THE SKEPTIC       Confidence: 10.0%   → HOLD
🟢 THE OPPORTUNIST   Confidence: 85.0%   → BUY
🔵 THE STRATEGIST    Confidence: 90.0%   → BUY

⚖️  VERDICT
   Consensus Confidence: 61.7%
   Consensus Action:     BUY
   All Agree:            ❌ No
   Execute Trade:        🛑 NO — Threshold not met
   Deliberation Time:    18399ms
```

In this real test run, the Skeptic dissented (HOLD vs. BUY), and the average confidence of 61.7% fell below the 80% threshold — the trade was correctly rejected despite two of three perspectives being bullish.

---

## 📊 Sample Deliberation Output

The oracle generates a full markdown rationale document for every deliberation. See [`output/trade_rationale.md`](output/trade_rationale.md) for a real example from a live test run.

The decision table in every rationale shows exactly why a trade was approved or rejected:

| Criterion | Value | Threshold | Pass |
|-----------|-------|-----------|------|
| Avg Confidence | 61.7% | > 80% | ❌ |
| Unanimous Agreement | No | Required | ❌ |
| Action ≠ HOLD | Yes | Required | ✅ |

---

## 🔑 Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Gemini Flash** for all three perspectives | Speed — parallel calls complete in ~18s vs. minutes with heavier models |
| **Structured output (`responseSchema`)** | Forces valid `{ analysis, confidence, recommendation }` JSON from Gemini — no prompt-engineering fragility |
| **`Promise.all()` parallelism** | All three perspectives fire simultaneously, minimizing latency |
| **80% confidence + unanimity threshold** | Prevents single over-confident model from triggering a trade; requires genuine consensus |
| **Circle Developer-Controlled Wallets** | Server-side signing — no human in the loop for execution once deliberation passes |
| **ARC-TESTNET** | Safe testing environment before mainnet deployment; USDC native gas means no ETH management |

---

## 🗺️ Roadmap

- [x] Aristotelian Deliberation engine (`AgoraOracle` class)
- [x] Three AI personas: Skeptic, Opportunist, Strategist
- [x] Structured output via Gemini `responseSchema`
- [x] Parallel perspective generation with `Promise.all()`
- [x] Markdown rationale artifact generation
- [x] Circle Developer-Controlled Wallets SDK integration
- [x] ARC-TESTNET wallet creation & USDC faucet
- [x] Entity secret generation & registration flow
- [ ] Live social signal ingestion (Crypto Twitter / X API)
- [ ] Actual trade execution via Circle Wallet when `shouldExecute = true`
- [ ] Multi-signal aggregation (run deliberation across N signals, weight by source credibility)
- [ ] Mainnet deployment on Arc.network
- [ ] Web dashboard for monitoring deliberations and trade history

---

## ⚠️ Security Notes

- **Never commit `.env`** — it contains your Circle API key and entity secret.
- **Back up `recovery_file.dat`** — this is the only way to recover your Circle wallet if the entity secret is lost.
- The agent is currently operating on **ARC-TESTNET** only. No real funds are at risk during development.

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@circle-fin/developer-controlled-wallets` | ^10.3.1 | Circle wallet SDK for programmatic wallet management |
| `@google/genai` | ^2.2.0 | Google Gemini AI SDK for deliberation |
| `dotenv` | ^17.4.2 | Environment variable loading |
| `tsx` | ^4.21.0 | TypeScript execution (dev) |

---

*Built on [Arc.network](https://arc.network) — where USDC is native gas and settlement is sub-second.*
