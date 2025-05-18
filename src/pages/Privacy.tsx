import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Privacy = () => {
  const { language } = useLanguage();
  
  const content = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: March 2024",
      sections: [
        {
          title: "Information Collection",
          text: "We collect information that you provide directly to us, including name, email, and contact details when you use our services."
        },
        {
          title: "Data Usage",
          text: "We use collected information to provide and improve our services, communicate with you, and ensure security."
        },
        {
          title: "Data Protection",
          text: "We implement appropriate security measures to protect your personal information against unauthorized access or disclosure."
        }
      ]
    },
    pt: {
      title: "Política de Privacidade",
      lastUpdated: "Última atualização: Março 2024",
      sections: [
        {
          title: "Coleta de Informações",
          text: "Coletamos informações que você fornece diretamente, incluindo nome, email e detalhes de contato ao usar nossos serviços."
        },
        {
          title: "Uso dos Dados",
          text: "Usamos as informações coletadas para fornecer e melhorar nossos serviços, comunicar com você e garantir segurança."
        },
        {
          title: "Proteção de Dados",
          text: "Implementamos medidas de segurança apropriadas para proteger suas informações pessoais contra acesso ou divulgação não autorizada."
        }
      ]
    }
  };

  const currentContent = content[language as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {currentContent.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {currentContent.lastUpdated}
          </p>
          {currentContent.sections.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                {section.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {section.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Privacy;