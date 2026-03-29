import { Plus, Check, Save, Star } from "lucide-react";
import { useTheme } from "../../ThemeContext";

export const CustomFormatPage = ({
  config, setConfig, activePreset, setActivePreset,
  customInput, setCustomInput,
  savedFormats, setSavedFormats,
  saveName, setSaveName,
  showSaveInput, setShowSaveInput,
  allPresets, setActiveSection: _setActiveSection,
}: any) => {
  const t = useTheme();
  const configItems = [
    { label: "Teams", value: config.teamsPerGame, key: "teamsPerGame", options: [2, 3, 4, 6] },
    { label: "Players / team", value: config.playersPerTeam, key: "playersPerTeam", options: [2, 3, 5, 11] },
    { label: "Overs / innings", value: config.overs, key: "overs", options: [4, 6, 10, 20], desc: "Overs per batting innings" },
    { label: "Balls / over", value: config.ballsPerOver, key: "ballsPerOver", options: [4, 6, 8, 10] },
    { label: "Wickets / batter", value: config.wickets, key: "wickets", options: [1, 2, 3, 5], desc: "Lives each batter gets before they're out" },
    { label: "Catch bonus", value: config.catchBonus, key: "catchBonus", options: [0, 5, 10, 15], desc: "Bonus points for fielding team per catch" },
    { label: "Retire at", value: config.retireAt, key: "retireAt", options: [0, 25, 30, 50], zeroLabel: "N/A", desc: "Batter must retire after reaching this score" },
    { label: "Max ov / bowler", value: config.maxOversPerBowler, key: "maxOversPerBowler", options: [0, 2, 3, 4], zeroLabel: "N/A" },
  ];
  const ruleToggles = [
    { label: "Can't get out first ball", key: "cantOutFirstBall", desc: "Batter is protected on their first delivery" },
    { label: "Nick & run", key: "nickAndRun", desc: "Batter must run if contact is made" },
    { label: "Last man stands", key: "lastManStands", desc: "Remaining batter continues alone" },
    { label: "One hand, one bounce", key: "oneHandOneBounce", desc: "Catches count one-handed off the bounce" },
    { label: "Free hits", key: "freeHits", desc: "No wicket on delivery after a no ball" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Compact preset grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {allPresets.map((preset: any) => {
          const PresetIcon = preset.icon;
          const isActive = activePreset === preset.name;
          return (
            <button key={preset.name} onClick={() => { setConfig(preset.config); setActivePreset(preset.name); }} style={{
              background: isActive ? t.primaryLight : t.card,
              border: `${t.borderWidth}px solid ${isActive ? t.primary : t.border}`,
              borderRadius: t.radius, padding: "12px 8px",
              cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6,
              boxShadow: isActive ? `0 0 10px ${t.primary}18` : "none",
              transition: t.transition,
            }}>
              {preset.img
                ? <img src={preset.img} style={{ width: 20, height: 20, opacity: isActive ? 1 : 0.45 }} />
                : <PresetIcon size={20} color={isActive ? t.primary : t.textMuted} fill={isActive ? t.primary : t.textMuted} />
              }
              <span style={{
                fontFamily: t.fontDisplay, fontSize: 11, fontWeight: 600,
                color: isActive ? t.primary : t.textDim,
                textAlign: "center", lineHeight: 1.2,
                textTransform: "uppercase", letterSpacing: 0.5,
              }}>{preset.name}</span>
            </button>
          );
        })}
      </div>

      {/* Config card */}
      <div style={{
        background: t.card, border: `${t.borderWidth}px solid ${t.border}`,
        borderRadius: t.radius, overflow: "hidden",
      }}>
        {configItems.map((item: any, idx: number) => (
          <div key={item.key}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 14px",
              background: idx % 2 === 0 ? t.card : t.bgAlt,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 600, color: t.text }}>{item.label}</span>
                {item.desc && <div style={{ fontFamily: t.fontSans, fontSize: 11, color: t.textMuted, marginTop: 2 }}>{item.desc}</div>}
              </div>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {item.options.map((opt: number) => {
                  const label = opt === 0 && item.zeroLabel ? item.zeroLabel : opt;
                  const isWide = typeof label === "string" && label.length > 2;
                  const isSelected = opt === item.value;
                  return (
                    <button key={opt} onClick={() => { setConfig({ ...config, [item.key]: opt }); setActivePreset(null); setCustomInput(null); }} style={{
                      minWidth: 36, height: 36, borderRadius: t.btnRadius,
                      padding: isWide ? "0 10px" : 0,
                      border: `${t.borderWidth}px solid ${isSelected ? t.primary : t.borderBright}`,
                      background: isSelected ? t.primaryLight : t.bgAlt,
                      color: isSelected ? t.primary : t.textDim,
                      fontFamily: isWide ? t.fontSans : t.font, fontSize: isWide ? 11 : 14, fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: isSelected ? `0 0 8px ${t.primary}18` : "none",
                      transition: t.transition,
                    }}>{label}</button>
                  );
                })}
                {customInput === item.key ? (
                  <input autoFocus type="number" min="0"
                    defaultValue={!item.options.includes(item.value) ? item.value : ""}
                    placeholder="#"
                    onKeyDown={(e: any) => {
                      if (e.key === "Enter" && e.target.value !== "") {
                        setConfig({ ...config, [item.key]: parseInt(e.target.value, 10) });
                        setActivePreset(null); setCustomInput(null);
                      } else if (e.key === "Escape") { setCustomInput(null); }
                    }}
                    onBlur={(e: any) => {
                      if (e.target.value !== "") { setConfig({ ...config, [item.key]: parseInt(e.target.value, 10) }); setActivePreset(null); }
                      setCustomInput(null);
                    }}
                    style={{
                      width: 48, height: 36, borderRadius: t.btnRadius,
                      border: `${t.borderWidth}px solid ${t.primary}`, background: t.primaryLight,
                      color: t.primary, fontFamily: t.font, fontSize: 14, fontWeight: 700,
                      textAlign: "center", outline: "none",
                    }}
                  />
                ) : (
                  <button onClick={() => setCustomInput(item.key)} style={{
                    minWidth: 36, height: 36, borderRadius: t.btnRadius,
                    border: `${t.borderWidth}px dashed ${!item.options.includes(item.value) ? t.primary : t.borderBright}`,
                    background: !item.options.includes(item.value) ? t.primaryLight : "transparent",
                    color: !item.options.includes(item.value) ? t.primary : t.textMuted,
                    fontFamily: t.font, fontSize: 14, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {!item.options.includes(item.value) ? item.value : <Plus size={14} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Rule toggles */}
        <div style={{ height: 1, background: t.borderBright }} />
        {ruleToggles.map((rule: any, idx: number) => (
          <div key={rule.key}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 14px",
              background: idx % 2 === 0 ? t.card : t.bgAlt,
            }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 600, color: t.text }}>{rule.label}</span>
                <div style={{ fontFamily: t.fontSans, fontSize: 11, color: t.textMuted, marginTop: 2 }}>{rule.desc}</div>
              </div>
              <button onClick={() => { setConfig({ ...config, [rule.key]: !config[rule.key] }); setActivePreset(null); }} style={{
                width: 44, height: 26, borderRadius: 13, border: "none",
                background: config[rule.key] ? t.primary : t.bgAlt,
                cursor: "pointer", position: "relative", transition: "background 0.2s",
                boxShadow: config[rule.key] ? `0 0 8px ${t.primary}33` : `inset 0 1px 3px rgba(0,0,0,0.4)`,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: config[rule.key] ? "#fff" : t.textMuted,
                  position: "absolute", top: 3,
                  left: config[rule.key] ? 21 : 3,
                  transition: "left 0.2s, background 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {config[rule.key] && <Check size={10} color={t.primary} strokeWidth={3} />}
                </div>
              </button>
            </div>
            {idx < ruleToggles.length - 1 && <div style={{ height: 1, background: t.border }} />}
          </div>
        ))}
      </div>

      {/* Save as new format */}
      {!activePreset && (
        <div style={{
          background: t.card, border: `${t.borderWidth}px solid ${t.border}`,
          borderRadius: t.radius, padding: t.cardPadding,
        }}>
          {!showSaveInput ? (
            <button onClick={() => setShowSaveInput(true)} style={{
              width: "100%", background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10, padding: 0,
            }}>
              <Save size={16} color={t.accent} />
              <span style={{
                fontFamily: t.fontDisplay, fontSize: 14, fontWeight: 600,
                color: t.accent, textTransform: "uppercase", letterSpacing: 0.8,
              }}>
                Save as new format
              </span>
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                autoFocus
                type="text"
                placeholder="Format name..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e: any) => {
                  if (e.key === "Enter" && saveName.trim()) {
                    setSavedFormats([...savedFormats, { name: saveName.trim(), icon: Star, desc: "Custom format", config: { ...config } }]);
                    setActivePreset(saveName.trim());
                    setSaveName(""); setShowSaveInput(false);
                  } else if (e.key === "Escape") { setSaveName(""); setShowSaveInput(false); }
                }}
                style={{
                  flex: 1, height: 40, borderRadius: t.btnRadius,
                  border: `${t.borderWidth}px solid ${t.accent}`, background: t.bgAlt,
                  color: t.text, fontFamily: t.fontSans, fontSize: 14,
                  padding: "0 12px", outline: "none",
                }}
              />
              <button onClick={() => {
                if (saveName.trim()) {
                  setSavedFormats([...savedFormats, { name: saveName.trim(), icon: Star, desc: "Custom format", config: { ...config } }]);
                  setActivePreset(saveName.trim());
                  setSaveName(""); setShowSaveInput(false);
                }
              }} style={{
                height: 40, padding: "0 16px", borderRadius: t.btnRadius,
                background: t.accent, border: "none", color: "#fff",
                fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 600,
                cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5,
              }}>Save</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
