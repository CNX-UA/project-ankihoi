import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
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
      <textarea id={id} className={`form-textarea ${className}`} {...props} />
    </div>
  );
};
