import React, { createContext, useCallback, useContext, useState, useEffect } from "react";

export type NotificationType = "success" | "error" | "info";

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextValue {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx;
};

const AUTO_HIDE_MS = 5000;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [counter, setCounter] = useState(0);

  const showNotification = useCallback((message: string, type: NotificationType = "info") => {
    setCounter((prev) => prev + 1);
    setNotification({ id: counter + 1, message, type });
  }, [counter]);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, AUTO_HIDE_MS);

    return () => clearTimeout(timer);
  }, [notification]);

  const value: NotificationContextValue = {
    showNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`px-4 py-2 rounded-lg shadow-md text-sm text-white transition-all duration-200
              ${notification.type === "success" ? "bg-green-600" : ""}
              ${notification.type === "error" ? "bg-red-600" : ""}
              ${notification.type === "info" ? "bg-gray-800" : ""}
            `}
          >
            {notification.message}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
