import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  useEffect(() => {
    if (!visible && message) {
      // Wait for animation to finish before calling onClose
      const timeout = setTimeout(onClose, 300); // match animation duration
      return () => clearTimeout(timeout);
    }
  }, [visible, message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-red-600 text-white px-4 py-2 rounded shadow-lg transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      {message}
    </div>
  );
};

export default Toast;
