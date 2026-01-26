import { SecurityIncident, AIAnalysisResult, SeverityLevel } from '../types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const analyzeSecurityIncident = async (incident: SecurityIncident): Promise<AIAnalysisResult> => {
  try {
    // Validate API key
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return generateFallbackAnalysis(incident);
    }

    const description = incident.description;
    const serviceType = incident.serviceType;

    const isSupport = serviceType === 'Technical Support';

    const prompt = isSupport
      ? `You are a technical support assistant. The user reported this issue: "${description}". Provide 3 simple, actionable solutions in a numbered list.`
      : `You are a cybersecurity assistant. Analyze this security incident: "${description}". Provide 3 immediate containment and mitigation steps in a numbered list.`;

    console.log('Sending request to OpenAI with prompt:', prompt);
    const aiResponse = await getOpenAIAnalysis(prompt);
    console.log('OpenAI response received:', aiResponse);

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
    console.error('Error in AI analysis:', error.message || error);
    return {
      ...generateFallbackAnalysis(incident),
      aiResponses: {
        chatgpt: `Error: ${error.message || 'AI service temporarily unavailable'}`,
        gemini: ""
      }
    };
  }
};

async function getOpenAIAnalysis(prompt: string) {
  try {
    console.log('Making OpenAI API call...');
    
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

    console.log('OpenAI API response:', completion);

    const content = completion.choices?.[0]?.message?.content;
    if (!content || !content.trim()) {
      throw new Error("OpenAI returned empty response");
    }

    return content;
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    if (error.status === 401) {
      throw new Error("Invalid API key - please check your OpenAI API key");
    } else if (error.status === 429) {
      throw new Error("Rate limit exceeded - please try again later");
    } else if (error.status === 500) {
      throw new Error("OpenAI service error - please try again later");
    }
    throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
  }
  finally {
    // Explicit finally block to satisfy esbuild parser
  }
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
  const recommendations = text
    .split('\n')
    .map(line => line.trim())
    .filter(line =>
      line.length > 0 &&
      (/^\d+[\.\-)]\s/.test(line) || /^[\-\•]\s/.test(line))
    )
    .map(line => line.replace(/^\d+[\.\-\)]\s*/, '').replace(/^[\-\•]\s*/, ''))
    .slice(0, 3);

  // If no numbered recommendations found, split by sentences and take first 3
  if (recommendations.length === 0) {
    return text
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10)
      .slice(0, 3);
  }

  return recommendations;
}

function generateFallbackAnalysis(incident: SecurityIncident): AIAnalysisResult {
  const isSupport = incident.serviceType === 'Technical Support';
  
  return {
    summary: isSupport 
      ? "Technical support analysis - basic troubleshooting steps provided."
      : "Security incident analysis - basic security measures recommended.",
    recommendations: isSupport ? [
      "Restart the affected system or application",
      "Check for recent software updates or changes",
      "Verify network connectivity and settings"
    ] : [
      "Disconnect affected systems from network if compromised",
      "Change all relevant passwords immediately",
      "Run a full system security scan"
    ],
    severity: SeverityLevel.MEDIUM,
    escalationRequired: true,
    contactRecommendation: "A Macartech specialist will contact you to provide personalized assistance.",
    aiResponses: {
      chatgpt: "AI analysis service is temporarily unavailable. Basic recommendations provided based on incident type.",
      gemini: "Service temporarily unavailable"
    }
  };
}