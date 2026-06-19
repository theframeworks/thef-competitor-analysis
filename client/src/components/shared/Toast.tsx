import { useEffect } from "react";

interface ToastProps {
  text: string;
  onDismiss: () => void;
}

export function Toast({ text, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed right-5.5 bottom-5.5 z-50 max-w-80 rounded-lg border border-border-strong bg-bg-raised px-4.5 py-3 text-sm shadow-xl">
      {text}
    </div>
  );
}
