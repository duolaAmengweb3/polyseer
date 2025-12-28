import { generateObject } from 'ai';
import { z } from 'zod';
import { getModelSmall } from '@/lib/ai/model';

const DriversSchema = z.object({
  drivers: z.array(z.string()).min(3).max(5).describe('可能影响结果的关键因素（3-8个简洁因素，用中文）'),
  reasoning: z.string().describe('选择这些驱动因素的简要说明')
});

interface MarketData {
  market_facts: {
    question: string;
    volume?: number;
    liquidity?: number;
  };
  market_state_now: Array<{
    outcome?: string;
    mid?: number | null;
  }>;
}

export async function generateDrivers(marketData: MarketData): Promise<string[]> {
  try {
    const result = await generateObject({
      model: getModelSmall(),
      schema: DriversSchema,
      system: '你是一位专业分析师。识别最可能影响这个预测市场结果的关键因素。请用中文回答，并返回有效的 JSON。',
      prompt: `分析这个预测市场并识别 3-5 个可能影响结果的关键驱动因素：

问题: ${marketData.market_facts.question}
当前市场价格: ${marketData.market_state_now[0]?.mid ? (marketData.market_state_now[0].mid * 100).toFixed(1) + '%' : '无'}
交易量: $${marketData.market_facts.volume?.toLocaleString() || '无'}
流动性: $${marketData.market_facts.liquidity?.toLocaleString() || '无'}

请考虑以下因素：
- 经济指标
- 政治发展
- 技术进步
- 监管变化
- 社会趋势
- 历史先例
- 市场情绪驱动因素

请用中文返回最可能影响这个市场的重要因素。`,
    });

    console.log(`🎯 Auto-generated drivers: ${result.object.drivers.join(', ')}`);
    console.log(`📝 Reasoning: ${result.object.reasoning}`);
    
    return result.object.drivers;
  } catch (error) {
    console.error('Error generating drivers:', error);
    // Fallback to generic drivers based on question analysis
    return generateFallbackDrivers(marketData.market_facts.question);
  }
}

export function generateFallbackDrivers(question: string): string[] {
  const questionLower = question.toLowerCase();

  if (questionLower.includes('election') || questionLower.includes('political') || questionLower.includes('选举') || questionLower.includes('政治')) {
    return ['民调数据', '经济状况', '竞选活动', '投票率'];
  } else if (questionLower.includes('bitcoin') || questionLower.includes('crypto') || questionLower.includes('比特币') || questionLower.includes('加密')) {
    return ['监管环境', '机构采用', '市场情绪', '技术发展'];
  } else if (questionLower.includes('ai') || questionLower.includes('technology') || questionLower.includes('人工智能') || questionLower.includes('技术')) {
    return ['研究突破', '算力扩展', '监管框架', '投资资金'];
  } else if (questionLower.includes('climate') || questionLower.includes('environment') || questionLower.includes('气候') || questionLower.includes('环境')) {
    return ['政策变化', '技术采用', '经济激励', '国际合作'];
  } else {
    return ['市场状况', '监管环境', '公众情绪', '经济因素'];
  }
}
