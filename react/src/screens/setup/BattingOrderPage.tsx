import { useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { TeamLogo } from "./TeamsPage";

export const BattingOrderPage = ({ teams }: any) => {
  const t = useTheme();
  const [order, setOrder] = useState<any[]>(teams);
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const onDragStart = (i: number) => { dragIdx.current = i; };
  const onDragEnter = (i: number) => setDragOver(i);
  const onDragEnd = () => {
    if (dragIdx.current !== null && dragOver !== null && dragIdx.current !== dragOver) {
      const next = [...order];
      const [item] = next.splice(dragIdx.current, 1);
      next.splice(dragOver, 0, item);
      setOrder(next);
    }
    dragIdx.current = null;
    setDragOver(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {order.map((team: any, i: number) => (
        <div
          key={team.name}
          draggable
          onDragStart={() => onDragStart(i)}
          onDragEnter={() => onDragEnter(i)}
          onDragEnd={onDragEnd}
          onDragOver={e => e.preventDefault()}
          style={{
            background: t.card,
            border: `${t.borderWidth}px solid ${team.color ?? t.border}`,
            borderRadius: t.radius, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 14,
            opacity: dragIdx.current === i ? 0.4 : 1,
            cursor: "grab", userSelect: "none",
            transition: t.transition,
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: t.radius,
            background: team.color ? team.color + "22" : t.cardAlt,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: t.font, fontSize: 13, fontWeight: 700,
            color: team.color ?? t.textMuted,
          }}>{i + 1}</div>
          <TeamLogo logoKey={team.logo} color={team.color ?? t.textMuted} size={14} />
          <span style={{ fontFamily: t.fontSans, fontSize: 14, color: t.text, flex: 1 }}>{team.name}</span>
          <GripVertical size={16} color={t.textMuted} />
        </div>
      ))}
    </div>
  );
};
