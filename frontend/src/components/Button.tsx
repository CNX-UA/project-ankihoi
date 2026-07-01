import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
};
