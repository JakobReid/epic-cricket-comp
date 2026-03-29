import { useState } from "react";
import { Settings, Users, ChevronRight } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import batLineal from "../../assets/criquet-icons/bat-lineal.png";
import { CricketIcon } from "../../components/Shared";
import { FORMAT_PRESETS } from "./formatPresets";
import { StepIndicator } from "./StepIndicator";
import { FormatPage } from "./FormatPage";
import { CustomFormatPage } from "./CustomFormatPage";
import { TeamsPage, TEAM_COLORS, type TeamDraft } from "./TeamsPage";
import { InningsPage } from "./InningsPage";
import { SetupNav } from "./SetupNav";
import { useMatchStore } from "../../store/matchStore";
import type { Team, Player, FormatConfig } from "../../store/types";

const BatStepIcon = ({ size, color }: { size: number; color: string }) => (
  <CricketIcon src={batLineal} color={color} size={size} />
);

const DEFAULT_TEAMS: TeamDraft[] = [
  { name: "Backyard Legends", players: ["Jakob", "Matt"],  color: TEAM_COLORS[0], logo: "shield" },
  { name: "Street Smashers",  players: ["Tom",   "Luke"],  color: TEAM_COLORS[1], logo: "star"   },
  { name: "Park Royals",      players: ["Sam",   "Dan"],   color: TEAM_COLORS[2], logo: "zap"    },
  { name: "The Tail Enders",  players: ["Chris", "Ryan"],  color: TEAM_COLORS[3], logo: "flame"  },
];

const DEFAULT_CONFIG: FormatConfig = {
  name: "Pairs Cricket",
  overs: 6, ballsPerOver: 6, wickets: 3, catchBonus: 5,
  playersPerTeam: 2, teamsPerGame: 4,
  retireAt: 0, maxOversPerBowler: 0,
  cantOutFirstBall: false, nickAndRun: true, lastManStands: true,
  oneHandOneBounce: false, freeHits: true,
};

const steps = ["config", "teams", "innings"];
const stepLabels: Record<string, string> = { config: "Format", teams: "Teams", innings: "Innings" };

/** Convert TeamDraft to Team with generated IDs */
function draftToTeam(draft: TeamDraft, idx: number): Team {
  const id = `new-t${idx}-${Date.now()}`;
  const players: Player[] = draft.players.map((name, pi) => ({
    id: `${id}-p${pi}`,
    name,
  }));
  return { id, name: draft.name, color: draft.color, logo: draft.logo, players };
}

export const MatchSetup = ({ onStart, onCancel }: { onStart: (matchId: string) => void; onCancel: () => void }) => {
  const t = useTheme();
  const { createMatch, startMatch } = useMatchStore();

  const [teams, setTeams] = useState<TeamDraft[]>(DEFAULT_TEAMS);
  const [config, setConfig] = useState<FormatConfig>(DEFAULT_CONFIG);

  // Innings ordering state (lifted from InningsPage)
  const [battingOrder, setBattingOrder] = useState<TeamDraft[]>(DEFAULT_TEAMS);
  const [bowlingOrders, setBowlingOrders] = useState<Record<string, TeamDraft[]>>(
    Object.fromEntries(DEFAULT_TEAMS.map(bt => [bt.name, DEFAULT_TEAMS.filter(t => t.name !== bt.name)]))
  );

  // Keep battingOrder and bowlingOrders in sync when teams change
  const handleTeamsChange = (newTeams: TeamDraft[]) => {
    setTeams(newTeams);
    // Rebuild batting/bowling order to reflect name/color changes
    setBattingOrder(prev =>
      prev.map(bt => newTeams.find(t => t.name === bt.name) ?? bt)
    );
    setBowlingOrders(prev => {
      const updated: Record<string, TeamDraft[]> = {};
      for (const [key, bowlers] of Object.entries(prev)) {
        updated[key] = bowlers.map(b => newTeams.find(t => t.name === b.name) ?? b);
      }
      return updated;
    });
  };

  const [activeSection, setActiveSection] = useState("config");
  const [activePreset, setActivePreset] = useState<string | null>("Pairs Cricket");
  const [customInput, setCustomInput] = useState<string | null>(null);
  const [savedFormats, setSavedFormats] = useState<any[]>([]);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  const allPresets = [...FORMAT_PRESETS, ...savedFormats];
  const sectionIcons: Record<string, any> = { config: Settings, teams: Users, innings: BatStepIcon };

  const isAdvanced = activeSection === "advanced";
  const stepIdx = isAdvanced ? 0 : steps.indexOf(activeSection);
  const isLast = !isAdvanced && stepIdx === steps.length - 1;
  const isFirst = !isAdvanced && stepIdx === 0;

  const handleStart = () => {
    // Convert drafts -> typed Teams with real IDs
    const builtTeams: Team[] = teams.map((d, i) => draftToTeam(d, i));
    const teamByName = Object.fromEntries(builtTeams.map((t, i) => [teams[i].name, t]));

    const orderedTeams = battingOrder.map(d => teamByName[d.name]).filter(Boolean);
    const bowlingOrderMapped: Record<string, Team[]> = {};
    for (const [key, bowlers] of Object.entries(bowlingOrders)) {
      const mappedTeam = teamByName[key];
      if (mappedTeam) {
        bowlingOrderMapped[mappedTeam.id] = bowlers.map(b => teamByName[b.name]).filter(Boolean);
      }
    }

    const matchId = createMatch(config, builtTeams, orderedTeams, bowlingOrderMapped);
    startMatch(matchId);
    onStart(matchId);
  };

  return (
    <div style={{
      padding: 16, paddingBottom: 24, maxWidth: 640, margin: "0 auto",
      background: t.bg, minHeight: "100%",
    }}>
      {!isAdvanced && (
        <StepIndicator
          steps={steps}
          stepLabels={stepLabels}
          sectionIcons={sectionIcons}
          stepIdx={stepIdx}
          setActiveSection={setActiveSection}
        />
      )}

      {isAdvanced && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
          paddingBottom: 14, borderBottom: `1px solid ${t.border}`,
        }}>
          <button onClick={() => setActiveSection("config")} style={{
            background: t.card, border: `1px solid ${t.borderBright}`,
            borderRadius: t.radius, cursor: "pointer", padding: "6px 8px",
            display: "flex", alignItems: "center",
          }}>
            <ChevronRight size={18} color={t.textDim} style={{ transform: "rotate(180deg)" }} />
          </button>
          <div style={{
            fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 600,
            color: t.text, textTransform: "uppercase", letterSpacing: 1,
          }}>Custom Format</div>
        </div>
      )}

      {activeSection === "config" && (
        <FormatPage
          allPresets={allPresets}
          activePreset={activePreset}
          setConfig={setConfig}
          setActivePreset={setActivePreset}
          setActiveSection={setActiveSection}
        />
      )}

      {isAdvanced && (
        <CustomFormatPage
          config={config}
          setConfig={setConfig}
          activePreset={activePreset}
          setActivePreset={setActivePreset}
          customInput={customInput}
          setCustomInput={setCustomInput}
          savedFormats={savedFormats}
          setSavedFormats={setSavedFormats}
          saveName={saveName}
          setSaveName={setSaveName}
          showSaveInput={showSaveInput}
          setShowSaveInput={setShowSaveInput}
          allPresets={allPresets}
          setActiveSection={setActiveSection}
        />
      )}

      {activeSection === "teams" && (
        <TeamsPage teams={teams} config={config} onChange={handleTeamsChange} />
      )}

      {activeSection === "innings" && (
        <InningsPage
          config={config}
          battingOrder={battingOrder}
          setBattingOrder={setBattingOrder}
          bowlingOrders={bowlingOrders}
          setBowlingOrders={setBowlingOrders}
        />
      )}

      <SetupNav
        isAdvanced={isAdvanced}
        isFirst={isFirst}
        isLast={isLast}
        stepIdx={stepIdx}
        steps={steps}
        onStart={handleStart}
        onCancel={onCancel}
        setActiveSection={setActiveSection}
      />
    </div>
  );
};
