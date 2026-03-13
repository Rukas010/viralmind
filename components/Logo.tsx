// components/Logo.tsx

import { Eye } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const containerSizes = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${containerSizes[size]} rounded-lg bg-purple-600 flex items-center justify-center`}
      >
        <Eye className={`${iconSizes[size]} text-white`} />
      </div>
      {showText && (
        <span
          className={`${textSizes[size]} font-bold text-zinc-900 dark:text-white tracking-tight`}
        >
          Viral<span className="text-purple-600">Eye</span>
        </span>
      )}
    </div>
  );
}