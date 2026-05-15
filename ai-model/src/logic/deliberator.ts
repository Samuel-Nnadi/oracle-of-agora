import { GoogleGenAI, Type } from '@google/genai';

// ── Types ───────────────────────────────────────────────

export interface Perspective {
  role: 'Skeptic' | 'Opportunist' | 'Strategist';
  analysis: string;
  confidence: number;     // 0.0 – 1.0
  recommendation: 'BUY' | 'SELL' | 'HOLD';
}

export interface DeliberationResult {
  signal: string;
  perspectives: Perspective[];
  consensusConfidence: number;
  consensusAction: 'BUY' | 'SELL' | 'HOLD' | 'NO_CONSENSUS';
  shouldExecute: boolean;
  rationale: string;
  timestamp: string;
}

// ── Prompts ─────────────────────────────────────────────

const PERSPECTIVE_PROMPTS: Record<Perspective['role'], string> = {
  Skeptic: `You are The Skeptic — a veteran market analyst who has survived three crypto winters.
Your job is to ruthlessly challenge this social signal. Ask:
- Is this signal organic or manufactured? Look for bot patterns, coordinated posting, paid promotion.
- What is the source's track record? Have they been right before, or do they pump and dump?
- What macro conditions contradict this signal? Interest rates, regulatory news, on-chain data.
- What is the most likely "rug" scenario if someone acts on this signal?

Be brutally honest. Your job is to protect capital, not make friends.`,

  Opportunist: `You are The Opportunist — a high-frequency quant trader who lives for alpha.
Your job is to find the maximum profit potential in this social signal. Analyze:
- What is the ideal entry point if this signal is real?
- What tokens/pairs on Arc.network would benefit most?
- What is the expected move in percentage terms? Time horizon?
- What is the risk/reward ratio? Is the asymmetry favorable?
- How much of the portfolio should be deployed (Kelly Criterion thinking)?

Think in terms of expected value, not certainty.`,

  Strategist: `You are The Strategist — a risk-adjusted execution specialist on Arc.network.
Your job is to design the optimal execution path if the team decides to act. Consider:
- Arc.network's sub-second settlement: how does this affect slippage and MEV risk?
- USDC is native gas on Arc — what does this mean for our execution cost model?
- Should we use a limit order, market order, or DCA approach?
- What is the stop-loss level? What is the take-profit target?
- If we deploy, what percentage should stay in USYC for yield vs. active trading?

Output a concrete execution plan, not vague advice.`,
};

// ── Schema for structured output ────────────────────────

const perspectiveSchema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.STRING,
      description: 'Detailed analysis from this perspective (2-4 paragraphs)',
    },
    confidence: {
      type: Type.NUMBER,
      description: 'Confidence that the signal warrants action, from 0.0 (no confidence) to 1.0 (absolute certainty)',
    },
    recommendation: {
      type: Type.STRING,
      description: 'Recommended action: BUY, SELL, or HOLD',
      enum: ['BUY', 'SELL', 'HOLD'],
    },
  },
  required: ['analysis', 'confidence', 'recommendation'],
};

// ── AgoraOracle Class ───────────────────────────────────

export class AgoraOracle {
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.0-flash') {
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  /**
   * Generate a single perspective on a social signal.
   */
  private async generatePerspective(
    role: Perspective['role'],
    signal: string,
  ): Promise<Perspective> {
    const systemPrompt = PERSPECTIVE_PROMPTS[role];
    const jsonInstruction = `\n\nYou MUST respond with ONLY a valid JSON object (no markdown fences, no extra text) in this exact format:
{"analysis": "your detailed analysis here", "confidence": 0.0, "recommendation": "BUY"}
Where confidence is a number from 0.0 to 1.0 and recommendation is one of: BUY, SELL, HOLD.`;

    const userPrompt = `Analyze the following social signal detected from a high-signal crypto source:\n\n---\n${signal}\n---\n\nProvide your ${role} perspective. Be specific to Arc.network and the USDC-native ecosystem.`;

    const isGemini = this.model.startsWith('gemini-');

    let response;
    if (isGemini) {
      // Gemini supports structured output via responseSchema
      response = await this.ai.models.generateContent({
        model: this.model,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: perspectiveSchema,
        },
      });
    } else {
      // Gemma/other models: instruct JSON in prompt, parse from text
      response = await this.ai.models.generateContent({
        model: this.model,
        contents: systemPrompt + jsonInstruction + '\n\n' + userPrompt,
      });
    }

    const rawText = response.text || '';
    // Extract JSON from response (handles markdown fences and extra text)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Failed to extract JSON from ${role} response: ${rawText.slice(0, 200)}`);
    }
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      role,
      analysis: parsed.analysis || 'No analysis provided',
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
      recommendation: ['BUY', 'SELL', 'HOLD'].includes(parsed.recommendation) ? parsed.recommendation : 'HOLD',
    };
  }

  /**
   * Run the full Aristotelian Deliberation:
   *   1. Fire all three perspectives in parallel (Gemini Flash = speed)
   *   2. Calculate consensus
   *   3. Determine if execution threshold (0.8) is met
   */
  async deliberate(signal: string): Promise<DeliberationResult> {
    const timestamp = new Date().toISOString();
    console.log(`\n🧠 ══════════════════════════════════════════`);
    console.log(`   ARISTOTELIAN DELIBERATION`);
    console.log(`   ${timestamp}`);
    console.log(`══════════════════════════════════════════════`);
    console.log(`📡 Signal: "${signal.slice(0, 100)}${signal.length > 100 ? '...' : ''}"\n`);

    // Fire all three perspectives in parallel for speed
    const startTime = Date.now();
    const [skeptic, opportunist, strategist] = await Promise.all([
      this.generatePerspective('Skeptic', signal),
      this.generatePerspective('Opportunist', signal),
      this.generatePerspective('Strategist', signal),
    ]);
    const elapsed = Date.now() - startTime;

    const perspectives = [skeptic, opportunist, strategist];

    // ── Print perspectives ──
    for (const p of perspectives) {
      const emoji = p.role === 'Skeptic' ? '🔴' : p.role === 'Opportunist' ? '🟢' : '🔵';
      console.log(`${emoji} THE ${p.role.toUpperCase()}`);
      console.log(`   Confidence: ${(p.confidence * 100).toFixed(1)}%`);
      console.log(`   Recommendation: ${p.recommendation}`);
      console.log(`   Analysis: ${p.analysis.slice(0, 200)}...`);
      console.log();
    }

    // ── Calculate consensus ──
    const avgConfidence = perspectives.reduce((sum, p) => sum + p.confidence, 0) / 3;
    const recommendations = perspectives.map(p => p.recommendation);
    const allAgree = recommendations.every(r => r === recommendations[0]);
    const majorityAction = this.getMajority(recommendations);

    const consensusAction = allAgree ? recommendations[0] : majorityAction;
    const shouldExecute = avgConfidence > 0.8 && allAgree && consensusAction !== 'HOLD';

    // ── Build rationale ──
    const rationale = this.buildRationale(
      signal, perspectives, avgConfidence, consensusAction, shouldExecute, elapsed,
    );

    // ── Print verdict ──
    console.log(`⚖️  ══════════════════════════════════════════`);
    console.log(`   VERDICT`);
    console.log(`══════════════════════════════════════════════`);
    console.log(`   Consensus Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`   Consensus Action:     ${consensusAction}`);
    console.log(`   All Agree:            ${allAgree ? '✅ Yes' : '❌ No'}`);
    console.log(`   Execute Trade:        ${shouldExecute ? '🚀 YES — CALLING CIRCLE WALLET' : '🛑 NO — Threshold not met'}`);
    console.log(`   Deliberation Time:    ${elapsed}ms`);
    console.log(`══════════════════════════════════════════════\n`);

    return {
      signal,
      perspectives,
      consensusConfidence: avgConfidence,
      consensusAction: allAgree ? consensusAction : 'NO_CONSENSUS',
      shouldExecute,
      rationale,
      timestamp,
    };
  }

  /**
   * Get the majority recommendation from three perspectives.
   */
  private getMajority(recs: string[]): 'BUY' | 'SELL' | 'HOLD' {
    const counts: Record<string, number> = {};
    for (const r of recs) {
      counts[r] = (counts[r] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0][0] as 'BUY' | 'SELL' | 'HOLD';
  }

  /**
   * Build a markdown rationale document.
   */
  private buildRationale(
    signal: string,
    perspectives: Perspective[],
    avgConfidence: number,
    action: string,
    shouldExecute: boolean,
    elapsedMs: number,
  ): string {
    const lines: string[] = [
      `# Trade Rationale — Oracle of Agora`,
      ``,
      `**Generated:** ${new Date().toISOString()}`,
      `**Deliberation Time:** ${elapsedMs}ms`,
      `**Consensus Confidence:** ${(avgConfidence * 100).toFixed(1)}%`,
      `**Action:** ${action}`,
      `**Execute:** ${shouldExecute ? '✅ YES' : '🛑 NO'}`,
      ``,
      `## Signal`,
      ``,
      `> ${signal}`,
      ``,
      `## Perspectives`,
      ``,
    ];

    for (const p of perspectives) {
      const emoji = p.role === 'Skeptic' ? '🔴' : p.role === 'Opportunist' ? '🟢' : '🔵';
      lines.push(`### ${emoji} The ${p.role}`);
      lines.push(``);
      lines.push(`- **Confidence:** ${(p.confidence * 100).toFixed(1)}%`);
      lines.push(`- **Recommendation:** ${p.recommendation}`);
      lines.push(``);
      lines.push(p.analysis);
      lines.push(``);
    }

    lines.push(`## Decision Logic`);
    lines.push(``);
    lines.push(`| Criterion | Value | Threshold | Pass |`);
    lines.push(`|-----------|-------|-----------|------|`);
    lines.push(`| Avg Confidence | ${(avgConfidence * 100).toFixed(1)}% | > 80% | ${avgConfidence > 0.8 ? '✅' : '❌'} |`);
    lines.push(`| Unanimous Agreement | ${perspectives.every(p => p.recommendation === perspectives[0].recommendation) ? 'Yes' : 'No'} | Required | ${perspectives.every(p => p.recommendation === perspectives[0].recommendation) ? '✅' : '❌'} |`);
    lines.push(`| Action ≠ HOLD | ${action !== 'HOLD' ? 'Yes' : 'No'} | Required | ${action !== 'HOLD' ? '✅' : '❌'} |`);
    lines.push(``);
    lines.push(`> **All three criteria must pass for the Oracle to execute a trade via the Circle Wallet.**`);

    return lines.join('\n');
  }
}
