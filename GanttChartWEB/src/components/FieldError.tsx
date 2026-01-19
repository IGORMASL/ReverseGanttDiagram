import { useEffect } from "react";

type FieldErrorProps = {
  message: string;
  visible: boolean;
  onHide?: () => void;
};

export default function FieldError({ message, visible, onHide }: FieldErrorProps) {
  useEffect(() => {
    if (visible && onHide) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000); // Скрываем через 3 секунды
      
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible || !message) return null;

  return (
    <div className="text-red-500 text-sm mt-1 animate-fade-in">
      {message}
    </div>
  );
}
