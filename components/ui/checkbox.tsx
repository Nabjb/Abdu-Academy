'use client';

import * as React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({ className, checked, onCheckedChange, ...props }: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className || ''}`}
      {...props}
    />
  );
}
