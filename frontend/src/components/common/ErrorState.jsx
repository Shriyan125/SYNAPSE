import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button.jsx';

export function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data. Please check your network connection and try again.',
  onRetry,
  className,
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 ${className || ''}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-900 dark:text-rose-200 mb-1">
        {title}
      </h3>
      <p className="text-sm text-rose-700/80 dark:text-rose-300/80 max-w-sm mb-4">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
