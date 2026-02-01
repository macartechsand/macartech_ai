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
      console.warn('OpenAI API key is missing - using fallback analysis');
      return generateFallbackAnalysis(incident);
    }

    // Validate API key format
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey.startsWith('sk-')) {
      console.warn('OpenAI API key appears to be invalid format - using fallback analysis');
      return generateFallbackAnalysis(incident);
    }

    const description = incident.description;
    const serviceType = incident.serviceType;

    const isSupport = serviceType === 'Technical Support';

    const prompt = isSupport
      ? `You are a technical support assistant. The user reported this issue: "${description}". Provide 3 simple, actionable solutions in a numbered list.`
      : `You are a cybersecurity assistant. Analyze this security incident: "${description}". Provide 3 immediate containment and mitigation steps in a numbered list.`;

    console.log('Attempting OpenAI API request...');
    const aiResponse = await getOpenAIAnalysis(prompt);
    console.log('OpenAI API request successful');

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
    console.warn('OpenAI API unavailable, using fallback analysis:', error.message || error);
    return {
      ...generateFallbackAnalysis(incident),
      aiResponses: {
        chatgpt: generateFallbackResponse(incident),
        gemini: ""
      }
    };
  }
};

async function getOpenAIAnalysis(prompt: string) {
  try {
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
      max_tokens: 300,
      timeout: 10000 // 10 second timeout
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content || !content.trim()) {
      throw new Error("OpenAI returned empty response");
    }

    return content;
  } catch (error: any) {
    // Handle specific error types without throwing
    if (error.status === 401) {
      throw new Error("Invalid API key");
    } else if (error.status === 429) {
      throw new Error("Rate limit exceeded");
    } else if (error.status === 500) {
      throw new Error("OpenAI service error");
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message?.includes('Connection error')) {
      throw new Error("Network connection error");
    } else {
      throw new Error("API service unavailable");
    }
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
      ? "Technical support analysis completed - troubleshooting steps provided below."
      : "Security incident analysis completed - security measures recommended below.",
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
      chatgpt: generateFallbackResponse(incident),
      gemini: ""
    }
  };
}

function generateFallbackResponse(incident: SecurityIncident): string {
  const isSupport = incident.serviceType === 'Technical Support';
  
  if (isSupport) {
    return `Based on your technical issue: "${incident.description}"

Here are the recommended troubleshooting steps:

1. Restart the affected system or application to clear temporary issues
2. Check for recent software updates or configuration changes that might have caused the problem
3. Verify network connectivity and system settings are properly configured

These steps should help resolve most common technical issues. If the problem persists, our technical team can provide more specific assistance.`;
  } else {
    return `Security incident analysis for: "${incident.description}"

Immediate security recommendations:

1. Disconnect affected systems from the network if you suspect they are compromised
2. Change all relevant passwords immediately, especially for critical accounts
3. Run a comprehensive security scan on all potentially affected systems

These are essential first steps to contain any potential security threat. Our security specialists can provide detailed incident response guidance.`;
  }
}