import React from 'react';

interface FocusableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  focusKey?: string;
  onEnter?: () => void;
  className?: string;
}

export const FocusableButton: React.FC<FocusableButtonProps> = ({ 
  focusKey, 
  onEnter, 
  className = '', 
  children, 
  onClick,
  ...props 
}) => {
  return (
    <button
      className={`${className} transition-all duration-200 outline-none`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
