import React, { createContext, useContext, useState, useEffect } from 'react';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  en: {
    // Header
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'theme.light': 'Switch to light mode',
    'theme.dark': 'Switch to dark mode',

    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'Complete technology solutions to boost your digital success',
    'services.support.title': 'Technical Support',
    'services.support.description': 'Specialized 24/7 support to solve technical issues and ensure the proper functioning of your systems.',
    'services.consulting.title': 'IT Consulting',
    'services.consulting.description': 'Strategic consulting to optimize your IT processes and implement market best practices.',
    'services.security.title': 'Digital Security',
    'services.security.description': 'Complete protection for your data and systems against digital threats and vulnerabilities.',
    'services.development.title': 'Development',
    'services.development.description': 'Development of customized solutions to meet the specific needs of your business.',

    // Client Types
    'client.individual': 'Individual',
    'client.business': 'Business',

    // Service Types
    'service.support': 'Support / Incident',
    'service.solutions': 'Custom Solutions',
    'service.assessment': 'Security Assessment',

    // Analysis
    'analysis.title': 'AI-Powered Security Analysis',
    'analysis.processing': 'Processing your request...',
    'analysis.recommendations': 'Consolidated Recommendations',
    'analysis.need_help': 'Need specialized help?',
    'analysis.new_analysis': 'New Analysis',

    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'We are ready to help with your technology and digital security needs',
    'contact.form.name': 'Name',
    'contact.form.email': 'Email',
    'contact.form.subject': 'Subject',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send Message',
  },
  pt: {
    // Header
    'nav.home': 'Início',
    'nav.services': 'Serviços',
    'nav.contact': 'Contato',
    'theme.light': 'Mudar para modo claro',
    'theme.dark': 'Mudar para modo escuro',

    // Services
    'services.title': 'Nossos Serviços',
    'services.subtitle': 'Soluções completas em tecnologia para impulsionar seu sucesso digital',
    'services.support.title': 'Suporte Técnico',
    'services.support.description': 'Suporte especializado 24/7 para resolver problemas técnicos e garantir o funcionamento adequado dos seus sistemas.',
    'services.consulting.title': 'Consultoria em TI',
    'services.consulting.description': 'Consultoria estratégica para otimizar seus processos de TI e implementar as melhores práticas do mercado.',
    'services.security.title': 'Segurança Digital',
    'services.security.description': 'Proteção completa para seus dados e sistemas contra ameaças digitais e vulnerabilidades.',
    'services.development.title': 'Desenvolvimento',
    'services.development.description': 'Desenvolvimento de soluções personalizadas para atender às necessidades específicas do seu negócio.',

    // Client Types
    'client.individual': 'Pessoa Física',
    'client.business': 'Empresa',

    // Service Types
    'service.support': 'Suporte / Incidente',
    'service.solutions': 'Soluções Personalizadas',
    'service.assessment': 'Avaliação de Segurança',

    // Analysis
    'analysis.title': 'Análise de Segurança com IA',
    'analysis.processing': 'Processando sua solicitação...',
    'analysis.recommendations': 'Recomendações Consolidadas',
    'analysis.need_help': 'Precisa de ajuda especializada?',
    'analysis.new_analysis': 'Nova Análise',

    // Contact
    'contact.title': 'Entre em Contato',
    'contact.subtitle': 'Estamos prontos para ajudar com suas necessidades em tecnologia e segurança digital',
    'contact.form.name': 'Nome',
    'contact.form.email': 'E-mail',
    'contact.form.subject': 'Assunto',
    'contact.form.message': 'Mensagem',
    'contact.form.submit': 'Enviar Mensagem',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const browserLang = navigator.language.split('-')[0];
    return translations[browserLang as keyof typeof translations] ? browserLang : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language as keyof typeof translations][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};