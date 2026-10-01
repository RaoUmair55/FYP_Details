import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ 
  formula, 
  displayMode = true,
  className = ''
}) => {
  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
        strict: false
      });
    } catch (err) {
      console.warn('KaTeX rendering error for formula:', formula, err);
      return `<span class="text-xs font-mono text-neutral-400">${formula}</span>`;
    }
  }, [formula, displayMode]);

  return (
    <div
      className={`overflow-x-auto py-1 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
