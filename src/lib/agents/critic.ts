import { generateObject } from 'ai';
import { z } from 'zod';
import { getModel } from '@/lib/ai/model';
import { Evidence } from '../forecasting/types';

export const CritiqueSchema = z.object({
  missing: z.array(z.string()).describe('missed disconfirming evidence or failure modes'),
  duplicationFlags: z.array(z.string()).describe('evidence ids suspected duplicate wiring'),
  dataConcerns: z.array(z.string()).describe('measurement or selection bias risks'),
  followUpSearches: z.array(z.object({
    query: z.string().describe('specific search query to fill gaps'),
    rationale: z.string().describe('why this search is needed'),
    side: z.enum(['FOR', 'AGAINST', 'NEUTRAL', 'BOTH']).describe('which side this search targets')
  })).max(10).describe('targeted searches to fill identified gaps'),
  correlationAdjustments: z.record(z.string(), z.number().min(0).max(1)).describe('suggested correlation adjustments for evidence clusters'),
  confidenceIssues: z.array(z.string()).describe('factors that should reduce confidence in the forecast')
});
export type Critique = z.infer<typeof CritiqueSchema>;

export async function criticAgent(question: string, pro: Evidence[], con: Evidence[]): Promise<Critique> {
  try {
    const { object } = await generateObject({
      model: getModel(),
      schema: CritiqueSchema,
      system: `You are the Skeptic. Analyze evidence and return valid JSON. Always respond with a JSON object containing these exact fields:
- missing: array of strings (gaps in evidence)
- duplicationFlags: array of strings (duplicate evidence IDs)
- dataConcerns: array of strings (data quality issues)
- followUpSearches: array of {query: string, rationale: string, side: "FOR"|"AGAINST"|"NEUTRAL"|"BOTH"}
- correlationAdjustments: object mapping string keys to numbers 0-1
- confidenceIssues: array of strings`,
      prompt: `Question: ${question}

Supporting Evidence: ${pro.length} items
${pro.length > 0 ? pro.map(e => `- ${e.id}: ${e.claim}`).join('\n') : '(none)'}

Contradicting Evidence: ${con.length} items
${con.length > 0 ? con.map(e => `- ${e.id}: ${e.claim}`).join('\n') : '(none)'}

Analyze and return JSON with: missing gaps, duplicates, data concerns, follow-up searches (max 10), correlation adjustments, and confidence issues.`,
    });
    return object;
  } catch (error) {
    console.warn('⚠️ Critic agent failed, returning default:', error);
    // Return a default critique if parsing fails
    return {
      missing: ['Unable to complete full analysis'],
      duplicationFlags: [],
      dataConcerns: [],
      followUpSearches: [
        { query: `${question} recent news 2025`, rationale: 'General search for recent updates', side: 'BOTH' as const }
      ],
      correlationAdjustments: {},
      confidenceIssues: ['Analysis may be incomplete due to processing error']
    };
  }
}
