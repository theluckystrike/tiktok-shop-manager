import React, { useState } from 'react';
import { updateSettings } from '../lib/storage';
import { validateApiKey, initializeOpenAI } from '../lib/ai';

interface Props {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  async function handleComplete() {
    if (apiKey) {
      if (!apiKey.startsWith('sk-')) {
        setError('Invalid API key format');
        return;
      }

      setValidating(true);
      setError('');

      const isValid = await validateApiKey(apiKey);
      setValidating(false);

      if (!isValid) {
        setError('Invalid API key. Please check and try again.');
        return;
      }

      initializeOpenAI(apiKey);
      await updateSettings({ apiKey, onboardingComplete: true });
    } else {
      await updateSettings({ onboardingComplete: true });
    }

    onComplete();
  }

  function handleSkip() {
    updateSettings({ onboardingComplete: true });
    onComplete();
  }

  const steps = [
    {
      icon: '🚀',
      title: 'Welcome to TikTok Shop Manager',
      description: 'Your AI-powered toolkit for dominating TikTok Shop sales. Track products, spy on competitors, and optimize pricing.',
    },
    {
      icon: '📊',
      title: 'Track & Analyze',
      description: 'Monitor your products and competitors in real-time. Get alerts on price changes, track sales trends, and discover winning products.',
    },
    {
      icon: '🔑',
      title: 'Connect AI (Optional)',
      description: 'Add your OpenAI API key to unlock AI-powered pricing recommendations, trend analysis, and product optimization.',
    },
  ];

  return (
    <div className="min-h-[500px] bg-gradient-to-br from-black to-[#161823] text-white p-6 flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === step ? 'w-6 bg-[#FE2C55]' : i < step ? 'bg-[#25F4EE]' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-6">{steps[step].icon}</div>
        <h2 className="text-xl font-bold mb-3 tiktok-gradient">{steps[step].title}</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-xs">{steps[step].description}</p>

        {step === 2 && (
          <div className="w-full max-w-xs space-y-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#FE2C55] focus:outline-none"
            />
            {error && <p className="text-[#FE2C55] text-xs">{error}</p>}
            <p className="text-xs text-gray-500">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25F4EE] hover:underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {step < 2 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="w-full py-3 btn-tiktok rounded-lg text-white font-semibold"
          >
            Continue
          </button>
        ) : (
          <>
            <button
              onClick={handleComplete}
              disabled={validating}
              className="w-full py-3 btn-tiktok rounded-lg text-white font-semibold disabled:opacity-50"
            >
              {validating ? 'Verifying...' : apiKey ? 'Connect & Start' : 'Start Without AI'}
            </button>
            {!apiKey && (
              <button
                onClick={handleSkip}
                className="w-full py-2 text-gray-400 text-sm hover:text-white"
              >
                Skip for now
              </button>
            )}
          </>
        )}

        {step > 0 && step < 2 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full py-2 text-gray-400 text-sm hover:text-white"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
