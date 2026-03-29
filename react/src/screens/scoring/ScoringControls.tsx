import { useState } from "react";
import { RotateCcw, SkipForward, X, Check, Hand, ChevronDown } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { IconBtn } from "../../components/Shared";
import umpireFlat from "../../assets/criquet-icons/umpire-flat.png";
import fingerFlat from "../../assets/criquet-icons/finger-flat.png";
import type { DismissalType, ExtraType } from "../../store/types";

interface Props {
  onRun: (runs: number) => void;
  onExtra: (type: ExtraType, extraRuns?: number) => void;
  onDismissal: (type: DismissalType, fielderId?: string, fielderName?: string) => void;
  onUndo: () => void;
  onConfirmOver?: () => void;
  onNextOver?: () => void;
  overComplete?: boolean;
  fielders: { id: string; name: string }[];
  disabled?: boolean;
}

const DISMISSAL_TYPES: DismissalType[] = ["bowled", "caught", "lbw", "run-out", "stumped", "hit-wkt"];
const DISMISSAL_LABELS: Record<DismissalType, string> = {
  bowled: "Bowled", caught: "Caught", lbw: "LBW",
  "run-out": "Run Out", stumped: "Stumped", "hit-wkt": "Hit Wkt",
};

export const ScoringControls = ({ onRun, onExtra, onDismissal, onUndo, onConfirmOver, onNextOver, overComplete, fielders, disabled }: Props) => {
  const t = useTheme();
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [wicketOpen, setWicketOpen] = useState(false);
  const [dismissalType, setDismissalType] = useState<DismissalType | null>(null);
  const [selectedFielder, setSelectedFielder] = useState<{ id: string; name: string } | null>(null);
  const [extraMode, setExtraMode] = useState<"bye" | "leg-bye" | null>(null);

  const scoringDisabled = disabled || overComplete;

  const close = () => {
    setExtrasOpen(false);
    setWicketOpen(false);
    setDismissalType(null);
    setSelectedFielder(null);
    setExtraMode(null);
  };

  const handleRun = (runs: number) => {
    if (scoringDisabled) return;
    if (extraMode) {
      onExtra(extraMode, runs);
      close();
    } else {
      onRun(runs);
      close();
    }
  };

  const handleWide = () => { onExtra("wide"); close(); };
  const handleNoBall = () => { onExtra("no-ball"); close(); };

  const handleConfirmWicket = () => {
    if (!dismissalType) return;
    onDismissal(dismissalType, selectedFielder?.id, selectedFielder?.name);
    close();
  };

  const runBtns: { label: string; value: number; accent?: boolean }[] = [
    { label: "0", value: 0 },
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4, accent: true },
    { label: "6", value: 6, accent: true },
  ];

  const extraModeLabel = extraMode === "bye" ? "Bye" : extraMode === "leg-bye" ? "Leg Bye" : null;

  return (
    <div style={{
      background: t.bgAlt, borderTop: `1px solid ${t.borderBright}`,
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "10px 14px 20px" }}>

        {/* Extras panel */}
        {extrasOpen && !scoringDisabled && (
          <div style={{
            background: t.card, border: `1px solid ${t.accentDim}33`,
            borderRadius: t.radiusLg, padding: 14, marginBottom: 10,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: t.accent }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{
                fontSize: 10, color: t.accent, fontFamily: t.fontDisplay,
                fontWeight: 500, letterSpacing: 2, textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <img src={umpireFlat} style={{ width: 16, height: 16, filter: "brightness(0) invert(0.5) sepia(1) saturate(5) hue-rotate(10deg)" }} />
                EXTRAS
              </span>
              <IconBtn icon={X} size={16} color={t.textMuted} onClick={close} />
            </div>

            {extraMode ? (
              <>
                <div style={{ fontSize: 12, color: t.textDim, fontFamily: t.fontSans, marginBottom: 8, fontWeight: 500 }}>
                  {extraModeLabel} — how many runs?
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2, 3, 4].map(r => (
                    <button key={r} onClick={() => handleRun(r)} style={{
                      flex: 1, height: t.btnHeight, borderRadius: t.btnRadius,
                      border: `1px solid ${t.accentDim}44`,
                      background: t.cardAlt, color: t.accent,
                      fontFamily: t.font, fontSize: 18, fontWeight: 800, cursor: "pointer",
                    }}>{r}</button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={handleWide} style={extraBtnStyle(t)}>
                  Wide
                  <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>+1 run</div>
                </button>
                <button onClick={handleNoBall} style={extraBtnStyle(t)}>
                  No Ball
                  <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>+1 run</div>
                </button>
                <button onClick={() => setExtraMode("bye")} style={extraBtnStyle(t)}>
                  Bye
                  <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    + runs <ChevronDown size={10} />
                  </div>
                </button>
                <button onClick={() => setExtraMode("leg-bye")} style={extraBtnStyle(t)}>
                  Leg Bye
                  <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    + runs <ChevronDown size={10} />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dismissal panel */}
        {wicketOpen && !scoringDisabled && (
          <div style={{
            background: t.card, border: `1px solid ${t.danger}33`,
            borderRadius: t.radiusLg, padding: 14, marginBottom: 10,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: t.danger }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{
                fontSize: 10, color: t.danger, fontFamily: t.fontDisplay,
                fontWeight: 500, letterSpacing: 2, textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <img src={fingerFlat} style={{ width: 16, height: 16, filter: "brightness(0) saturate(100%) invert(29%) sepia(97%) saturate(1200%) hue-rotate(330deg) brightness(1.1)" }} />
                DISMISSAL
              </span>
              <IconBtn icon={X} size={16} color={t.textMuted} onClick={close} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {DISMISSAL_TYPES.map(d => (
                <button key={d} onClick={() => { setDismissalType(d); setSelectedFielder(null); }} style={{
                  background: dismissalType === d ? `${t.danger}18` : t.cardAlt,
                  border: `1px solid ${dismissalType === d ? `${t.danger}55` : t.border}`,
                  borderRadius: t.btnRadius, padding: "10px 6px",
                  color: dismissalType === d ? t.danger : t.textDim,
                  fontFamily: t.fontSans, fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "center",
                }}>{DISMISSAL_LABELS[d]}</button>
              ))}
            </div>

            {(dismissalType === "caught" || dismissalType === "run-out") && fielders.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{
                  fontSize: 10, color: t.textMuted, fontFamily: t.fontDisplay,
                  marginBottom: 6, display: "flex", alignItems: "center", gap: 5,
                  letterSpacing: 1.5, textTransform: "uppercase",
                }}>
                  <Hand size={10} /> FIELDER
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {fielders.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFielder(selectedFielder?.id === f.id ? null : f)}
                      style={{
                        background: selectedFielder?.id === f.id ? `${t.danger}15` : t.cardAlt,
                        border: `1px solid ${selectedFielder?.id === f.id ? t.danger : t.border}`,
                        borderRadius: 20, padding: "5px 12px",
                        color: selectedFielder?.id === f.id ? t.text : t.textDim,
                        fontFamily: t.fontSans, fontSize: 12, fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dismissalType && (
              <button onClick={handleConfirmWicket} style={{
                width: "100%", marginTop: 12,
                background: t.danger, border: "none",
                borderRadius: t.btnRadius, padding: "12px", color: "#fff",
                fontFamily: t.fontDisplay, fontSize: 14, fontWeight: 500, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                textTransform: "uppercase", letterSpacing: 1,
              }}>
                <Check size={16} /> Confirm Wicket
              </button>
            )}
          </div>
        )}

        {/* Run buttons */}
        <div style={{ display: "flex", gap: 5, marginBottom: 8, opacity: scoringDisabled ? 0.3 : 1, pointerEvents: scoringDisabled ? "none" : "auto" }}>
          {runBtns.map((btn) => (
            <button key={btn.value} title={`${btn.value} run${btn.value !== 1 ? "s" : ""}`} onClick={() => handleRun(btn.value)} style={{
              flex: 1, minWidth: 0, height: t.btnHeight, borderRadius: t.btnRadius,
              border: btn.accent ? "none" : `1px solid ${t.borderBright}`,
              background: btn.accent ? t.primary : t.card,
              color: btn.accent ? "#fff" : t.text,
              fontFamily: t.font, fontSize: 20, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{btn.label}</button>
          ))}
        </div>

        {/* Bottom row: Extras, Dismissal, Undo, Confirm/Next */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            title="Extras"
            onClick={() => { if (!scoringDisabled) { setExtrasOpen(!extrasOpen); setWicketOpen(false); setDismissalType(null); setExtraMode(null); } }}
            style={{
              flex: 1, height: 46, borderRadius: t.btnRadius,
              border: `1px solid ${extrasOpen ? t.accent : t.borderBright}`,
              background: extrasOpen ? `${t.accent}12` : t.card,
              color: extrasOpen ? t.accent : t.textDim,
              fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              textTransform: "uppercase", letterSpacing: 1,
              opacity: scoringDisabled ? 0.3 : 1,
              pointerEvents: scoringDisabled ? "none" : "auto",
            }}
          >
            <img src={umpireFlat} style={{ width: 20, height: 20, filter: "brightness(0) invert(0.45)" }} /> Extras
          </button>
          <button
            title="Dismissal"
            onClick={() => { if (!scoringDisabled) { setWicketOpen(!wicketOpen); setExtrasOpen(false); setExtraMode(null); } }}
            style={{
              flex: 1, height: 46, borderRadius: t.btnRadius,
              border: "none",
              background: wicketOpen ? t.dangerDim : t.danger,
              color: "#fff", fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              textTransform: "uppercase", letterSpacing: 1,
              opacity: scoringDisabled ? 0.3 : 1,
              pointerEvents: scoringDisabled ? "none" : "auto",
            }}
          >
            <img src={fingerFlat} style={{ width: 20, height: 20, filter: "brightness(0) invert(1)" }} /> Dismissal
          </button>
          <button
            title="Undo last delivery"
            onClick={onUndo}
            style={{
              width: 46, height: 46, borderRadius: t.btnRadius,
              border: `1px solid ${t.borderBright}`, background: t.card,
              color: t.textMuted, cursor: "pointer", padding: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <RotateCcw size={22} />
          </button>
          {overComplete && onConfirmOver && (
            <button
              title="Complete over"
              onClick={onConfirmOver}
              style={{
                width: 46, height: 46, borderRadius: t.btnRadius,
                border: `1px solid ${t.primary}`, background: t.primary,
                color: "#fff", cursor: "pointer", padding: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Check size={22} strokeWidth={3} />
            </button>
          )}
          {!overComplete && onNextOver && (
            <button
              title="Next over"
              onClick={onNextOver}
              style={{
                width: 46, height: 46, borderRadius: t.btnRadius,
                border: `1px solid ${t.borderBright}`, background: t.card,
                color: t.textMuted, cursor: "pointer", padding: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <SkipForward size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function extraBtnStyle(t: any) {
  return {
    background: t.cardAlt, border: `1px solid ${t.border}`,
    borderRadius: t.btnRadius, padding: "14px 12px",
    color: t.accent, fontFamily: t.fontSans, fontSize: 14,
    fontWeight: 600, cursor: "pointer", textAlign: "center" as const,
  };
}
