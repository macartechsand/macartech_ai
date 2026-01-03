import React, { useState } from 'react';
import { IncidentType, SeverityLevel, IncidentStatus, ContactMethod, SecurityIncident, ClientType, ServiceType } from '../types';
import { Shield, AlertTriangle, CheckCircle, Send, UserCircle as LoaderCircle } from 'lucide-react';

interface IncidentFormProps {
  onSubmit: (incident: SecurityIncident) => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [incident, setIncident] = useState<SecurityIncident>({
    type: IncidentType.SUSPICIOUS_ACTIVITY,
    description: '',
    severity: SeverityLevel.MEDIUM,
    status: IncidentStatus.SUBMITTED,
    contactMethod: ContactMethod.WHATSAPP,
    contactDetails: '',
    clientType: ClientType.INDIVIDUAL,
    serviceType: ServiceType.SUPPORT
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIncident(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      onSubmit(incident);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-8 h-8 text-blue-700 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Macartech Virtual Assistant</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                Are you requesting support as an Individual or as a Company?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(ClientType).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setIncident(prev => ({ ...prev, clientType: type }));
                      handleNext();
                    }}
                    className="p-4 border-2 rounded-lg text-left hover:border-blue-500 transition-all duration-200"
                  >
                    <span className="block font-medium text-slate-800 dark:text-white mb-2">{type}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {type === ClientType.INDIVIDUAL 
                        ? "Personalized support for your individual needs"
                        : "Corporate solutions to protect your business"
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                What type of service do you need?
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.values(ServiceType).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setIncident(prev => ({ ...prev, serviceType: type }));
                      handleNext();
                    }}
                    className="p-4 border-2 rounded-lg text-left hover:border-blue-500 transition-all duration-200"
                  >
                    <span className="block font-medium text-slate-800 dark:text-white mb-2">{type}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {type === ServiceType.SUPPORT 
                        ? "Get help with technical problems and system issues"
                        : type === ServiceType.INCIDENT
                        ? "Report and get assistance with security incidents"
                        : type === ServiceType.TIPS
                        ? "Learn security best practices and prevention tips"
                        : "Deep dive into security topics and advanced learning"
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {incident.serviceType === ServiceType.SUPPORT 
                    ? "Describe your technical issue"
                    : incident.serviceType === ServiceType.INCIDENT
                    ? "Describe the security incident"
                    : incident.serviceType === ServiceType.TIPS
                    ? "What security topic would you like to learn about?"
                    : "What security topic do you want to explore in depth?"
                  }
                </label>
                <textarea
                  name="description"
                  value={incident.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder={incident.serviceType === ServiceType.TIPS || incident.serviceType === ServiceType.LEARNING 
                    ? "e.g., password security, phishing protection, network security..."
                    : "Please provide details to assist you better..."
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white transition-all duration-200 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Contact Method
                </label>
                <div className="flex space-x-4">
                  {Object.values(ContactMethod).map((method) => (
                    <label key={method} className="flex items-center">
                      <input
                        type="radio"
                        name="contactMethod"
                        value={method}
                        checked={incident.contactMethod === method}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-all duration-200"
                      />
                      <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {incident.contactMethod === ContactMethod.WHATSAPP ? "WhatsApp Number" : "Telegram Username"}
                </label>
                <input
                  type="text"
                  name="contactDetails"
                  value={incident.contactDetails}
                  onChange={handleChange}
                  placeholder={incident.contactMethod === ContactMethod.WHATSAPP ? "e.g., 5593984668494" : "@your_username"}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white transition-all duration-200"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-white font-medium transition-all duration-300 ${
                    isSubmitting 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default IncidentForm;
