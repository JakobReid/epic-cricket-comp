import { useState } from "react";
import { Plus, X, Shield, Star, Zap, Flame, Crown, Trophy, Swords, Rocket, type LucideIcon } from "lucide-react";
import { useTheme } from "../../ThemeContext";

export const TEAM_COLORS = [
  "#2196F3", "#8E24AA", "#43A047", "#FB8C00",
  "#FFCA28", "#00897B", "#F9A825", "#E91E63",
  "#E53935", "#546E7A",
];

export const TEAM_LOGOS: { key: string; icon?: LucideIcon; img?: string }[] = [
  { key: "shield", icon: Shield },
  { key: "star",   icon: Star   },
  { key: "zap",    icon: Zap    },
  { key: "flame",  icon: Flame  },
  { key: "crown",  icon: Crown  },
  { key: "trophy", icon: Trophy },
  { key: "swords", icon: Swords },
  { key: "rocket", icon: Rocket },
];

export function TeamLogo({ logoKey, color, size = 20 }: { logoKey: string; color: string; size?: number }) {
  const entry = TEAM_LOGOS.find(l => l.key === logoKey) ?? TEAM_LOGOS[0];
  if (entry.img) {
    const isWhite = color === "#fff" || color === "white" || color.startsWith("rgba(255,255,255");
    return (
      <img
        src={entry.img}
        style={{ width: size, height: size, filter: isWhite ? "brightness(0) invert(1)" : undefined, opacity: isWhite ? 0.85 : 1 }}
      />
    );
  }
  const Icon = entry.icon!;
  return <Icon size={size} color={color} fill={color} strokeWidth={0} />;
}

export interface TeamDraft {
  name: string;
  color: string;
  logo: string;
  players: string[];
}

interface Props {
  teams: TeamDraft[];
  config?: any;
  onChange: (teams: TeamDraft[]) => void;
}

export const TeamsPage = ({ teams, config, onChange }: Props) => {
  const t = useTheme();
  const [openPicker, setOpenPicker] = useState<number | null>(null);
  const [addingPlayer, setAddingPlayer] = useState<{ idx: number; value: string } | null>(null);

  const update = (i: number, patch: Partial<TeamDraft>) => {
    onChange(teams.map((team, j) => j === i ? { ...team, ...patch } : team));
  };

  const addPlayer = (i: number, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const current = teams[i].players;
    update(i, { players: [...current, trimmed] });
  };

  const removePlayer = (teamIdx: number, playerIdx: number) => {
    const players = teams[teamIdx].players.filter((_, j) => j !== playerIdx);
    update(teamIdx, { players });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {teams.map((team, i) => {
        const color = team.color ?? TEAM_COLORS[i % TEAM_COLORS.length];
        const logoKey = team.logo ?? "shield";
        const pickerOpen = openPicker === i;
        const maxPlayers = config?.playersPerTeam ?? 11;
        const atMax = team.players.length >= maxPlayers;

        return (
          <div key={i} style={{ border: `${t.borderWidth}px solid ${color}`, borderRadius: t.radiusLg, overflow: "hidden" }}>
            {/* Coloured header */}
            <button
              onClick={() => setOpenPicker(pickerOpen ? null : i)}
              style={{
                width: "100%", background: color,
                padding: "10px 14px", border: "none", borderRadius: 0, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <TeamLogo logoKey={logoKey} color="rgba(255,255,255,0.85)" size={16} />
              <input
                value={team.name}
                onChange={e => { e.stopPropagation(); update(i, { name: e.target.value }); }}
                onClick={e => e.stopPropagation()}
                style={{
                  flex: 1, background: "transparent", border: "none",
                  fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: "#fff",
                  cursor: "text", outline: "none",
                }}
              />
              <span style={{ fontFamily: t.font, fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase" }}>
                Team {i + 1}
              </span>
            </button>

            <div style={{ background: t.card, padding: t.cardPadding }}>
              {/* Icon picker */}
              {pickerOpen && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10,
                  padding: "10px 0",
                  borderBottom: `${t.borderWidth}px solid ${t.border}`,
                }}>
                  {TEAM_LOGOS.map(({ key, icon: Icon, img }) => {
                    const selected = logoKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => { update(i, { logo: key }); setOpenPicker(null); }}
                        style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: selected ? color + "22" : t.cardAlt,
                          border: selected ? `2px solid ${color}` : `2px solid transparent`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", padding: 0,
                        }}
                      >
                        {img
                          ? <img src={img} style={{ width: 18, height: 18, opacity: selected ? 1 : 0.45 }} />
                          : Icon && <Icon size={18} color={selected ? color : t.textDim} fill={selected ? color : t.textDim} strokeWidth={0} />
                        }
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Players */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8, marginBottom: 10 }}>
                {team.players.map((p, pi) => (
                  <div key={pi} style={{
                    background: t.cardAlt, borderRadius: t.radius,
                    padding: "8px 10px", fontSize: 13, color: t.textDim,
                    fontFamily: t.fontSans, display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 4,
                  }}>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p}</span>
                    <button
                      onClick={() => removePlayer(i, pi)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
                    >
                      <X size={12} color={t.textMuted} />
                    </button>
                  </div>
                ))}

                {/* Add player input or button */}
                {!atMax && addingPlayer?.idx === i ? (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      addPlayer(i, addingPlayer.value);
                      setAddingPlayer(null);
                    }}
                    style={{ display: "contents" }}
                  >
                    <input
                      autoFocus
                      value={addingPlayer.value}
                      onChange={e => setAddingPlayer({ idx: i, value: e.target.value })}
                      onBlur={() => {
                        if (addingPlayer.value.trim()) addPlayer(i, addingPlayer.value);
                        setAddingPlayer(null);
                      }}
                      placeholder="Name…"
                      style={{
                        background: t.card, border: `${t.borderWidth}px solid ${color}`,
                        borderRadius: t.radius, padding: "8px 10px",
                        fontSize: 13, color: t.text, fontFamily: t.fontSans, outline: "none",
                      }}
                    />
                  </form>
                ) : !atMax ? (
                  <button
                    onClick={() => setAddingPlayer({ idx: i, value: "" })}
                    style={{
                      background: "none", border: `${t.borderWidth}px dashed ${t.border}`,
                      borderRadius: t.radius, padding: "8px 10px",
                      fontSize: 13, color: t.textMuted, fontFamily: t.fontSans,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}
                  >
                    <Plus size={12} /> Player
                  </button>
                ) : null}
              </div>

              {/* Colour swatches */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {TEAM_COLORS.map((c) => {
                  const selected = color === c;
                  return (
                    <button
                      key={c}
                      onClick={() => update(i, { color: c })}
                      style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: c, border: selected ? `3px solid ${t.text}` : `2px solid transparent`,
                        cursor: "pointer", outline: selected ? `2px solid ${c}` : "none",
                        outlineOffset: 1, padding: 0, flexShrink: 0,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
