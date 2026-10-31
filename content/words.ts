// Word lists for Cipher Sprint. All uppercase A–Z, friendly and easy to spell.
// Rules (enforced by tests/content.test.ts):
//  - WORDS_4: exactly 4 letters. WORDS_5: exactly 5 letters (Caesar only).
//  - No duplicates inside a list.
//  - No word that is one typo away from something rude (so a stall screen never shows one).
//    That filter is why some obvious club words (NODE, DISK, LOOP, BOOT, BIT) are not here.

/** Club + tech words. */
const CLUB = [
  "HACK", "BYTE", "CODE", "DATA", "WIFI", "PING", "LOGO", "BLOG", "CHIP", "FILE", "LINK", "CHAT",
  "USER", "ZOOM", "SAVE", "COPY", "TEXT", "FONT", "ICON", "MENU", "SCAN", "SYNC", "TYPE", "KEYS",
  "MAIL", "PAGE", "ROOT", "TECH", "WIKI", "CLUB", "QUIZ", "GEEK", "MODE", "GRID", "BEAM", "UNDO",
  "BEEP", "BOLT", "GEAR", "ZONE",
];

/** Everyday words. */
const EVERYDAY = [
  "CHAI", "COOL", "MOON", "TREE", "BIKE", "GAME", "CAKE", "RAIN", "STAR", "LAMP", "FISH", "SING",
  "BIRD", "BLUE", "CAMP", "CARD", "COIN", "DESK", "DOOR", "DRUM", "EGGS", "FERN", "FIRE", "FROG",
  "GIFT", "GOLD", "HAND", "HOPE", "IDEA", "KITE", "KIND", "LEAF", "LIME", "LION", "MINT", "NEST",
  "NOTE", "OVEN", "PARK", "PEAR", "PLAN", "PLAY", "POND", "RICE", "RING", "ROAD", "ROPE", "ROSE",
  "SAND", "SEED", "SHOE", "SNOW", "SOAP", "SOUP", "TACO", "TEAM", "TENT", "TIME", "TOYS", "TUBA",
  "WAVE", "WIND", "WOLF", "YARN", "ZERO", "BEAR", "BOAT", "BONE", "BUSY", "CALM", "CAVE", "CLAY",
  "COAT", "DEER", "DOVE", "DUNE", "EASY", "ECHO", "FOAM", "GLOW", "GOAT", "HARP", "HERO", "JAZZ",
  "KIWI", "LAKE", "LOAF", "MAPS", "MASK", "MAZE", "MOTH", "NAAN", "OWLS", "PALM", "PEAK", "PINE",
  "PLUM", "POEM", "RACE", "RAFT", "REEF", "ROBE", "SAIL", "SALT", "SEAL", "SILK", "SOFA", "SPIN",
  "SURF", "SWAN", "TAPE", "TIDE", "TOAD", "TUNE", "VASE", "VEST", "WALL", "WISH", "WOOD", "YOGA",
  "ZINC", "FLAG", "HIKE", "IRIS", "JOKE", "KING", "MUSE", "NOON", "OPAL", "PAWS", "RUBY", "SOFT",
  "TAXI", "VIEW", "WARM", "YAWN", "CHEF", "CROW", "DISH", "FAIR", "FIGS", "GLUE", "HUGS", "KNOT",
  "LAZY", "MEOW", "NAPS", "OATS", "PEAS", "SNAP", "STEP", "SWIM", "VOTE", "WAKE", "WORD", "ZEST",
];

/** 4-letter words: used by Caesar, Morse and Numbers. */
export const WORDS_4: readonly string[] = [...CLUB, ...EVERYDAY];

/** 5-letter words: Caesar only, picked now and then. */
export const WORDS_5: readonly string[] = [
  "PIZZA", "HONEY", "JUICE", "MANGO", "SHELL", "APPLE", "BREAD", "CLOUD", "DANCE", "EAGLE",
  "FLAME", "GRAPE", "HAPPY", "LEMON", "MAGIC", "MUSIC", "OCEAN", "PANDA", "PIANO", "QUEST",
  "RADIO", "ROBOT", "SMILE", "SPOON", "TIGER", "TOAST", "TRAIN", "WATER", "ZEBRA", "LASER",
  "PIXEL", "MOUSE", "CANDY", "OTTER", "PLANT", "FLUTE",
];

/** Chance a Caesar puzzle uses a 5-letter word. */
export const CAESAR_FIVE_CHANCE = 0.25;
