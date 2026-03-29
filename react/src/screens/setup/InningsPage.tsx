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
        const teamColor = battingTeam.color ?? t.primary;

        return (
          <div
            key={battingTeam.name}
            draggable
            onDragStart={() => onOuterDragStart(inningsIdx)}
            onDragEnter={() => onOuterDragEnter(inningsIdx)}
            onDragEnd={onOuterDragEnd}
            onDragOver={e => e.preventDefault()}
            style={{
              border: `${t.borderWidth}px solid ${isOuterTarget ? teamColor : t.border}`,
              borderRadius: t.radius, overflow: "hidden",
              opacity: outerDragIdx.current === inningsIdx ? 0.4 : 1,
              transition: t.transition,
              boxShadow: isOuterTarget ? `0 0 12px ${teamColor}33` : "none",
            }}
          >
            
            <div style={{
              background: teamColor,
              padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 8,
              cursor: "grab", userSelect: "none",
            }}>
              <div style={{
                fontFamily: t.fontDisplay, fontSize: 11, fontWeight: 600,
                color: "rgba(255,255,255,0.85)", letterSpacing: 1.5, textTransform: "uppercase", marginRight: 4,
              }}>
                INN {inningsIdx + 1}
              </div>
              <TeamLogo logoKey={battingTeam.logo} color="rgba(255,255,255,0.85)" size={13} />
              <span style={{
                fontFamily: t.fontDisplay, fontSize: 15, fontWeight: 600,
                color: "#fff", flex: 1, textTransform: "uppercase", letterSpacing: 0.5,
              }}>
                {battingTeam.name}
              </span>
              <span style={{
                fontFamily: t.font, fontSize: 10, fontWeight: 700,
                color: "rgba(255,255,255,0.6)", letterSpacing: 1, textTransform: "uppercase",
                background: "rgba(0,0,0,0.2)", padding: "2px 8px", borderRadius: t.radius,
              }}>BAT</span>
              <GripVertical size={16} color="rgba(255,255,255,0.5)" />
            </div>

            {/* Bowling order rows */}
            <div style={{ background: t.card }}>
              {bowlers.map((bowler, bowlerIdx) => {
                const teamOvers = opb + (bowlerIdx < extra ? 1 : 0);
                let startOv = 1;
                for (let j = 0; j < bowlerIdx; j++) startOv += opb + (j < extra ? 1 : 0);
                const endOv = startOv + teamOvers - 1;
                const isInnerTarget = innerDragOver?.innings === battingTeam.name && innerDragOver?.idx === bowlerIdx && innerDragIdx.current !== bowlerIdx;
                const bowlerColor = bowler.color ?? t.textMuted;

                return (
                  <div
                    key={bowler.name}
                    draggable
                    onDragStart={e => { e.stopPropagation(); onInnerDragStart(bowlerIdx); }}
                    onDragEnter={e => { e.stopPropagation(); onInnerDragEnter(battingTeam.name, bowlerIdx); }}
                    onDragEnd={e => { e.stopPropagation(); onInnerDragEnd(battingTeam.name); }}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    style={{
                      borderTop: `${t.borderWidth}px solid ${isInnerTarget ? bowlerColor : t.border}`,
                      padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                      background: bowlerIdx % 2 === 0 ? t.card : t.bgAlt,
                      borderLeft: `3px solid ${bowlerColor}`,
                      opacity: innerDragIdx.current === bowlerIdx && innerDragOver?.innings === battingTeam.name ? 0.4 : 1,
                      cursor: "grab", userSelect: "none",
                      transition: t.transition,
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: t.radius,
                      background: bowlerColor + "18",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: t.font, fontSize: 11, fontWeight: 700,
                      color: bowlerColor, flexShrink: 0,
                    }}>{bowlerIdx + 1}</div>
                    <TeamLogo logoKey={bowler.logo} color={bowlerColor} size={13} />
                    <span style={{ fontFamily: t.fontSans, fontSize: 13, fontWeight: 600, color: t.text, flex: 1 }}>{bowler.name}</span>
                    <div style={{
                      fontFamily: t.font, fontSize: 11, color: t.textDim,
                      background: t.bgAlt, padding: "3px 8px",
                      borderRadius: t.radius, fontWeight: 700,
                      border: `1px solid ${t.border}`,
                    }}>Ov {startOv}{endOv !== startOv ? `\u2013${endOv}` : ""}</div>
                    <GripVertical size={14} color={t.textMuted} style={{ opacity: 0.5 }} />
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
