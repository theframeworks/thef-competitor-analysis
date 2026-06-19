import { useEffect } from 'react';

interface ToastProps {
  text: string;
  onDismiss: () => void;
}

export function Toast({ text, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [text, onDismiss]);

  return <div className="toast">{text}</div>;
}
