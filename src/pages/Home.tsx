import React, { useState } from 'react';
import IncidentForm from '../components/IncidentForm';
import AnalysisResult from '../components/AnalysisResult';
import { SecurityIncident, AIAnalysisResult } from '../types';
import { analyzeSecurityIncident } from '../services/aiAnalysis';
import { Shield, Lock, AlertCircle } from 'lucide-react';

const Home: React.FC = () => {
  const [incident, setIncident] = useState<SecurityIncident | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleSubmitIncident = async (newIncident: SecurityIncident) => {
    setIncident(newIncident);
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeSecurityIncident(newIncident);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing incident:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setIncident(null);
    setAnalysis(null);
  };

  return (
    <main className="flex-grow pt-24 pb-16">
      <div className="container mx-auto px-4">
        <section className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            AI-Powered Security Assistance
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Report potential security incidents and receive immediate AI analysis and expert recommendations.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Advanced Threat Analysis</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <Lock className="h-5 w-5" />
              <span className="font-medium">Expert Security Recommendations</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Incident Response Support</span>
            </div>
          </div>
        </section>
        
        <section className="max-w-4xl mx-auto">
          {isAnalyzing ? (
            <div className="w-full flex flex-col items-center justify-center py-16">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900 animate-pulse-slow"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 dark:border-blue-400 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                <Shield className="absolute inset-0 m-auto h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Analyzing Security Incident</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Our AI is analyzing your report and preparing recommendations...
              </p>
            </div>
          ) : incident && analysis ? (
            <AnalysisResult 
              incident={incident} 
              analysis={analysis} 
              onReset={handleReset} 
            />
          ) : (
            <IncidentForm onSubmit={handleSubmitIncident} />
          )}
        </section>
      </div>
    </main>
  );
};

export default Home;