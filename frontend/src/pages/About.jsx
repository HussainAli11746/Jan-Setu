import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Brain, Mic, FileText, CheckCircle } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-6 overflow-y-auto h-full pb-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-accent mb-4">{t('app.title')}</h1>
        <p className="text-xl text-gray-600">{t('app.tagline')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 mb-8 border-t-4 border-primary">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Mission</h2>
        <p className="text-gray-600 mb-4">
          JanSetu AI bridges the gap between Indian citizens and government welfare schemes. 
          By leveraging voice-first interactions in regional languages, we make it effortless for anyone, 
          regardless of literacy level, to discover and apply for schemes they are eligible for.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-secondary">
            <Shield className="w-6 h-6 mr-2" />
            Privacy Promise
          </h3>
          <p className="text-gray-600">
            0% document retention. Your documents are fetched directly from DigiLocker, 
            processed strictly in-memory to autofill forms, and immediately discarded. 
            We never store your sensitive personal documents on our servers.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-accent">
            <Brain className="w-6 h-6 mr-2" />
            Smart Matching
          </h3>
          <p className="text-gray-600">
            Our AI engine analyzes your conversation to extract key eligibility criteria like 
            occupation, income, and demographics, matching you with the perfect schemes.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">How It Works</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Mic, label: t('step.1') },
            { icon: Brain, label: t('step.2') },
            { icon: Shield, label: t('step.3') },
            { icon: FileText, label: t('step.4') },
            { icon: CheckCircle, label: t('step.5') },
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 text-primary rounded-full flex items-center justify-center mb-3">
                <step.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-700">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        <p>Built by Team IntelliJ-Idea</p>
        <p>Prasunethon 2.0 Hackathon</p>
      </div>
    </div>
  );
};

export default About;
