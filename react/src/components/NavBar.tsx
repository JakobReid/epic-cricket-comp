import { useTheme } from "../ThemeContext";
import fieldLineal from "../assets/criquet-icons/field-lineal.png";

export const NavBar = ({ onHome }: { onHome: () => void }) => {
  const t = useTheme();

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ background: t.headerBg, padding: "10px 14px" }}>
        <div className="nav-inner">
          <button onClick={onHome} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: t.radius,
              background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src={fieldLineal} style={{ width: 16, height: 16, filter: "brightness(0) invert(1)" }} />
            </div>
            <span style={{
              fontFamily: t.font, fontSize: 13, fontWeight: 700,
              color: t.headerText, letterSpacing: 1.5,
            }}>ECC</span>
          </button>
        </div>
      </div>
    </div>
  );
};
