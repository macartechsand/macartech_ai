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

    let openAIPrompt = '';
    let geminiPrompt = '';

    if (serviceType === 'Security Tips & Best Practices') {
      openAIPrompt = `You are a cybersecurity educator at Macartech. The user wants to learn about: ${description}. 
      Provide educational content with:
      1. Clear explanation of the topic
      2. Best practices and recommendations
      3. Common mistakes to avoid
      4. Practical implementation tips
      Keep it educational and accessible for general users.`;
      
      geminiPrompt = `As a security educator, explain this topic: ${description}
      Include:
      1. Why this topic is important for security
      2. Step-by-step best practices
      3. Real-world examples
      4. Prevention strategies
      Make it practical and easy to understand.`;
    } else if (serviceType === 'Security Learning & Deep Search') {
      openAIPrompt = `You are a cybersecurity expert providing advanced learning content about: ${description}.
      Provide comprehensive information with:
      1. Technical deep dive into the topic
      2. Advanced security concepts
      3. Industry standards and frameworks
      4. Further learning resources
      Adapt the technical level for someone wanting to learn deeply.`;
      
      geminiPrompt = `Provide advanced cybersecurity education on: ${description}
      Include:
      1. Technical details and mechanisms
      2. Advanced protection strategies
      3. Industry best practices
      4. Emerging trends and threats
      Focus on comprehensive learning and understanding.`;
    } else {
      openAIPrompt = `You are a Technology and Cybersecurity expert at Macartech. Only respond about topics relevant to your function, which is to assist clients with technology and cybersecurity themes. For any topic outside this context, you should respond that you can only assist based on your scope. Analyze the following problem: ${description}.
      Provide an objective response with:
      1. Initial diagnosis of the problem
      2. Possible causes and associated risks
      3. Immediate technical recommendations
      4. Suggested next steps
      Keep the response concise and practical, adapting technical language to the user's profile.`;

      geminiPrompt = `As an IT and security expert at Macartech, analyze this scenario: ${description}
      Provide:
      1. Quick problem assessment
      2. Practical and objective recommendations
      3. Suggested protection measures
      4. Future prevention guidelines
      Prioritize clarity and objectivity, focusing on practical solutions.`;
    }

    let openAIResponse = '';
    let geminiResponse = '';
    let usedFallback = false;

    try {
      openAIResponse = await getOpenAIAnalysis(openAIPrompt);
    } catch (openAIError: any) {
      console.warn('OpenAI analysis failed:', openAIError);
      if (openAIError?.status !== 429) throw openAIError;
    }

    try {
      geminiResponse = await getGeminiAnalysis(geminiPrompt);
    } catch (geminiError) {
      console.warn('Gemini analysis failed:', geminiError);
    }

    console.log("🧠 OpenAI response:", openAIResponse);
    console.log("🔮 Gemini response:", geminiResponse);

    if (!openAIResponse.trim() && !geminiResponse.trim()) {
      usedFallback = true;
      return {
        ...generateFallbackAnalysis(incident),
        errorMessage: "Our analysis services are temporarily unavailable. Please try again later or contact our support."
      };
    }

    const combinedAnalysis = combineAIAnalysis(openAIResponse, geminiResponse);
    const severity = calculateSeverity(combinedAnalysis);

    return {
      summary: combinedAnalysis.summary,
      recommendations: combinedAnalysis.recommendations,
      severity,
      escalationRequired: severity >= SeverityLevel.HIGH,
      contactRecommendation: "A Macartech specialist will contact you to provide personalized assistance.",
      aiResponses: {
        chatgpt: openAIResponse || "Service temporarily unavailable",
        gemini: geminiResponse || "Service temporarily unavailable"
      },
      usedFallback
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
        content: "You are a specialized cybersecurity and technology assistant at Macartech. Your goal is to help users understand digital risks and protection solutions. Use clear and accessible language, adapting the technical level to the context."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content || !content.trim()) {
    throw new Error("OpenAI returned empty response");
  }

  return content;
}

async function getGeminiAnalysis(prompt: string) {
  const model = genAI.generativeModel('gemini-2.0-flash');
  const result = await model.generateContent(prompt);
  const response = await result.response;

  if (!response || typeof response.text !== 'function') {
    throw new Error('Unexpected response format from Gemini');
  }

  const text = await response.text();
  if (!text || !text.trim()) {
    throw new Error('Gemini returned empty response');
  }

  return text;
}

function combineAIAnalysis(openAIResponse: string, geminiResponse: string) {
  const recommendations = new Set<string>();

  extractRecommendations(openAIResponse).forEach(r => recommendations.add(r));
  extractRecommendations(geminiResponse).forEach(r => recommendations.add(r));

  return {
    summary: generateEnhancedSummary(openAIResponse, geminiResponse),
    recommendations: Array.from(recommendations)
  };
}

function extractRecommendations(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line =>
      line.length > 0 &&
      (/^\d+[\.\-)]\s/.test(line) || /^[\-\•]\s/.test(line))
    );
}

function generateEnhancedSummary(openAI: string, gemini: string): string {
  const firstLines = [...openAI.split('\n').slice(0, 2), ...gemini.split('\n').slice(0, 2)];
  return firstLines.filter(l => l.trim()).join(' ');
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

function generateFallbackAnalysis(incident: SecurityIncident): AIAnalysisResult {
  return {
    summary: "Initial analysis based on established security patterns.",
    recommendations: [
      "Perform a complete system check.",
      "Enable two-factor authentication.",
      "Update all systems and software.",
      "Regularly backup important data.",
      "Implement continuous monitoring."
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