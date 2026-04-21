import { useEffect } from "react";

interface ToastProps {
  readonly message: string;
  readonly isVisible: boolean;
  readonly onClose: () => void;
}

export const Toaster = () => {
  return null;
};

export const Toast = ({ message, isVisible, onClose }: ToastProps) => {
  const isHidden = !isVisible;

  useEffect(() => {
    if (isHidden) {
      return;
    }

    const timer = setTimeout(onClose, 3000);

    return () => clearTimeout(timer);
  }, [isHidden, onClose]);

  if (isHidden) {
    return null;
  }

  return (
    <div className="fixed bottom-xl right-xl rounded-md bg-foreground px-xl py-lg text-menu text-background shadow-lg">
      {message}
    </div>
  );
};
