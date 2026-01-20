// AI-powered analysis for TikTok Shop Manager
import OpenAI from 'openai';
import { TrackedProduct, TrendingItem } from './storage';

let openaiClient: OpenAI | null = null;

export function initializeOpenAI(apiKey: string): void {
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

export interface PriceRecommendation {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  strategy: string;
}

export interface ProductAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  competitorInsights: string;
  suggestedImprovements: string[];
}

export interface TrendAnalysis {
  isViable: boolean;
  marketSize: string;
  growthPotential: string;
  competitionLevel: string;
  recommendations: string[];
  riskFactors: string[];
}

export async function analyzePricing(
  product: TrackedProduct,
  competitorPrices: number[],
  category: string
): Promise<PriceRecommendation> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please set your API key.');
  }

  const avgCompetitorPrice = competitorPrices.length > 0
    ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
    : product.price;

  const prompt = `You are a TikTok Shop pricing expert. Analyze this product and provide pricing recommendations.

Product: ${product.name}
Current Price: $${product.price}
Category: ${category}
Sales: ${product.sales} units
Rating: ${product.rating}/5 (${product.reviews} reviews)
Competitor Prices: ${competitorPrices.length > 0 ? competitorPrices.map(p => `$${p}`).join(', ') : 'No data'}
Average Competitor Price: $${avgCompetitorPrice.toFixed(2)}

Consider:
1. TikTok Shop's younger demographic (Gen Z/Millennial)
2. Impulse buying behavior on social commerce
3. Price sensitivity on the platform
4. Review/rating impact on conversion

Respond in this exact JSON format:
{
  "recommendedPrice": <number>,
  "minPrice": <number>,
  "maxPrice": <number>,
  "confidence": "<low|medium|high>",
  "reasoning": "<brief explanation>",
  "strategy": "<pricing strategy recommendation>"
}`;

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  return JSON.parse(jsonMatch[0]) as PriceRecommendation;
}

export async function analyzeProduct(
  product: TrackedProduct,
  competitorProducts: TrackedProduct[]
): Promise<ProductAnalysis> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please set your API key.');
  }

  const competitorSummary = competitorProducts.slice(0, 5).map(p =>
    `- ${p.name}: $${p.price}, ${p.sales} sales, ${p.rating}/5 rating`
  ).join('\n');

  const prompt = `You are a TikTok Shop product analyst. Analyze this product against competitors.

Your Product:
- Name: ${product.name}
- Price: $${product.price}
- Sales: ${product.sales}
- Rating: ${product.rating}/5 (${product.reviews} reviews)
- Category: ${product.category}

Top Competitors:
${competitorSummary || 'No competitor data available'}

Provide a SWOT-style analysis focused on TikTok Shop success factors:
- Video content potential
- Trend alignment
- Price competitiveness
- Review/social proof

Respond in this exact JSON format:
{
  "strengths": ["<strength1>", "<strength2>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "opportunities": ["<opportunity1>", "<opportunity2>"],
  "competitorInsights": "<key insight about competition>",
  "suggestedImprovements": ["<improvement1>", "<improvement2>"]
}`;

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 600,
  });

  const content = response.choices[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  return JSON.parse(jsonMatch[0]) as ProductAnalysis;
}

export async function analyzeTrend(
  keyword: string,
  existingTrends: TrendingItem[]
): Promise<TrendAnalysis> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please set your API key.');
  }

  const relatedTrends = existingTrends
    .filter(t => t.keyword.toLowerCase().includes(keyword.toLowerCase()) ||
                 keyword.toLowerCase().includes(t.keyword.toLowerCase()))
    .slice(0, 3)
    .map(t => `- ${t.keyword}: ${t.growth}% growth, ${t.competition} competition`)
    .join('\n');

  const prompt = `You are a TikTok Shop trend analyst. Evaluate this product/keyword trend for selling potential.

Keyword/Product: ${keyword}

Related Trends:
${relatedTrends || 'No related trend data'}

Consider TikTok-specific factors:
1. Viral potential and content creation ease
2. Gen Z/Millennial appeal
3. Seasonal relevance
4. Competition from established sellers
5. Shipping/fulfillment complexity

Respond in this exact JSON format:
{
  "isViable": <true|false>,
  "marketSize": "<small|medium|large>",
  "growthPotential": "<description>",
  "competitionLevel": "<low|medium|high>",
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"],
  "riskFactors": ["<risk1>", "<risk2>"]
}`;

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  return JSON.parse(jsonMatch[0]) as TrendAnalysis;
}

export async function generateProductDescription(
  productName: string,
  features: string[],
  targetAudience: string
): Promise<string> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please set your API key.');
  }

  const prompt = `Write a compelling TikTok Shop product description that converts.

Product: ${productName}
Key Features: ${features.join(', ')}
Target Audience: ${targetAudience}

Requirements:
- Max 500 characters
- Use emojis sparingly but effectively
- Include call-to-action
- Highlight key benefits over features
- Sound authentic, not salesy
- Appeal to TikTok's young demographic

Respond with ONLY the description text, no JSON.`;

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content || '';
}

export async function suggestHashtags(
  productName: string,
  category: string
): Promise<string[]> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please set your API key.');
  }

  const prompt = `Generate 10 effective TikTok hashtags for this product.

Product: ${productName}
Category: ${category}

Requirements:
- Mix of broad reach and niche hashtags
- Include TikTok Shop specific tags
- Consider trending formats (#TikTokMadeMeBuyIt, etc.)
- No hashtag should exceed 30 characters

Respond with a JSON array of hashtags (including the # symbol):
["#hashtag1", "#hashtag2", ...]`;

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 200,
  });

  const content = response.choices[0]?.message?.content || '';
  const jsonMatch = content.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    return ['#TikTokShop', '#TikTokMadeMeBuyIt', '#ShopTikTok'];
  }

  return JSON.parse(jsonMatch[0]) as string[];
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    await client.models.list();
    return true;
  } catch {
    return false;
  }
}
