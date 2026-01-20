import React from 'react';
import { UsageData } from '../lib/storage';

interface Props {
  usage: UsageData;
}

export function UsageCounter({ usage }: Props) {
  const { analysesUsed, monthlyLimit, isPro } = usage;
  const percentage = (analysesUsed / monthlyLimit) * 100;
  const remaining = monthlyLimit - analysesUsed;

  if (isPro) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#25F4EE]/20 to-[#FE2C55]/20 rounded-full">
        <span className="text-xs">⭐</span>
        <span className="text-xs font-medium text-[#25F4EE]">Pro</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-right">
        <div className="text-xs text-gray-400">
          {remaining} left
        </div>
        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              percentage > 80 ? 'bg-[#FE2C55]' : 'bg-[#25F4EE]'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
