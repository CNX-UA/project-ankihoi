import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  className = "",
  id,
  ...props
}) => {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            color: "#cbd5e0",
          }}
        >
          {label}
        </label>
      )}
      <input id={id} className={`form-input ${className}`} {...props} />
    </div>
  );
};
