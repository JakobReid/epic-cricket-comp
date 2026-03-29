import { Plus, Clock, CheckCircle2, Radio } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useMatchStore } from "../store/matchStore";
import type { Match } from "../store/types";

type MatchStatus = "live" | "upcoming" | "completed";

const STATUS_META: Record<MatchStatus, { label: string; icon: typeof Radio; color: (t: any) => string }> = {
  "live":      { label: "Live",      icon: Radio,        color: (t) => t.primary },
  "upcoming":  { label: "Upcoming",  icon: Clock,        color: (t) => t.secondary },
  "completed": { label: "Completed", icon: CheckCircle2, color: (t) => t.textMuted },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `Today · ${h}:${m}`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

function formatOvers(m: Match): string {
  return `${m.format.name} · ${m.format.overs} ov`;
}

function inningsScore(m: Match, teamId: string): string | undefined {
  const inn = m.innings.find(i => i.battingTeamId === teamId && i.status !== "upcoming");
  if (!inn) return undefined;
  if (inn.status === "in-progress") {
    return `${inn.wickets}/${inn.runs} (${inn.completedOvers}.${inn.ballsInCurrentOver})`;
  }
  return `${inn.wickets}/${inn.runs} (${inn.completedOvers}.0)`;
}

function winner(m: Match): string | undefined {
  if (m.status !== "completed") return undefined;
  const ranked = [...m.innings].sort((a, b) => b.runs - a.runs);
  const topTeam = m.teams.find(t => t.id === ranked[0]?.battingTeamId);
  return topTeam ? `${topTeam.name} won` : undefined;
}

function MatchCard({ match, onOpen }: { match: Match; onOpen: () => void }) {
  const t = useTheme();
  const status = match.status as MatchStatus;
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;
  const statusColor = meta.color(t);

  return (
    <button
      onClick={onOpen}
      style={{
        width: "100%",
        background: t.card,
        border: `${t.borderWidth}px solid ${t.border}`,
        borderRadius: t.radiusLg,
        padding: `14px ${t.cardPadding}px`,
        cursor: "pointer",
        textAlign: "left",
        opacity: status === "completed" ? 0.85 : 1,
        transition: t.transition,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: t.textMuted, fontFamily: t.fontSans }}>
          {formatDate(match.createdAt)}
        </span>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          background: statusColor + "18", borderRadius: 4, padding: "3px 8px",
        }}>
          <StatusIcon size={10} color={statusColor} strokeWidth={2.5} />
          <span style={{
            fontSize: 10, fontWeight: 700, color: statusColor,
            fontFamily: t.fontSans, letterSpacing: 0.5, textTransform: "uppercase",
          }}>{meta.label}</span>
        </div>
      </div>

      {/* Teams */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {match.teams.map((team) => {
          const score = inningsScore(match, team.id);
          return (
            <div key={team.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: team.color, flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: t.text, fontFamily: t.fontSans }}>{team.name}</span>
              </div>
              {score && (
                <span style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: t.font, letterSpacing: 0.3 }}>
                  {score}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 12, paddingTop: 10, borderTop: `1px solid ${t.border}`,
      }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: t.textMuted, fontFamily: t.fontSans }}>
          {formatOvers(match)}
        </span>
        {winner(match) && (
          <span style={{ fontSize: 11, fontWeight: 700, color: t.textDim, fontFamily: t.fontSans }}>
            {winner(match)}
          </span>
        )}
      </div>
    </button>
  );
}

export function Home({ onCreateMatch, onOpenMatch }: { onCreateMatch: () => void; onOpenMatch: (id: string) => void }) {
  const t = useTheme();
  const { matches, openMatch } = useMatchStore();

  const handleOpen = (id: string) => {
    openMatch(id);
    onOpenMatch(id);
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: t.fontSans, letterSpacing: -0.3 }}>
          Matches
        </h1>
      </div>

      <button onClick={onCreateMatch} style={{
        width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: t.primary, color: "#fff",
        border: "none", borderRadius: t.radiusLg,
        padding: "14px 20px", marginBottom: 24,
        fontSize: 14, fontWeight: 700, fontFamily: t.fontSans,
        cursor: "pointer", transition: t.transition, letterSpacing: 0.2,
      }}>
        <Plus size={16} strokeWidth={2.5} />
        New Match
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} onOpen={() => handleOpen(match.id)} />
        ))}
      </div>
    </div>
  );
}
