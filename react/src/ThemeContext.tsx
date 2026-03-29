import { createContext, useContext, type ReactNode } from "react";

export type Theme = {
  id: string;
  bg: string;
  bgAlt: string;
  card: string;
  cardAlt: string;
  border: string;
  borderBright: string;
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
  accent: string;
  accentDim: string;
  default: string;
  font: string;
  fontSans: string;
  fontDisplay: string;
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
  font: `'JetBrains Mono', 'Fira Code', 'Source Code Pro', monospace`,
  fontSans: `'Barlow', 'Inter', 'Helvetica Neue', sans-serif`,
  fontDisplay: `'Oswald', 'Barlow Condensed', 'Impact', sans-serif`,
};

const LAYOUT = {
  radius: 4,
  radiusLg: 6,
  btnHeight: 52,
  btnRadius: 4,
  headingWeight: 800,
  cardPadding: 14,
  borderWidth: 1,
};

// ── Broadcast Light — clean, crisp daytime broadcast overlay ──
export const THEME: Theme = {
  id: "broadcast-light",
  bg: "#f0f1f4",
  bgAlt: "#e6e8ed",
  card: "#ffffff",
  cardAlt: "#f5f6f8",
  border: "#d4d8e0",
  borderBright: "#bbc1cc",
  text: "#0e1118",
  textDim: "#4a5060",
  textMuted: "#8890a0",
  // Vivid green — batting, positive actions, boundaries
  primary: "#00a854",
  primaryLight: "rgba(0,168,84,0.10)",
  primaryDim: "#008c46",
  // Hot red — bowling, wickets, dismissals
  secondary: "#e5213a",
  secondaryLight: "rgba(229,33,58,0.10)",
  secondaryDim: "#c41c32",
  danger: "#e5213a",
  dangerDim: "#c41c32",
  // Deep amber — extras, milestones, highlights
  accent: "#e09500",
  accentDim: "#c28200",
  default: "#0e1118",
  headerBg: "#0e1118",
  headerText: "#f0f2f5",
  headerTextDim: "rgba(240,242,245,0.55)",
  transition: "all 0.15s ease",
  ...FONTS,
  ...LAYOUT,
};

const ThemeContext = createContext<Theme>(THEME);

export const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <ThemeContext.Provider value={THEME}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
