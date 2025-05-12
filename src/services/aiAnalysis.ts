import { SecurityIncident, AIAnalysisResult, SeverityLevel } from '../types';
import OpenAI from 'openai';
import GoogleGenAI from '@google/genai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeSecurityIncident = async (incident: SecurityIncident): Promise<AIAnalysisResult> => {
  try {
    const description = incident.description;

    const openAIPrompt = `Você é um especialista de Tecnologia e cibersegurança da Macartech. Analise o seguinte problema: ${description}.
    Forneça uma resposta objetiva com:
    1. Diagnóstico inicial do problema
    2. Possíveis causas e riscos associados
    3. Recomendações técnicas imediatas
    4. Próximos passos sugeridos
    Mantenha a resposta concisa e prática, adaptando a linguagem técnica ao perfil do usuário.`;

    const geminiPrompt = `Como especialista em TI e segurança da Macartech, analise este cenário: ${description}
    Forneça:
    1. Avaliação rápida do problema
    2. Recomendações práticas e objetivas
    3. Medidas de proteção sugeridas
    4. Orientações para prevenção futura
    Priorize clareza e objetividade, mantendo foco em soluções práticas.`;

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

    // Logs de depuração
    console.log("🧠 OpenAI response:", openAIResponse);
    console.log("🔮 Gemini response:", geminiResponse);

    // Se nenhuma IA respondeu, retorna fallback
    if (!openAIResponse.trim() && !geminiResponse.trim()) {
      usedFallback = true;
      return {
        ...generateFallbackAnalysis(incident),
        errorMessage: "Nossos serviços de análise estão temporariamente indisponíveis. Por favor, tente novamente mais tarde ou entre em contato com nosso suporte."
      };
    }

    const combinedAnalysis = combineAIAnalysis(openAIResponse, geminiResponse);
    const severity = calculateSeverity(combinedAnalysis);

    return {
      summary: combinedAnalysis.summary,
      recommendations: combinedAnalysis.recommendations,
      severity,
      escalationRequired: severity >= SeverityLevel.HIGH,
      contactRecommendation: "Um especialista da Macartech entrará em contato para fornecer assistência personalizada.",
      aiResponses: {
        chatgpt: openAIResponse || "Serviço temporariamente indisponível",
        gemini: geminiResponse || "Serviço temporariamente indisponível"
      },
      usedFallback
    };
  } catch (error: any) {
    console.error('Erro na análise com IA:', error);
    return {
      ...generateFallbackAnalysis(incident),
      errorMessage: "Ocorreu um erro durante a análise. Nossa equipe foi notificada e está trabalhando para resolver o problema."
    };
  }
};

async function getOpenAIAnalysis(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Você é um assistente especializado em cibersegurança e tecnologia da Macartech. Seu objetivo é ajudar usuários a entenderem riscos digitais e soluções de proteção. Use linguagem clara e acessível, adaptando o nível técnico ao contexto."
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
    throw new Error("OpenAI retornou resposta vazia");
  }

  return content;
}

async function getGeminiAnalysis(prompt: string) {
  const model = genAI.generativeModel('gemini-2.0-flash');
  const result = await model.generateContent(prompt);
  const response = await result.response;

  if (!response || typeof response.text !== 'function') {
    throw new Error('Formato inesperado de resposta da Gemini');
  }

  const text = await response.text();
  if (!text || !text.trim()) {
    throw new Error('Gemini retornou resposta vazia');
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
    critical: ['crítico', 'urgente', 'grave', 'comprometido', 'invasão'],
    high: ['alto', 'importante', 'risco elevado'],
    medium: ['médio', 'moderado', 'atenção'],
    low: ['baixo', 'menor', 'preventivo']
  };

  const fullText = (analysis.summary + ' ' + analysis.recommendations.join(' ')).toLowerCase();

  if (indicators.critical.some(i => fullText.includes(i))) return SeverityLevel.CRITICAL;
  if (indicators.high.some(i => fullText.includes(i))) return SeverityLevel.HIGH;
  if (indicators.medium.some(i => fullText.includes(i))) return SeverityLevel.MEDIUM;
  return SeverityLevel.LOW;
}

function generateFallbackAnalysis(incident: SecurityIncident): AIAnalysisResult {
  return {
    summary: "Análise inicial baseada em padrões de segurança estabelecidos.",
    recommendations: [
      "Realize uma verificação completa do sistema.",
      "Ative autenticação de dois fatores.",
      "Atualize todos os sistemas e softwares.",
      "Faça backup regular dos dados importantes.",
      "Implemente monitoramento contínuo."
    ],
    severity: SeverityLevel.MEDIUM,
    escalationRequired: true,
    contactRecommendation: "Um especialista da Macartech entrará em contato para fornecer assistência personalizada.",
    aiResponses: {
      chatgpt: "Serviço temporariamente indisponível",
      gemini: "Serviço temporariamente indisponível"
    }
  };
}
