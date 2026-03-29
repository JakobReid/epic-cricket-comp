import { ChevronRight, Zap, X } from "lucide-react";
import { useTheme } from "../../ThemeContext";

export const SetupNav = ({ isAdvanced, isFirst, isLast, stepIdx, steps, onStart, onCancel, setActiveSection }: any) => {
  const t = useTheme();

  const backBtnStyle = {
    background: t.card,
    border: `${t.borderWidth}px solid ${t.borderBright}`,
    borderRadius: t.btnRadius, padding: "16px 20px",
    fontFamily: t.fontSans, fontSize: 14, fontWeight: 700,
    color: t.textDim, cursor: "pointer",
    display: "flex" as const, alignItems: "center" as const, gap: 6,
    transition: t.transition,
  };

  const nextBtnStyle = {
    flex: 1,
    background: t.primaryLight,
    border: `${t.borderWidth}px solid ${t.primary}`,
    borderRadius: t.btnRadius, padding: "16px 24px",
    color: t.primary,
    fontFamily: t.fontDisplay, fontSize: 16, fontWeight: 600,
    cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" as const,
    display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 8,
    transition: t.transition,
  };

  const startBtnStyle = {
    flex: 1,
    background: t.primary,
    border: "none",
    borderRadius: t.btnRadius, padding: "16px 24px",
    color: "#fff",
    fontFamily: t.fontDisplay, fontSize: 18, fontWeight: 700,
    cursor: "pointer", letterSpacing: 1.5, textTransform: "uppercase" as const,
    display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 8,
    boxShadow: `0 0 20px ${t.primary}33, 0 4px 12px rgba(0,0,0,0.3)`,
    transition: t.transition,
  };

  return (
  <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
    {isAdvanced ? (
      <>
        <button onClick={() => setActiveSection("config")} style={backBtnStyle}>
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Back
        </button>
        <button onClick={() => setActiveSection("teams")} style={nextBtnStyle}>
          Next <ChevronRight size={16} />
        </button>
      </>
    ) : (
      <>
        {isFirst ? (
          <button onClick={onCancel} style={backBtnStyle}>
            <X size={16} /> Cancel
          </button>
        ) : (
          <button onClick={() => setActiveSection(steps[stepIdx - 1])} style={backBtnStyle}>
            <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Back
          </button>
        )}
        <button
          onClick={isLast ? onStart : () => setActiveSection(steps[stepIdx + 1])}
          style={isLast ? startBtnStyle : nextBtnStyle}
        >
          {isLast ? <><Zap size={18} /> Start Match</> : <>Next <ChevronRight size={16} /></>}
        </button>
      </>
    )}
  </div>
  );
};
