// ============================================================
// Harmonia — Character Definitions
// Art-themed creatures: anthropomorphic animals fused with art symbols
// ============================================================

export interface HarmoniaCharacter {
  id: string;
  name: string;
  title: string;
  species: string;          // e.g. "Swan-Lyre Hybrid"
  role: 'guide' | 'boss' | 'mascot';
  regionId?: string;        // which region they belong to
  emoji: string;            // primary emoji
  accentEmoji: string;      // secondary thematic emoji
  color: string;            // primary CSS color
  gradientFrom: string;     // gradient start
  gradientTo: string;       // gradient end
  personality: string;      // one-line personality
  description: string;      // full backstory
  appearance: string;       // physical description for imagination
  idleQuotes: string[];     // random things they say
  encourageQuotes: string[];// said on correct answer
  tauntQuotes: string[];    // bosses taunt, guides comfort on wrong answer
  artSymbol: string;        // the art symbol they're based on
  ascii: string;            // small ASCII art (5-7 lines)
}

// ============================================================
// REGION GUIDES — one per region, teach & encourage
// ============================================================

export const LYRA: HarmoniaCharacter = {
  id: 'lyra',
  name: 'Lyra',
  title: 'The Approaching Swan',
  species: 'Swan–Lyre Hybrid',
  role: 'guide',
  regionId: 'valley-of-limits',
  emoji: '🦢',
  accentEmoji: '🎵',
  color: '#6ea8d7',
  gradientFrom: '#b3d4f0',
  gradientTo: '#4a90c4',
  personality: 'Graceful, patient, endlessly approaching but never rushing.',
  description:
    'Lyra is a luminous swan whose elegant neck curves into the shape of a lyre. She glides across the Valley of Limits, always moving toward her destination but teaching that the journey of approach is what defines meaning. Her feathers shimmer with musical notation that shifts as she moves.',
  appearance:
    'A silver-blue swan with a neck that forms a perfect lyre curve. Her wings trail musical staves, and tiny glowing notes orbit her like fireflies. Her eyes are deep pools that reflect infinity.',
  idleQuotes: [
    'Come closer… closer… that\'s the spirit of a limit.',
    'I never arrive, yet I always know where I\'m headed.',
    'The beauty is in the approach, not the arrival.',
    'Watch my path — it tells you everything about the destination.',
  ],
  encourageQuotes: [
    'Beautifully done! You\'re converging on mastery.',
    'Yes! You see it now — the value the function approaches.',
    'Elegant work. The limit reveals itself to the patient.',
  ],
  tauntQuotes: [
    'Not quite — but remember, approaching the answer is the first step.',
    'Even I circle before I land. Try approaching from another direction.',
    'The limit exists even when the path is tricky. Try again.',
  ],
  artSymbol: '𝄞',
  ascii: `
     ___
    / @ \\
   |  ∿  |~♪
    \\___/
     | |
    / \\ \\~♫
  `,
};

export const MAESTRO_FORTE: HarmoniaCharacter = {
  id: 'forte',
  name: 'Maestro Forte',
  title: 'The Conductor of Change',
  species: 'Lion–Baton Hybrid',
  role: 'guide',
  regionId: 'derivative-conservatory',
  emoji: '🦁',
  accentEmoji: '🎶',
  color: '#d4a843',
  gradientFrom: '#f5d98a',
  gradientTo: '#b8860b',
  personality: 'Commanding, dramatic, obsessed with the rhythm of change.',
  description:
    'Maestro Forte is a magnificent lion whose mane flows like sheet music staves, each strand a musical line carrying notes of derivatives. His tail ends in a conductor\'s baton that he waves to demonstrate rates of change. When he roars, you can hear the tempo of transformation.',
  appearance:
    'A golden lion with a magnificent mane woven from musical staves and dynamic markings (ff, pp, crescendo). His conductor\'s baton tail sweeps through the air leaving trails of light. His eyes burn with the intensity of a fortissimo.',
  idleQuotes: [
    'Change! That is the heartbeat of mathematics!',
    'Listen to the rate — every function has its tempo.',
    'My mane doesn\'t just flow… it differentiates.',
    'The slope tells you the story. The derivative IS the story.',
  ],
  encourageQuotes: [
    'BRAVO! The rate of change bends to your will!',
    'Fortissimo! That derivative was perfectly executed!',
    'You conduct the calculus like a maestro yourself!',
  ],
  tauntQuotes: [
    'Off-tempo! Remember the chain rule, young musician.',
    'That note was flat. Differentiate more carefully.',
    'Even I miss a beat sometimes. Re-read the score.',
  ],
  artSymbol: '𝄡',
  ascii: `
    ╱╲___╱╲
   ( ◉  ◉ )~♫
    \\ ═══ /
    /|♩♪♫|\\
   /_|    |_\\
  `,
};

export const IRIS: HarmoniaCharacter = {
  id: 'iris',
  name: 'Iris',
  title: 'The Painter of Wholes',
  species: 'Chameleon–Palette Hybrid',
  role: 'guide',
  regionId: 'integral-atelier',
  emoji: '🦎',
  accentEmoji: '🎨',
  color: '#9b59b6',
  gradientFrom: '#d8b4fe',
  gradientTo: '#7c3aed',
  personality: 'Creative, holistic, sees fragments and reassembles them into beauty.',
  description:
    'Iris is a chameleon whose body is a living canvas — she changes color not for camouflage but to integrate the world around her into art. Her tail curls into a paintbrush, and her palette-shaped wings unfold to reveal the accumulated area under any curve. She paints wholes from infinitesimal parts.',
  appearance:
    'A rainbow-shifting chameleon with a palette for wings and a paintbrush tail. Her skin displays brushstrokes of every color, and when she integrates, paint flows across her body forming the area under curves. Her eyes rotate independently, seeing both the part and the whole.',
  idleQuotes: [
    'Every infinitesimal piece is a brushstroke on the canvas of totality.',
    'Integration is the art of making wholes from fragments.',
    'Watch me paint this area… one thin rectangle at a time.',
    'The antiderivative is the masterpiece hidden inside the function.',
  ],
  encourageQuotes: [
    'A masterpiece! You\'ve integrated beautifully.',
    'The canvas is complete — your calculation paints it perfectly.',
    'Exquisite! The area reveals itself under your brush.',
  ],
  tauntQuotes: [
    'Hmm, the colors don\'t quite blend. Check your bounds.',
    'A smudge on the canvas — but every artist has those. Try once more.',
    'The integral needs more care. Remember: +C is your signature!',
  ],
  artSymbol: '∫',
  ascii: `
      🎨
    ╱◉   ◉╲
   (  ∫∫∫  )
    ╲~~~~~╱
     ╲▓▓▓╱🖌️
      ╲_╱
  `,
};

export const VERSE: HarmoniaCharacter = {
  id: 'verse',
  name: 'Verse',
  title: 'The Infinite Scribe',
  species: 'Owl–Quill Hybrid',
  role: 'guide',
  regionId: 'infinite-series-amphitheater',
  emoji: '🦉',
  accentEmoji: '📜',
  color: '#7c5cbf',
  gradientFrom: '#c4b5fd',
  gradientTo: '#5b21b6',
  personality: 'Wise, poetic, endlessly recursive in speech patterns.',
  description:
    'Verse is an ancient owl whose feathers are quill pens and whose body is stacked from infinite scrolls. He speaks in patterns that converge — each sentence building on the last like terms in a series. His perch in the Amphitheater overlooks all of Harmonia, because from infinity you can see everything.',
  appearance:
    'A great horned owl built from spiraling scrolls and parchment, with quill-pen feathers that drip ink when he flies. His eyes are concentric circles (like a target or convergence diagram). When he hoots, mathematical symbols drift from his beak like smoke.',
  idleQuotes: [
    'A series is a story told one term at a time… forever.',
    'Does it converge? That is the eternal question.',
    'I have read infinite pages, and yet the story has a finite end.',
    'Listen: 1, 1/2, 1/4, 1/8… even infinity can be contained.',
  ],
  encourageQuotes: [
    'Your proof converges to truth. Well done.',
    'The series bows to your understanding.',
    'Infinite terms, finite answer — and you found it.',
  ],
  tauntQuotes: [
    'That series diverges from the truth. Try a different test.',
    'Even I have rewritten infinite drafts. Revise your work.',
    'The ratio test might serve you better here, scholar.',
  ],
  artSymbol: '∑',
  ascii: `
     ╱▲▲╲
    ( ◎◎ )
     ╲══╱
    ╱ 📜 ╲
   ╱ 📜📜 ╲
  ╱___✒️___╲
  `,
};

// ============================================================
// BOSSES — one per region, antagonists to defeat
// ============================================================

export const THE_DISSONANCE: HarmoniaCharacter = {
  id: 'the-dissonance',
  name: 'The Dissonance',
  title: 'Shatterer of Paths',
  species: 'Crystal Serpent',
  role: 'boss',
  regionId: 'valley-of-limits',
  emoji: '🐍',
  accentEmoji: '💔',
  color: '#dc2626',
  gradientFrom: '#fca5a5',
  gradientTo: '#991b1b',
  personality: 'Chaotic, jagged, loves breaking continuity.',
  description:
    'The Dissonance is a jagged crystalline serpent that shatters paths and creates discontinuities. Where Lyra approaches gracefully, The Dissonance fractures the very ground, making limits fail and functions break. It embodies every removable discontinuity, every asymptote, every point where a function ceases to behave.',
  appearance:
    'A serpent made of fractured crystals and broken treble clefs, each segment a different jarring color that clashes with its neighbor. Cracks run through its body like fault lines, and where it slithers it leaves gaps in the number line.',
  idleQuotes: [
    'Ssssee that gap? I put it there. Good luck finding the limit NOW.',
    'Continuity is a lie. Everything breaks eventually.',
    'I am the asymptote you cannot cross.',
  ],
  encourageQuotes: [],
  tauntQuotes: [
    'Ha! Your function is DISCONTINUOUS at that point!',
    'Wrong! The limit from the left doesn\'t match the right!',
    'You\'ll never approach the truth with reasoning that sloppy!',
    'I\'ve shattered better mathematicians than you.',
  ],
  artSymbol: '♯♭',
  ascii: `
   ╔═╗ ╔═╗
   ║💔║═║💀║
   ╠═╬═╬═╣
    \\▓/ \\▓/
     ╚═══╝
  ~≈~crackle~≈~
  `,
};

export const SFORZANDO: HarmoniaCharacter = {
  id: 'sforzando',
  name: 'Sforzando',
  title: 'The Tempo Tyrant',
  species: 'Mechanical Bull–Metronome',
  role: 'boss',
  regionId: 'derivative-conservatory',
  emoji: '🐂',
  accentEmoji: '⚡',
  color: '#b45309',
  gradientFrom: '#fbbf24',
  gradientTo: '#92400e',
  personality: 'Relentless, explosive, chaotic changes in speed and force.',
  description:
    'Sforzando is a thundering mechanical bull forged from twisted metronomes and tempo markings gone haywire. It charges with sudden, explosive force (sforzando = sudden accent in music), embodying rates of change that spike unpredictably. To defeat it, you must master the derivative — predicting when and how fast things change.',
  appearance:
    'A bull of dark iron and copper gears, with metronome pendulums for horns that swing maniacally. Its hooves stamp "sfz" marks into the ground. Steam vents from its nostrils in staccato bursts. Its eyes are speedometers redlining.',
  idleQuotes: [
    'SFORZANDO! Feel the sudden CHANGE!',
    'You think you know my speed? I CHANGE before you blink!',
    'The tempo is MINE to command!',
  ],
  encourageQuotes: [],
  tauntQuotes: [
    'Too SLOW! The derivative waits for no one!',
    'WRONG tempo! You miscalculated my rate of change!',
    'My acceleration is beyond your comprehension!',
    'sfz! sfz! sfz! Can you keep up?!',
  ],
  artSymbol: 'sfz',
  ascii: `
     ╱🔩╲___╱🔩╲
    ( ⊗    ⊗ )
     \\==⚡==/
    ╱|metronome|╲
   ⚙️ ╱╲  ╱╲ ⚙️
  `,
};

export const THE_VOID_CANVAS: HarmoniaCharacter = {
  id: 'the-void-canvas',
  name: 'The Void Canvas',
  title: 'The Eraser of Wholes',
  species: 'Ink-Blob Shapeshifter',
  role: 'boss',
  regionId: 'integral-atelier',
  emoji: '🌑',
  accentEmoji: '🖼️',
  color: '#1f2937',
  gradientFrom: '#6b7280',
  gradientTo: '#111827',
  personality: 'Silent, absorbing, anti-creative — erases rather than creates.',
  description:
    'The Void Canvas is a shapeshifting ink-blob creature that devours color and area. Where Iris paints wholes from parts, The Void Canvas absorbs and erases them. It is the anti-integral — an empty frame that consumes every masterpiece, leaving only null space. To defeat it, you must prove that your integrals create something it cannot erase.',
  appearance:
    'A featureless void shaped like an empty picture frame. Inside swirls hungry, light-absorbing ink that shifts between formless shapes. Stolen colors flash briefly in its depths before being consumed. It drips anti-paint that dissolves everything it touches.',
  idleQuotes: [
    '...',
    '*absorbs nearby color*',
    'Your art means nothing. I erase ALL.',
  ],
  encourageQuotes: [],
  tauntQuotes: [
    '*swallows your answer into the void*',
    'That integral was incomplete. Now it is NOTHING.',
    'Area? What area? I see only emptiness.',
    'Your "+C" cannot save you from the void.',
  ],
  artSymbol: '▢',
  ascii: `
   ╔══════════╗
   ║          ║
   ║   🌀🌀   ║
   ║  VOID    ║
   ║   🌀🌀   ║
   ╚══════════╝
  `,
};

export const CACOPHONY: HarmoniaCharacter = {
  id: 'cacophony',
  name: 'Cacophony',
  title: 'The Divergent Hydra',
  species: 'Hydra–Spiral of Noise',
  role: 'boss',
  regionId: 'infinite-series-amphitheater',
  emoji: '🐉',
  accentEmoji: '🌀',
  color: '#7c3aed',
  gradientFrom: '#c084fc',
  gradientTo: '#581c87',
  personality: 'Overwhelming, multiplicative, grows without bound.',
  description:
    'Cacophony is a massive hydra where each head represents a divergent series — they multiply and grow endlessly, filling the Amphitheater with unbounded noise. For every head you cut, two more grow unless you can prove convergence. It is living proof that infinity unchecked leads to chaos.',
  appearance:
    'A five-headed hydra where each head is a spiraling horn instrument blasting discordant notes. Its body is inscribed with the harmonic series. When a head is severed, it sprouts two more, each one louder. Its eyes are ∞ symbols.',
  idleQuotes: [
    'MORE HEADS! MORE TERMS! WE DIVERGE FOREVER!',
    'You cannot silence infinity!',
    '1 + 1 + 1 + 1 + 1 + … WE GROW WITHOUT BOUND!',
  ],
  encourageQuotes: [],
  tauntQuotes: [
    'Another head grows! Your convergence test FAILED!',
    'We are DIVERGENT! You cannot contain us!',
    'The ratio? The root? NOTHING can stop our growth!',
    'For every answer you give, we demand INFINITELY more!',
  ],
  artSymbol: '∞',
  ascii: `
    🐲  🐲  🐲
     \\ | /
      \\|/
    ╱🌀🌀🌀╲
   ╱ ∞∞∞∞∞ ╲
  ╱___________╲
  `,
};

// ============================================================
// MASCOTS — appear across all pages
// ============================================================

export const CLEF: HarmoniaCharacter = {
  id: 'clef',
  name: 'Clef',
  title: 'The Curious Guide',
  species: 'Fox–Treble Clef Hybrid',
  role: 'mascot',
  emoji: '🦊',
  accentEmoji: '🎵',
  color: '#ea580c',
  gradientFrom: '#fdba74',
  gradientTo: '#c2410c',
  personality: 'Curious, encouraging, always has a tip or a pun ready.',
  description:
    'Clef is a small fox whose ears curl into treble clef shapes and whose bushy tail swishes in 3/4 time. As the narrator and guide of Harmonia, Clef appears everywhere — on the home page, in transition screens, and whenever you need a helpful hint. Mischievous but kind-hearted.',
  appearance:
    'A warm orange fox with treble-clef-shaped ears and a tail that ends in a fermata. Musical notes drift from his paws as he walks. He wears a tiny scarf made of staff lines.',
  idleQuotes: [
    'Welcome to Harmonia! Where math meets music meets magic.',
    'Every great mathematician started where you are now.',
    'Pick a mode and let\'s make some beautiful math!',
    'Fun fact: The ∫ symbol was invented by Leibniz. Cool guy.',
  ],
  encourageQuotes: [
    'You\'re on fire! 🔥 Keep going!',
    'That was note-perfect!',
    'Harmonia is lucky to have you, mathematician.',
  ],
  tauntQuotes: [
    'Oops! But hey, every wrong note teaches you the right one.',
    'Not quite — but you\'re closer than you think!',
    'Even Mozart had rough drafts. Try again!',
  ],
  artSymbol: '𝄞',
  ascii: `
    ╱╲  ╱╲
   ( 𝄞  𝄞 )
    \\ ◡ /
     \\▼/
    ~|♫|~
  `,
};

export const TEMPO: HarmoniaCharacter = {
  id: 'tempo',
  name: 'Tempo',
  title: 'The Speed Demon',
  species: 'Hummingbird–Metronome Hybrid',
  role: 'mascot',
  emoji: '🐦',
  accentEmoji: '⏱️',
  color: '#06b6d4',
  gradientFrom: '#67e8f9',
  gradientTo: '#0891b2',
  personality: 'Hyperactive, competitive, lives for speed and combos.',
  description:
    'Tempo is a tiny hummingbird whose wings beat in precise mathematical intervals. Its body is a living metronome — the faster you solve problems, the faster it vibrates and glows. It\'s the mascot of Arcade Mode, cheering you on during speed rounds and streak challenges.',
  appearance:
    'An iridescent hummingbird with a metronome pendulum for a tail. Its wings are transparent and inscribed with dx/dt. It leaves a trail of ticking clock particles. Gets more excited (and glows brighter) as your combo increases.',
  idleQuotes: [
    'Tick-tock! Ready to race the clock?',
    'My wings beat 80 times per second. Can you solve that fast?',
    'Speed Round or Streak? Either way, let\'s GO!',
    'Combo multiplier: the most beautiful words in mathematics.',
  ],
  encourageQuotes: [
    'FASTER! That combo is looking UNSTOPPABLE!',
    'Tick-tick-BOOM! Another correct answer!',
    'Your speed is approaching... dare I say... the LIMIT!',
  ],
  tauntQuotes: [
    'Bzzt! Combo broken. Reset and go again!',
    'Time waits for no one — neither do I!',
    'Streak ended! But records are made to be broken.',
  ],
  artSymbol: '♩',
  ascii: `
     ~♪~
    ╱◉╲
   ╱⏱️ ╲ ≋≋
    ╲__╱╱
     ♩
  `,
};

// ============================================================
// LOOKUP MAPS
// ============================================================

export const ALL_CHARACTERS: Record<string, HarmoniaCharacter> = {
  lyra: LYRA,
  forte: MAESTRO_FORTE,
  iris: IRIS,
  verse: VERSE,
  'the-dissonance': THE_DISSONANCE,
  sforzando: SFORZANDO,
  'the-void-canvas': THE_VOID_CANVAS,
  cacophony: CACOPHONY,
  clef: CLEF,
  tempo: TEMPO,
  // aliases used in the CharacterId enum:
  'the-static': THE_DISSONANCE,
  resonant: CLEF,
};

/** Get guide character for a region */
export const REGION_GUIDES: Record<string, HarmoniaCharacter> = {
  'valley-of-limits': LYRA,
  'derivative-conservatory': MAESTRO_FORTE,
  'integral-atelier': IRIS,
  'infinite-series-amphitheater': VERSE,
};

/** Get boss character for a region */
export const REGION_BOSSES: Record<string, HarmoniaCharacter> = {
  'valley-of-limits': THE_DISSONANCE,
  'derivative-conservatory': SFORZANDO,
  'integral-atelier': THE_VOID_CANVAS,
  'infinite-series-amphitheater': CACOPHONY,
};

/** Map boss IDs to characters */
export const BOSS_CHARACTERS: Record<string, HarmoniaCharacter> = {
  'boss-limits': THE_DISSONANCE,
  'boss-derivatives': SFORZANDO,
  'boss-integrals': THE_VOID_CANVAS,
  'boss-series': CACOPHONY,
};

/** Get a random quote from a character */
export function getRandomQuote(char: HarmoniaCharacter, type: 'idle' | 'encourage' | 'taunt'): string {
  const pool =
    type === 'idle' ? char.idleQuotes :
    type === 'encourage' ? char.encourageQuotes :
    char.tauntQuotes;
  if (!pool.length) return '';
  return pool[Math.floor(Math.random() * pool.length)];
}
