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
          borderRadius: t.radiusLg, padding: "14px 16px",
          cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: t.radius,
            background: isActive ? t.primary + "1a" : t.cardAlt,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {preset.img
              ? <img src={preset.img} style={{ width: 24, height: 24, opacity: isActive ? 1 : 0.5 }} />
              : <PresetIcon size={18} color={isActive ? t.primary : t.textMuted} fill={isActive ? t.primary : t.textMuted} />
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: isActive ? t.primary : t.text }}>
                {preset.name}
              </span>
              {isActive && <Check size={14} color={t.primary} />}
            </div>
            <div style={{ fontFamily: t.fontSans, fontSize: 12, color: t.textMuted, marginTop: 2 }}>
              {preset.desc}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
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
                  color: isActive ? t.primary : t.textMuted,
                  background: isActive ? t.primary + "10" : t.cardAlt,
                  padding: "2px 7px", borderRadius: 4,
                }}>{tag}</span>
              ))}
            </div>
          </div>
        </button>
      );
    })}

    <button onClick={() => setActiveSection("advanced")} style={{
      background: "none", border: `${t.borderWidth}px dashed ${t.border}`,
      borderRadius: t.radiusLg, padding: "14px 16px",
      cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: t.radius,
        background: t.cardAlt, border: `${t.borderWidth}px dashed ${t.border}`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Settings size={18} color={t.textMuted} />
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: t.text }}>Custom</span>
        <div style={{ fontFamily: t.fontSans, fontSize: 12, color: t.textMuted, marginTop: 2 }}>Build your own format</div>
      </div>
      <ChevronRight size={16} color={t.textMuted} />
    </button>
  </div>
  );
};
