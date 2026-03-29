import { useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { TeamLogo } from "./TeamsPage";
import type { TeamDraft } from "./TeamsPage";

interface Props {
  config: any;
  battingOrder: TeamDraft[];
  setBattingOrder: (order: TeamDraft[]) => void;
  bowlingOrders: Record<string, TeamDraft[]>;
  setBowlingOrders: (orders: Record<string, TeamDraft[]>) => void;
}

export const InningsPage = ({ config, battingOrder, setBattingOrder, bowlingOrders, setBowlingOrders }: Props) => {
  const t = useTheme();

  // Outer drag state
  const outerDragIdx = useRef<number | null>(null);
  const [outerDragOver, setOuterDragOver] = useState<number | null>(null);

  const onOuterDragStart = (i: number) => { outerDragIdx.current = i; };
  const onOuterDragEnter = (i: number) => setOuterDragOver(i);
  const onOuterDragEnd = () => {
    if (outerDragIdx.current !== null && outerDragOver !== null && outerDragIdx.current !== outerDragOver) {
      const next = [...battingOrder];
      const [item] = next.splice(outerDragIdx.current, 1);
      next.splice(outerDragOver, 0, item);
      setBattingOrder(next);
    }
    outerDragIdx.current = null;
    setOuterDragOver(null);
  };

  // Inner drag state
  const innerDragIdx = useRef<number | null>(null);
  const [innerDragOver, setInnerDragOver] = useState<{ innings: string; idx: number } | null>(null);

  const onInnerDragStart = (idx: number) => { innerDragIdx.current = idx; };
  const onInnerDragEnter = (innings: string, idx: number) => setInnerDragOver({ innings, idx });
  const onInnerDragEnd = (innings: string) => {
    if (innerDragIdx.current !== null && innerDragOver?.innings === innings && innerDragIdx.current !== innerDragOver.idx) {
      const order = [...(bowlingOrders[innings] ?? [])];
      const [item] = order.splice(innerDragIdx.current!, 1);
      order.splice(innerDragOver!.idx, 0, item);
      setBowlingOrders({ ...bowlingOrders, [innings]: order });
    }
    innerDragIdx.current = null;
    setInnerDragOver(null);
  };

  const oversPerBowler = (bowlers: TeamDraft[]) => Math.floor(config.overs / bowlers.length);
  const extraOvers = (bowlers: TeamDraft[]) => config.overs % bowlers.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {battingOrder.map((battingTeam, inningsIdx) => {
        const bowlers = bowlingOrders[battingTeam.name] ?? [];
        const opb = bowlers.length > 0 ? oversPerBowler(bowlers) : 0;
        const extra = bowlers.length > 0 ? extraOvers(bowlers) : 0;
        const isOuterTarget = outerDragOver === inningsIdx && outerDragIdx.current !== inningsIdx;

        return (
          <div
            key={battingTeam.name}
            draggable
            onDragStart={() => onOuterDragStart(inningsIdx)}
            onDragEnter={() => onOuterDragEnter(inningsIdx)}
            onDragEnd={onOuterDragEnd}
            onDragOver={e => e.preventDefault()}
            style={{
              border: `${t.borderWidth}px solid ${isOuterTarget ? battingTeam.color ?? t.primary : battingTeam.color ?? t.border}`,
              borderRadius: t.radiusLg, overflow: "hidden",
              opacity: outerDragIdx.current === inningsIdx ? 0.4 : 1,
              transition: t.transition,
            }}
          >
            <div style={{
              background: battingTeam.color ?? t.primary, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 8,
              cursor: "grab", userSelect: "none",
            }}>
              <div style={{ fontFamily: t.font, fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase", marginRight: 4 }}>
                Innings {inningsIdx + 1}
              </div>
              <TeamLogo logoKey={battingTeam.logo} color="rgba(255,255,255,0.85)" size={13} />
              <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: "#fff", flex: 1 }}>
                {battingTeam.name}
              </span>
              <span style={{ fontFamily: t.font, fontSize: 11, color: "#fff", marginRight: 6 }}>batting</span>
              <GripVertical size={16} color="rgba(255,255,255,0.7)" />
            </div>

            <div style={{ background: t.card }}>
              {bowlers.map((bowler, bowlerIdx) => {
                const teamOvers = opb + (bowlerIdx < extra ? 1 : 0);
                let startOv = 1;
                for (let j = 0; j < bowlerIdx; j++) startOv += opb + (j < extra ? 1 : 0);
                const endOv = startOv + teamOvers - 1;
                const isInnerTarget = innerDragOver?.innings === battingTeam.name && innerDragOver?.idx === bowlerIdx && innerDragIdx.current !== bowlerIdx;

                return (
                  <div
                    key={bowler.name}
                    draggable
                    onDragStart={e => { e.stopPropagation(); onInnerDragStart(bowlerIdx); }}
                    onDragEnter={e => { e.stopPropagation(); onInnerDragEnter(battingTeam.name, bowlerIdx); }}
                    onDragEnd={e => { e.stopPropagation(); onInnerDragEnd(battingTeam.name); }}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    style={{
                      borderTop: `${t.borderWidth}px solid ${isInnerTarget ? bowler.color ?? t.primary : t.border}`,
                      padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                      background: t.card,
                      opacity: innerDragIdx.current === bowlerIdx && innerDragOver?.innings === battingTeam.name ? 0.4 : 1,
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
