import Game from "@/components/Game";

// Deep link straight into a run (e.g. /play?seed=123). The title page uses the same component,
// and everything after first load is client-side state, so the game keeps working offline.
export default function PlayPage() {
  return <Game initial="play" />;
}
