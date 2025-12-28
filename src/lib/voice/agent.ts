import axios from "axios";

export interface OutboundCallOptions {
  toNumber?: string; // optional; defaults to ELEVEN_TO_NUMBER
  reportMarkdown?: string; // optional; falls back to mock report
  marketShortName?: string;
  keyOdds?: string;
  catalyst?: string;
  agentId?: string;
  agentPhoneNumberId?: string;
  apiKey?: string;
}

export function generateMockReport(input?: { marketShortName?: string; keyOdds?: string; catalyst?: string; }): string {
  const now = new Date();
  const ts = now.toLocaleString(undefined, { hour12: false });
  const name = input?.marketShortName ?? 'Talyor swifts wedding';
  const odds = Number(input?.keyOdds ?? '60');
  const catalyst = input?.catalyst ?? 'recent developments and news flow';

  const headlineProb = Math.max(1, Math.min(99, Math.round(odds)));
  const priorProb = Math.max(1, Math.min(99, Math.round(Math.max(5, Math.min(95, headlineProb - 5)))));

  return (`Prediction: NO (10.0%)
Why This Prediction
Base-rate anchored: with p0 = 10.0% and no validated, high-credibility signals provided, the posterior stays near base rate.
Market-aware check: p_aware = 8.0% supports a low-probability view consistent with the 10% estimate.
Evidence gap: No most-influential supporting or contradicting evidence items (IDs not supplied) moved the estimate meaningfully in this cycle.
Key Drivers
Verified health crisis or prolonged unexplained absence of Xi (hospitalization, cancellations, sustained no-shows).
Clear signs of elite fracture within PLA/security organs (rapid, unexplained purges/reshuffles at CMC, theater commands, MSS).
Acute domestic crisis: sharp financial instability or nationwide unrest (property/banking failures, LGFV cascades, RMB devaluation, mass protests).
What Would Change Our Mind
Multi-week disappearance with corroborated hospitalization or emergency medical intervention reported by high-credibility sources (named officials or documents with verifiable provenance).
Rapid, unexplained top-level purges/reshuffles across CMC/MSS/theater commands with credible detentions or investigations confirmed by state notices.
Acute financial shock: systemic LGFV/default cascade, sharp RMB devaluation with capital controls, and large-scale protests documented across multiple provinces.
Emergency Party/plenum activity with unusual state media language, removal/transfer of key titles, or authoritative leaks indicating succession planning.
Caveats & Limitations
Information opacity and censorship in China can delay or suppress signals, reducing timeliness and reliability.
Limited evidence set this cycle (no citable IDs) increases reliance on priors and base rates.
Tail risks (external conflict miscalculation, sanction shocks) are hard to model and could move probabilities abruptly.
Time-bounded forecast: events spilling just outside 2025 are not captured, risking boundary error.`)
}

function deriveMarketNameFromReport(text?: string): string | undefined {
  if (!text) return undefined;
  // Try first markdown heading
  const m = text.match(/^#\s+(.+)$/m);
  if (m && m[1]) return m[1].trim().slice(0, 80);
  return undefined;
}

function deriveOddsFromReport(text?: string): string | undefined {
  if (!text) return undefined;
  const m = text.match(/(\d{1,2})\s*%/);
  if (m && m[1]) return m[1];
  return undefined;
}

export async function runVoiceAgentCall(opts: OutboundCallOptions) {
  const agent_id = opts.agentId || process.env.ELEVEN_AGENT_ID;
  const agent_phone_number_id =
    opts.agentPhoneNumberId || process.env.ELEVEN_TWILIO_NUM_ID;
  const apiKey = opts.apiKey || process.env.ELEVEN_API_KEY;
  const toNumber = opts.toNumber || process.env.ELEVEN_TO_NUMBER;

  if (!agent_id) throw new Error("Missing ELEVEN_AGENT_ID");
  if (!agent_phone_number_id) throw new Error("Missing ELEVEN_TWILIO_NUM_ID");
  if (!apiKey) throw new Error("Missing ELEVEN_API_KEY");
  if (!toNumber) throw new Error("Missing toNumber (provide opts.toNumber or ELEVEN_TO_NUMBER env var)");

  const hasAnyDynamicExtras = Boolean(opts.marketShortName || opts.keyOdds || opts.catalyst);
  const userReport = (opts.reportMarkdown && String(opts.reportMarkdown).trim().length > 0) ? opts.reportMarkdown! : undefined;
  const derivedName = opts.marketShortName || deriveMarketNameFromReport(userReport);
  const derivedOdds = opts.keyOdds || deriveOddsFromReport(userReport);
  const derivedCatalyst = opts.catalyst || 'recent developments and news flow';

  const reportMarkdown = userReport ?? generateMockReport({
    marketShortName: derivedName,
    keyOdds: derivedOdds,
    catalyst: derivedCatalyst,
  });

  const payload = {
    agent_id,
    agent_phone_number_id,
    to_number: toNumber,
    conversation_initiation_client_data: {
      dynamic_variables: (() => {
        // Always include required variables; derive sensible defaults if missing
        const dyn: Record<string, string> = {
          report_md: reportMarkdown,
          market_short_name: derivedName || 'Key Outcome',
          key_odds: (derivedOdds || '60'),
          catalyst: derivedCatalyst,
        };
        return dyn;
      })(),
    },
  };

  const res = await axios.post(
    "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
    payload,
    { headers: { "xi-api-key": apiKey } }
  );

  return res.data;
}

export default runVoiceAgentCall;
