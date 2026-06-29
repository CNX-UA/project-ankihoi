import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};
