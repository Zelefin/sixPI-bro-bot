import React, { createContext, useContext, useState, useEffect } from "react";
import { useMiniApp } from "@telegram-apps/sdk-react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const miniApp = useMiniApp();
  const [theme, setTheme] = useState<Theme>(miniApp.isDark ? "dark" : "light");

  useEffect(() => {
    setTheme(miniApp.isDark ? "dark" : "light");
  }, [miniApp.isDark]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
