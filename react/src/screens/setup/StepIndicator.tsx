import { Check } from "lucide-react";
import { useTheme } from "../../ThemeContext";

export const StepIndicator = ({ steps, stepLabels, sectionIcons, stepIdx, setActiveSection }: any) => {
  const t = useTheme();
  return (
    <div style={{
      display: "flex", background: t.card,
      borderBottom: `${t.borderWidth}px solid ${t.border}`,
      marginBottom: 24,
    }}>
      {steps.map((s: string, i: number) => {
        const SIcon = sectionIcons[s];
        const isActive = i === stepIdx;
        const isDone = i < stepIdx;

        return (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 0",
              background: "transparent",
              border: "none",
              borderRadius: 0,
              borderBottom: isActive ? `2px solid ${t.primary}` : "2px solid transparent",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {isDone ? (
              <Check size={12} color={t.primary} strokeWidth={3} />
            ) : (
              <SIcon size={12} color={isActive ? t.text : t.textMuted} />
            )}

            <span style={{
              fontFamily: t.fontDisplay,
              fontSize: 12,
              fontWeight: isActive ? 700 : 500,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: isActive
                ? t.text
                : isDone
                  ? t.primary
                  : t.textMuted,
            }}>
              {stepLabels[s]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
