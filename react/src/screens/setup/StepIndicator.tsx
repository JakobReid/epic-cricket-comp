import { Check } from "lucide-react";
import { useTheme } from "../../ThemeContext";

export const StepIndicator = ({ steps, stepLabels, sectionIcons, stepIdx, setActiveSection }: any) => {
  const t = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 0, marginBottom: 24, overflow: "hidden", borderRadius: t.radius }}>
      {steps.map((s: string, i: number) => {
        const SIcon = sectionIcons[s];
        const isActive = i === stepIdx;
        const isDone = i < stepIdx;
        const isFirst = i === 0;
        const isLastStep = i === steps.length - 1;

        return (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 10px",
              border: "none",
              borderRight: isLastStep ? "none" : `1px solid ${t.borderBright}`,
              borderLeft: isFirst ? "none" : undefined,
              background: isActive
                ? t.primary
                : isDone
                  ? t.cardAlt
                  : t.card,
              cursor: "pointer",
              position: "relative",
              transition: t.transition,
            }}
          >
            {/* Active bottom accent bar */}
            {isActive && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: 3, background: t.primaryDim,
              }} />
            )}

            {isDone ? (
              <div style={{
                width: 20, height: 20, borderRadius: t.radius,
                background: t.primaryLight,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Check size={12} color={t.primary} strokeWidth={3} />
              </div>
            ) : (
              <div style={{
                width: 20, height: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, opacity: isActive ? 1 : 0.5,
              }}>
                <SIcon size={14} color={isActive ? "#fff" : t.textMuted} />
              </div>
            )}

            <span style={{
              fontFamily: t.fontDisplay,
              fontSize: "clamp(12px, 1.8vw, 15px)",
              fontWeight: 600,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: isActive
                ? "#fff"
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
