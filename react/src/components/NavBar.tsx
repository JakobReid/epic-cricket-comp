import type { ReactNode } from "react";
import { useTheme } from "../ThemeContext";
import fieldLineal from "../assets/criquet-icons/field-lineal.png";

interface NavBarProps {
  onHome: () => void;
  children?: ReactNode;
}

export const EccBrand = ({ onHome, color }: { onHome: () => void; color?: string }) => {
  const t = useTheme();
  const c = color ?? t.text;
  const isLight = color === "#fff" || color === "rgba(255,255,255,0.9)";
  return (
    <button
      onClick={onHome}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0,
      }}
    >
      <div style={{
        width: 30, height: 30,
        borderRadius: t.radius,
        background: isLight ? "rgba(255,255,255,0.15)" : `${t.primary}12`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img
          src={fieldLineal}
          style={{
            width: 16, height: 16,
            filter: isLight ? "brightness(0) invert(1)" : "none",
            opacity: 0.85,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: t.fontDisplay,
          fontSize: 15,
          fontWeight: 700,
          color: c,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        ECC
      </span>
    </button>
  );
};

export const NavBar = ({ onHome, children }: NavBarProps) => {
  const t = useTheme();

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
      <div
        style={{
          background: t.card,
          padding: "8px 10px",
          minHeight: 65,
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
        }}
      >
        <EccBrand onHome={onHome} />

        {children && (
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
