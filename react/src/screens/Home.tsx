import { Plus } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useMatchStore } from "../store/matchStore";
import { StatusBadge } from "../components/Shared";
import type { Match } from "../store/types";

type MatchStatus = "live" | "upcoming" | "completed";



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

function winnerColor(m: Match): string | undefined {
  if (m.status !== "completed") return undefined;
  const ranked = [...m.innings].sort((a, b) => b.runs - a.runs);
  const topTeam = m.teams.find(t => t.id === ranked[0]?.battingTeamId);
  return topTeam?.color;
}

function MatchCard({ match, onOpen }: { match: Match; onOpen: () => void }) {
  const t = useTheme();
  const status = match.status as MatchStatus;
  const isCompleted = status === "completed";

  const team0Color = match.teams[0]?.color || t.primary;
  const team1Color = match.teams[1]?.color || t.secondary;
  const stripColor = team0Color;

  return (
    <button
      onClick={onOpen}
      style={{
        width: "100%",
        background: t.card,
        border: `${t.borderWidth}px solid ${t.border}`,
        borderRadius: t.radius,
        padding: 0,
        cursor: "pointer",
        textAlign: "left",
        opacity: isCompleted ? 0.75 : 1,
        transition: t.transition,
        display: "flex",
        overflow: "hidden",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = t.borderBright;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = t.border;
      }}
    >
      {/* Card content */}
      <div style={{ flex: 1, padding: "12px 14px" }}>
        {/* Header row: date + status badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: t.textMuted,
              fontFamily: t.font,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {formatDate(match.createdAt)}
          </span>
          <StatusBadge status={status} />
        </div>

        {/* Team rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {match.teams.map((team) => {
            const score = inningsScore(match, team.id);
            return (
              <div
                key={team.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: team.color,
                      flexShrink: 0,
                      boxShadow: `0 0 4px ${team.color}60`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: t.text,
                      fontFamily: t.fontSans,
                    }}
                  >
                    {team.name}
                  </span>
                </div>
                {score && (
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: t.text,
                      fontFamily: t.font,
                      letterSpacing: 0.5,
                    }}
                  >
                    {score}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
            paddingTop: 8,
            borderTop: `1px solid ${t.border}`,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: t.textMuted,
              fontFamily: t.font,
              letterSpacing: 0.3,
              textTransform: "uppercase",
            }}
          >
            {formatOvers(match)}
          </span>
          {winner(match) && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: winnerColor(match) || t.accent,
                fontFamily: t.fontSans,
                letterSpacing: 0.3,
                textTransform: "uppercase",
              }}
            >
              {winner(match)}
            </span>
          )}
        </div>
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
      {/* Page title */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: t.text,
            fontFamily: t.fontDisplay,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            margin: 0,
            lineHeight: 1,
          }}
        >
          MATCHES
        </h1>
      </div>

      {/* New Match button */}
      <button
        onClick={onCreateMatch}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: t.primary,
          color: "#fff",
          border: "none",
          borderRadius: t.btnRadius,
          height: t.btnHeight,
          padding: "0 20px",
          marginBottom: 24,
          fontSize: 15,
          fontWeight: 700,
          fontFamily: t.fontDisplay,
          cursor: "pointer",
          transition: t.transition,
          letterSpacing: 1.2,
          textTransform: "uppercase",
        }}
      >
        <Plus size={18} strokeWidth={2.5} />
        New Match
      </button>

      {/* Match list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} onOpen={() => handleOpen(match.id)} />
        ))}
      </div>
    </div>
  );
}
