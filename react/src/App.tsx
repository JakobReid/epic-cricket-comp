import { useState } from "react";
import { SCREENS } from "./theme";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { MatchStoreProvider } from "./store/matchStore";
import { NavBar } from "./components/NavBar";
import { MatchSetup } from "./screens/setup/MatchSetup";
import { MatchPage } from "./screens/MatchPage";
import { Home } from "./screens/Home";

function AppInner() {
  const t = useTheme();
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [matchId, setMatchId] = useState<string | null>(null);

  const goToMatch = (id: string) => { setMatchId(id); setScreen(SCREENS.MATCH); };
  const goHome = () => { setMatchId(null); setScreen(SCREENS.HOME); };

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, color: t.text,
      fontFamily: t.fontSans, position: "relative", overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; }
        button { outline: none; }
        button:active { opacity: 0.7; transform: scale(0.97); }
        ::-webkit-scrollbar { width: 0; }

        .page-wrap { max-width: 640px; margin: 0 auto; padding: 16px 16px 24px; }
        .nav-inner  { max-width: 640px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; }
        .preset-icon-wrap { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .preset-icon-img  { width: 24px; height: 24px; }

        @media (min-width: 860px) {
          .page-wrap { max-width: 820px; padding: 24px 28px 32px; }
          .nav-inner  { max-width: 820px; }
          .preset-icon-wrap { width: 52px; height: 52px; }
          .preset-icon-img  { width: 32px; height: 32px; }
        }
        @media (min-width: 1200px) {
          .page-wrap { max-width: 1000px; padding: 32px 36px 40px; }
          .nav-inner  { max-width: 1000px; }
          .preset-icon-wrap { width: 60px; height: 60px; }
          .preset-icon-img  { width: 38px; height: 38px; }
        }
      `}</style>

      <NavBar onHome={goHome} />

      <div style={{ width: "100%" }}>
        {screen === SCREENS.HOME  && <Home onCreateMatch={() => setScreen(SCREENS.SETUP)} onOpenMatch={goToMatch} />}
        {screen === SCREENS.SETUP && <MatchSetup onStart={goToMatch} onCancel={goHome} />}
        {screen === SCREENS.MATCH && matchId && <MatchPage matchId={matchId} onBack={goHome} />}
      </div>
    </div>
  );
}

export default function EpicCricketComp() {
  return (
    <ThemeProvider>
      <MatchStoreProvider>
        <AppInner />
      </MatchStoreProvider>
    </ThemeProvider>
  );
}
