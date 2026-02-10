import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface FocusableLinkProps extends LinkProps {
  focusKey?: string;
  className?: string;
  onEnter?: () => void;
}

export const FocusableLink: React.FC<FocusableLinkProps> = ({ 
  focusKey, 
  className = '', 
  children, 
  to,
  onClick,
  onEnter,
  ...props 
}) => {
  return (
    <Link
      to={to}
      className={`${className} transition-all duration-200 outline-none`}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
};
