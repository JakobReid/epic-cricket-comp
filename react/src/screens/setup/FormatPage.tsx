import { ChevronRight, Settings, Check } from "lucide-react";
import { useTheme } from "../../ThemeContext";

export const FormatPage = ({ allPresets, activePreset, setConfig, setActivePreset, setActiveSection }: any) => {
  const t = useTheme();
  return (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {allPresets.map((preset: any) => {
      const PresetIcon = preset.icon;
      const isActive = activePreset === preset.name;
      return (
        <button key={preset.name} onClick={() => { setConfig(preset.config); setActivePreset(preset.name); }} style={{
          background: t.card,
          border: `${t.borderWidth}px solid ${isActive ? t.primary : t.border}`,
          borderRadius: t.radius, padding: 0,
          cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "stretch",
          overflow: "hidden",
          boxShadow: isActive ? `0 0 12px ${t.primary}22, inset 0 0 20px ${t.primary}08` : "none",
          transition: t.transition,
        }}>
          {/* Left accent strip */}
          <div style={{
            width: 4, flexShrink: 0,
            background: isActive ? t.primary : t.borderBright,
            transition: t.transition,
          }} />

          <div style={{
            flex: 1, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: t.radius,
              background: isActive ? t.primaryLight : t.cardAlt,
              border: `${t.borderWidth}px solid ${isActive ? t.primary + "33" : t.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {preset.img
                ? <img src={preset.img} style={{ width: 24, height: 24, opacity: isActive ? 1 : 0.45 }} />
                : <PresetIcon size={18} color={isActive ? t.primary : t.textMuted} fill={isActive ? t.primary : t.textMuted} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontFamily: t.fontDisplay, fontSize: 15, fontWeight: 600,
                  color: isActive ? t.primary : t.text,
                  textTransform: "uppercase", letterSpacing: 0.8,
                }}>
                  {preset.name}
                </span>
                {isActive && (
                  <div style={{
                    width: 18, height: 18, borderRadius: t.radius,
                    background: t.primary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div style={{ fontFamily: t.fontSans, fontSize: 12, color: t.textMuted, marginTop: 3 }}>
                {preset.desc}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {[
                  `${preset.config.teamsPerGame} teams`,
                  `${preset.config.playersPerTeam}pp`,
                  `${preset.config.overs} ov`,
                  `${preset.config.ballsPerOver} ball`,
                  `${preset.config.wickets} wkt`,
                  ...(preset.config.catchBonus > 0 ? [`+${preset.config.catchBonus} catch`] : []),
                  ...(preset.config.retireAt > 0 ? [`ret ${preset.config.retireAt}`] : []),
                  ...(preset.config.cantOutFirstBall ? ["safe 1st"] : []),
                  ...(preset.config.nickAndRun ? ["nick & run"] : []),
                  ...(preset.config.lastManStands ? ["LMS"] : []),
                  ...(preset.config.oneHandOneBounce ? ["OHOB"] : []),
                  ...(preset.config.freeHits ? ["free hits"] : []),
                ].map((tag) => (
                  <span key={tag} style={{
                    fontFamily: t.font, fontSize: 10, fontWeight: 600,
                    color: isActive ? t.primary : t.textDim,
                    background: isActive ? t.primaryLight : t.bgAlt,
                    padding: "3px 8px", borderRadius: t.radius,
                    border: `1px solid ${isActive ? t.primary + "22" : t.border}`,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </button>
      );
    })}

    <button onClick={() => setActiveSection("advanced")} style={{
      background: "none",
      border: `${t.borderWidth}px dashed ${t.textMuted}`,
      borderRadius: t.radius, padding: "14px 16px",
      cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
      transition: t.transition,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: t.radius,
        background: t.cardAlt,
        border: `${t.borderWidth}px dashed ${t.textMuted}`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Settings size={18} color={t.textMuted} />
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <span style={{
          fontFamily: t.fontDisplay, fontSize: 15, fontWeight: 600,
          color: t.textDim, textTransform: "uppercase", letterSpacing: 0.8,
        }}>Custom</span>
        <div style={{ fontFamily: t.fontSans, fontSize: 12, color: t.textMuted, marginTop: 3 }}>Build your own format</div>
      </div>
      <ChevronRight size={16} color={t.textMuted} />
    </button>
  </div>
  );
};
