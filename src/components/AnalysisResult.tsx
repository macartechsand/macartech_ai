import React from 'react';
import { AIAnalysisResult, SecurityIncident } from '../types';
import { Shield, ExternalLink, MessageCircle, Bot } from 'lucide-react';

interface AnalysisResultProps {
  incident: SecurityIncident;
  analysis: AIAnalysisResult;
  onReset: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ incident, analysis, onReset }) => {
  const formatMessage = () => {
    const message = `🔒 *Atendimento Macartech - Segurança Digital*

👤 *Tipo de Cliente:* ${incident.clientType}
🎯 *Tipo de Atendimento:* ${incident.serviceType}
📝 *Descrição:* ${incident.description}

✨ *Recomendações Iniciais:*
${analysis.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

🔔 Preciso de suporte especializado para continuar.`;

    return encodeURIComponent(message);
  };

  const whatsappLink = `https://wa.me/5511977288509?text=${formatMessage()}`;
  const telegramLink = `https://t.me/Macartech_bot`;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden animate-fadeIn transition-all duration-300 hover:shadow-lg">
      <div className="p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-8 h-8 text-blue-700 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Análise Automática com IA Macartech</h2>
        </div>
        
        <div className="space-y-6">
          {analysis.aiResponses?.chatgpt && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <Bot className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                <h3 className="font-semibold text-slate-800 dark:text-white">AI Analysis</h3>
              </div>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{analysis.aiResponses.chatgpt}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
              <span role="img" aria-label="sparkles">✨</span> Recommendations
            </h3>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-5 h-5 mt-0.5 mr-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              <span role="img" aria-label="bell">🔔</span> Precisa de ajuda especializada?
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Nossa equipe está pronta para fornecer suporte personalizado através do seu canal preferido:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Telegram</span>
              </a>
            </div>
          </div>
          
          <button
            onClick={onReset}
            className="w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <span role="img" aria-label="refresh">🔄</span> Nova Análise
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;