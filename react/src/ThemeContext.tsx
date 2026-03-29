import { createContext, useContext, type ReactNode } from "react";

export type Theme = {
  id: string;
  bg: string;
  card: string;
  cardAlt: string;
  border: string;
  text: string;
  textDim: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDim: string;
  secondary: string;
  secondaryLight: string;
  secondaryDim: string;
  danger: string;
  dangerDim: string;
  default: string;
  font: string;
  fontSans: string;
  radius: number;
  radiusLg: number;
  btnHeight: number;
  btnRadius: number;
  headingWeight: number;
  cardPadding: number;
  borderWidth: number;
  headerBg: string;
  headerText: string;
  headerTextDim: string;
  transition: string;
};

const FONTS = {
  font: `'Source Code Pro', 'Menlo', monospace`,
  fontSans: `'Source Sans 3', 'Helvetica Neue', sans-serif`,
};

const LAYOUT = {
  radius: 8,
  radiusLg: 14,
  btnHeight: 54,
  btnRadius: 10,
  headingWeight: 700,
  cardPadding: 16,
  borderWidth: 2,
};

// Epic Cricket Comp — broadcast light theme
export const THEME: Theme = {
  id: "epic-cricket-comp",
  bg: "#fffdf5",
  card: "#ffffff",
  cardAlt: "#f7f5ec",
  border: "#c4d4ae",
  text: "#1a1c0e",
  textDim: "#3e4e28",
  textMuted: "#6e7e58",
  primary: "#1e7230",
  primaryLight: "#cce8d4",
  primaryDim: "#165c24",
  secondary: "#c41820",
  secondaryLight: "#fcd4d6",
  secondaryDim: "#a41018",
  danger: "#c43030",
  dangerDim: "#a82020",
  default: "#2d3320",
  headerBg: "#1e7230",
  headerText: "#ffffff",
  headerTextDim: "rgba(255,255,255,0.65)",
  transition: "all 0.18s ease",
  ...FONTS,
  ...LAYOUT,
};

const ThemeContext = createContext<Theme>(THEME);

export const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <ThemeContext.Provider value={THEME}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
