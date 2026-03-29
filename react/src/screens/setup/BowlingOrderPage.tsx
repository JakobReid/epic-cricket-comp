import { useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { TeamLogo } from "./TeamsPage";

export const BowlingOrderPage = ({ teams, config }: any) => {
  const t = useTheme();

  const [bowlingOrders, setBowlingOrders] = useState<Record<number, any[]>>(
    Object.fromEntries(
      teams.map((_battingTeam: any, i: number) => [
        i,
        teams.filter((_: any, j: number) => j !== i),
      ])
    )
  );

  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<{ innings: number; idx: number } | null>(null);

  const onDragStart = (idx: number) => { dragIdx.current = idx; };
  const onDragEnter = (innings: number, idx: number) => setDragOver({ innings, idx });
  const onDragEnd = (innings: number) => {
    if (dragIdx.current !== null && dragOver !== null && dragOver.innings === innings && dragIdx.current !== dragOver.idx) {
      setBowlingOrders(prev => {
        const order = [...prev[innings]];
        const [item] = order.splice(dragIdx.current!, 1);
        order.splice(dragOver.idx, 0, item);
        return { ...prev, [innings]: order };
      });
    }
    dragIdx.current = null;
    setDragOver(null);
  };

  const oversPerBowler = (bowlers: any[]) => Math.floor(config.overs / bowlers.length);
  const extraOvers = (bowlers: any[]) => config.overs % bowlers.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {teams.map((battingTeam: any, inningsIdx: number) => {
        const bowlers = bowlingOrders[inningsIdx];
        const opb = oversPerBowler(bowlers);
        const extra = extraOvers(bowlers);

        return (
          <div key={inningsIdx} style={{
            border: `${t.borderWidth}px solid ${battingTeam.color ?? t.border}`,
            borderRadius: t.radiusLg, overflow: "hidden",
          }}>
            {/* Innings header */}
            <div style={{
              background: battingTeam.color ?? t.primary,
              padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{
                fontFamily: t.font, fontSize: 10, fontWeight: 700,
                color: "#fff", letterSpacing: 1.5, textTransform: "uppercase",
                marginRight: 4,
              }}>Innings {inningsIdx + 1}</div>
              <TeamLogo logoKey={battingTeam.logo} color="rgba(255,255,255,0.85)" size={13} />
              <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: "#fff", flex: 1 }}>
                {battingTeam.name}
              </span>
              <span style={{ fontFamily: t.font, fontSize: 11, color: "#fff" }}>batting</span>
            </div>

            {/* Bowling rotation */}
            <div style={{ background: t.card }}>
              {bowlers.map((bowler: any, bowlerIdx: number) => {
                const teamOvers = opb + (bowlerIdx < extra ? 1 : 0);
                let startOv = 1;
                for (let j = 0; j < bowlerIdx; j++) startOv += opb + (j < extra ? 1 : 0);
                const endOv = startOv + teamOvers - 1;
                const isTarget = dragOver?.innings === inningsIdx && dragOver?.idx === bowlerIdx && dragIdx.current !== bowlerIdx;

                return (
                  <div
                    key={bowler.name}
                    draggable
                    onDragStart={() => onDragStart(bowlerIdx)}
                    onDragEnter={() => onDragEnter(inningsIdx, bowlerIdx)}
                    onDragEnd={() => onDragEnd(inningsIdx)}
                    onDragOver={e => e.preventDefault()}
                    style={{
                      borderTop: `${t.borderWidth}px solid ${isTarget ? bowler.color ?? t.primary : t.border}`,
                      padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                      background: t.card,
                      opacity: dragIdx.current === bowlerIdx ? 0.4 : 1,
                      cursor: "grab", userSelect: "none",
                      transition: t.transition,
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: t.radius,
                      background: bowler.color ? bowler.color + "22" : t.cardAlt,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: t.font, fontSize: 11, fontWeight: 700,
                      color: bowler.color ?? t.textMuted, flexShrink: 0,
                    }}>{bowlerIdx + 1}</div>
                    <TeamLogo logoKey={bowler.logo} color={bowler.color ?? t.textMuted} size={13} />
                    <span style={{ fontFamily: t.fontSans, fontSize: 13, color: t.text, flex: 1 }}>{bowler.name}</span>
                    <div style={{
                      fontFamily: t.font, fontSize: 11, color: t.textDim,
                      background: t.cardAlt, padding: "2px 7px",
                      borderRadius: t.radius, fontWeight: 700,
                    }}>Ov {startOv}{endOv !== startOv ? `–${endOv}` : ""}</div>
                    <GripVertical size={16} color={t.textMuted} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
