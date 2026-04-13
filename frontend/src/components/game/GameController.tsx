import { useGame } from '@/contexts/GameContext';
import { AnimatePresence, motion } from 'framer-motion';
import { TitleScreen } from './TitleScreen';
import { StoryIntro } from './StoryIntro';
import { CharacterSelect } from './CharacterSelect';
import { WorldMap } from './WorldMap';
import { LevelIntro } from './LevelIntro';
import { CloudportGame } from './CloudportGame';
import { StarBridgeGame } from './StarBridgeGame';
import { HiddenReefGame } from './HiddenReefGame';
import { EchoBayGame } from './EchoBayGame';
import { HeartIsle } from './HeartIsle';
import { CognitiveReport } from './CognitiveReport';

const screenVariants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 1.02, y: -8 },
};

function getScreen(screen: string) {
  switch (screen) {
    case 'title': return <TitleScreen />;
    case 'story-intro': return <StoryIntro />;
    case 'character-select': return <CharacterSelect />;
    case 'world-map': return <WorldMap />;
    case 'level-intro': return <LevelIntro />;
    case 'cloudport': return <CloudportGame />;
    case 'star-bridge': return <StarBridgeGame />;
    case 'hidden-reef': return <HiddenReefGame />;
    case 'echo-bay': return <EchoBayGame />;
    case 'heart-isle': return <HeartIsle />;
    case 'report': return <CognitiveReport />;
    default: return <TitleScreen />;
  }
}

export function GameController() {
  const { state } = useGame();
  const isReport = state.screen === 'report';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.screen}
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className={`w-full ${isReport ? 'min-h-screen' : 'h-screen overflow-hidden'}`}
      >
        {getScreen(state.screen)}
      </motion.div>
    </AnimatePresence>
  );
}
