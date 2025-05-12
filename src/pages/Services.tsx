import React from 'react';
import { Shield, Server, Lock, Code, Headphones, Users, Wrench, Database } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <Headphones className="w-12 h-12 text-blue-600" />,
      title: "Suporte Técnico",
      description: "Suporte especializado 24/7 para resolver problemas técnicos e garantir o funcionamento adequado dos seus sistemas.",
      features: [
        "Atendimento remoto e presencial",
        "Resolução rápida de problemas",
        "Manutenção preventiva",
        "Monitoramento contínuo"
      ]
    },
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      title: "Consultoria em TI",
      description: "Consultoria estratégica para otimizar seus processos de TI e implementar as melhores práticas do mercado.",
      features: [
        "Análise de infraestrutura",
        "Planejamento estratégico",
        "Gestão de projetos",
        "Otimização de recursos"
      ]
    },
    {
      icon: <Lock className="w-12 h-12 text-blue-600" />,
      title: "Segurança Digital",
      description: "Proteção completa para seus dados e sistemas contra ameaças digitais e vulnerabilidades.",
      features: [
        "Análise de vulnerabilidades",
        "Implementação de firewall",
        "Backup e recuperação",
        "Treinamento em segurança"
      ]
    },
    {
      icon: <Code className="w-12 h-12 text-blue-600" />,
      title: "Desenvolvimento",
      description: "Desenvolvimento de soluções personalizadas para atender às necessidades específicas do seu negócio.",
      features: [
        "Sistemas web e mobile",
        "Integrações de sistemas",
        "Automação de processos",
        "Manutenção evolutiva"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Nossos Serviços
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Soluções completas em tecnologia para impulsionar seu sucesso digital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
              <div className="mb-6">{service.icon}</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {service.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {service.description}
              </p>
              <ul className="space-y-3">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-slate-700 dark:text-slate-300">
                    <Shield className="w-5 h-5 text-blue-600 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            Por que escolher a Macartech?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
              <Server className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Tecnologia Avançada
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Utilizamos as mais recentes tecnologias e ferramentas do mercado
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
              <Wrench className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Suporte Especializado
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Equipe técnica altamente qualificada e sempre disponível
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
              <Database className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Soluções Completas
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Do planejamento à implementação, cuidamos de tudo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;