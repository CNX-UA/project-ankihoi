import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Container: React.FC<ContainerProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`container ${className}`} {...props}>
      {children}
    </div>
  );
};
