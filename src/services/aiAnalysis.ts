import { SecurityIncident, AIAnalysisResult, SeverityLevel } from '../types';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeSecurityIncident = async (incident: SecurityIncident): Promise<AIAnalysisResult> => {
  try {
    const description = incident.description;
    const serviceType = incident.serviceType;

    const isSupport = incident.serviceType === 'SUPPORT';

const prompt = isSupport
  ? `You are a technical support assistant. The user reported this issue: ${description}. Provide 3 simple, actionable solutions.`
  : `You are a cybersecurity assistant. Analyze this security incident: ${description}. Provide immediate containment and mitigation steps.`;


    // Use only one AI service to reduce costs
    let aiResponse = '';
    
    try {
      aiResponse = await getOpenAIAnalysis(prompt);
    } catch (error) {
      console.warn('AI analysis failed:', error);
      return generateFallbackAnalysis(incident);
    }

    return {
      summary: aiResponse.split('\n')[0] || "Analysis completed",
      recommendations: extractRecommendations(aiResponse),
      severity: SeverityLevel.MEDIUM,
      escalationRequired: true,
      contactRecommendation: "A Macartech specialist will contact you to provide personalized assistance.",
      aiResponses: {
        chatgpt: aiResponse,
        gemini: ""
      }
    };
  } catch (error: any) {
    console.error('Error in AI analysis:', error);
    return {
      ...generateFallbackAnalysis(incident),
      errorMessage: "An error occurred during analysis. Our team has been notified and is working to resolve the issue."
    };
  }
};

async function getOpenAIAnalysis(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a tech support assistant. Provide clear, simple solutions."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 300
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content || !content.trim()) {
    throw new Error("OpenAI returned empty response");
  }

  return content;
}

function calculateSeverity(analysis: { summary: string; recommendations: string[] }): SeverityLevel {
  const indicators = {
    critical: ['critical', 'urgent', 'severe', 'compromised', 'breach'],
    high: ['high', 'important', 'elevated risk'],
    medium: ['medium', 'moderate', 'attention'],
    low: ['low', 'minor', 'preventive']
  };

  const fullText = (analysis.summary + ' ' + analysis.recommendations.join(' ')).toLowerCase();

  if (indicators.critical.some(i => fullText.includes(i))) return SeverityLevel.CRITICAL;
  if (indicators.high.some(i => fullText.includes(i))) return SeverityLevel.HIGH;
  if (indicators.medium.some(i => fullText.includes(i))) return SeverityLevel.MEDIUM;
  return SeverityLevel.LOW;
}

function extractRecommendations(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line =>
      line.length > 0 &&
      (/^\d+[\.\-)]\s/.test(line) || /^[\-\•]\s/.test(line))
    ).slice(0, 3); // Limit to 3 recommendations
}

function generateFallbackAnalysis(incident: SecurityIncident): AIAnalysisResult {
  return {
    summary: "Initial analysis based on established security patterns.",
    recommendations: [
      "Perform a complete system check.",
      "Enable two-factor authentication.",
      "Update all systems and software.",
      "Contact support for assistance."
    ],
    severity: SeverityLevel.MEDIUM,
    escalationRequired: true,
    contactRecommendation: "A Macartech specialist will contact you to provide personalized assistance.",
    aiResponses: {
      chatgpt: "Service temporarily unavailable",
      gemini: "Service temporarily unavailable"
    }
  };
}