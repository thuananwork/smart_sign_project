// src/components/Toast/Toast.tsx
import React from "react";
import "./Toast.css";

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  React.useEffect(() => {
    const timeout = setTimeout(onClose, 2000);
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="toast">
      {message}
    </div>
  );
};

export default Toast;
