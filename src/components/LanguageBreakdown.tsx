import React from 'react';
import { LanguageItem } from '../types';
import { getLanguageColor } from '../services/githubApi';

interface LanguageBreakdownProps {
  languages?: LanguageItem[];
  primaryLanguage?: string | null;
  mode?: 'compact' | 'card' | 'full';
  className?: string;
}

export const LanguageBreakdown: React.FC<LanguageBreakdownProps> = ({
  languages = [],
  primaryLanguage,
  mode = 'compact',
  className = '',
}) => {
  // If no detailed languages array, but primaryLanguage exists, fallback to single language
  const rawItems =
    languages && languages.length > 0
      ? languages
      : primaryLanguage
      ? [
          {
            name: primaryLanguage,
            percentage: 100,
            color: getLanguageColor(primaryLanguage),
            bytes: 1,
          },
        ]
      : [];

  // Guarantee that every language consistently receives its standard GitHub Linguist color
  const items = rawItems.map((lang) => ({
    ...lang,
    color: getLanguageColor(lang.name),
  }));

  if (items.length === 0) {
    return (
      <span className="text-[11px] text-[#8b949e] font-mono italic">
        No language detected
      </span>
    );
  }

  // 1. Compact Mode (Optimized for Table View column)
  if (mode === 'compact') {
    const visibleItems = items.slice(0, 3);
    const remainingCount = items.length - visibleItems.length;

    return (
      <div
        className={`space-y-1.5 min-w-[130px] max-w-[230px] ${className}`}
        title={items.map((l) => `${l.name}: ${l.percentage}%`).join(' · ')}
      >
        {/* Segmented multi-color progress bar */}
        <div className="h-2 w-full rounded-full flex overflow-hidden bg-gh-border-muted/70 p-[0.5px]">
          {items.map((lang) => (
            <div
              key={lang.name}
              style={{
                width: `${Math.max(lang.percentage, 2)}%`,
                backgroundColor: lang.color,
              }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
              title={`${lang.name}: ${lang.percentage}%`}
            />
          ))}
        </div>

        {/* Top language indicators with colored dots */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] font-mono leading-tight">
          {visibleItems.map((lang) => (
            <span key={lang.name} className="inline-flex items-center space-x-1 whitespace-nowrap">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: lang.color }}
              />
              <span className="font-semibold text-gh-fg-default">{lang.name}</span>
              <span className="text-[#8b949e]">{lang.percentage}%</span>
            </span>
          ))}
          {remainingCount > 0 && (
            <span
              className="text-[9px] text-[#8b949e] font-semibold cursor-help"
              title={items.slice(3).map((l) => `${l.name}: ${l.percentage}%`).join(', ')}
            >
              +{remainingCount}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 2. Card / Full Mode (Matches GitHub's sidebar breakdown)
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-gh-fg-default">
        <span>Languages</span>
        <span className="text-[10px] text-[#8b949e] font-mono font-normal">
          {items.length} {items.length === 1 ? 'language' : 'languages'}
        </span>
      </div>

      {/* Segmented multi-color progress bar */}
      <div className="h-2.5 w-full rounded-full flex overflow-hidden bg-gh-border-muted p-[0.5px]">
        {items.map((lang) => (
          <div
            key={lang.name}
            style={{
              width: `${Math.max(lang.percentage, 2)}%`,
              backgroundColor: lang.color,
            }}
            className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
            title={`${lang.name}: ${lang.percentage}%`}
          />
        ))}
      </div>

      {/* Language details grid matching GitHub exact design */}
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs font-mono pt-0.5">
        {items.map((lang) => (
          <div key={lang.name} className="inline-flex items-center space-x-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
              style={{ backgroundColor: lang.color }}
            />
            <span className="font-bold text-gh-fg-default text-[11px]">{lang.name}</span>
            <span className="text-[#8b949e] text-[11px] font-medium">{lang.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
