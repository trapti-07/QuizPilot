import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className={`${sizes[size] || sizes.md} text-indigo-600 animate-spin mb-3`} />
      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );
}
