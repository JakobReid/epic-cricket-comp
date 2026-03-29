import { ChevronRight, Zap, X } from "lucide-react";
import { useTheme } from "../../ThemeContext";

export const SetupNav = ({ isAdvanced, isFirst, isLast, stepIdx, steps, onStart, onCancel, setActiveSection }: any) => {
  const t = useTheme();
  return (
  <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
    {isAdvanced ? (
      <>
        <button onClick={() => setActiveSection("config")} style={{
          background: t.card, border: `${t.borderWidth}px solid ${t.border}`,
          borderRadius: t.radiusLg, padding: "16px 20px",
          fontFamily: t.fontSans, fontSize: 14, fontWeight: 700,
          color: t.textDim, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Back
        </button>
        <button onClick={() => setActiveSection("teams")} style={{
          flex: 1,
          background: t.primary + "10",
          border: `${t.borderWidth}px solid ${t.primary}`,
          borderRadius: t.radiusLg, padding: "16px 24px",
          color: t.primary,
          fontFamily: t.fontSans, fontSize: 16, fontWeight: 800,
          cursor: "pointer", letterSpacing: 0.5,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          Next <ChevronRight size={16} />
        </button>
      </>
    ) : (
      <>
        {isFirst ? (
          <button onClick={onCancel} style={{
            background: t.card, border: `${t.borderWidth}px solid ${t.border}`,
            borderRadius: t.radiusLg, padding: "16px 20px",
            fontFamily: t.fontSans, fontSize: 14, fontWeight: 700,
            color: t.textDim, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            }}>
            <X size={16} /> Cancel
          </button>
        ) : (
          <button onClick={() => setActiveSection(steps[stepIdx - 1])} style={{
            background: t.card, border: `${t.borderWidth}px solid ${t.border}`,
            borderRadius: t.radiusLg, padding: "16px 20px",
            fontFamily: t.fontSans, fontSize: 14, fontWeight: 700,
            color: t.textDim, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            }}>
            <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Back
          </button>
        )}
        <button onClick={isLast ? onStart : () => setActiveSection(steps[stepIdx + 1])} style={{
          flex: 1,
          background: isLast ? t.primary : t.primary + "10",
          border: isLast ? "none" : `${t.borderWidth}px solid ${t.primary}`,
          borderRadius: t.radiusLg, padding: "16px 24px",
          color: isLast ? "#fff" : t.primary,
          fontFamily: t.fontSans, fontSize: 16, fontWeight: 800,
          cursor: "pointer", letterSpacing: 0.5,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {isLast ? <><Zap size={18} /> Start Match</> : <>Next <ChevronRight size={16} /></>}
        </button>
      </>
    )}
  </div>
  );
};
