
import React from 'react';

interface InputGroupProps {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  suffix?: string;
  className?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  suffix,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value === 0 && type === 'number' ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-lg font-medium focus:border-[#00AEEF] focus:ring-0 outline-none transition-colors"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};
