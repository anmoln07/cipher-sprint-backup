// One of these shows on the results screen (rotates each run). Keep them true and short.
// Sources checked:
//  - Morse code: developed by Samuel Morse and Alfred Vail, 1837–1844 (first public telegraph line
//    message 1844). Still used by amateur radio operators and by aviation radio beacons that
//    identify themselves in Morse.
//  - Caesar: Suetonius, "Life of Julius Caesar" ch. 56: for confidential letters Caesar swapped each
//    letter for the one three places later (D for A). Suetonius describes letters (e.g. to Cicero and
//    friends), so we say "secret letters" rather than "military messages".
//  - A Caesar shift has only 25 useful keys, so trying them all is instant.
//  - Modern keys (e.g. AES-128) have 2^128 possibilities.
export const LESSONS: readonly string[] = [
  "Simple ciphers crack in seconds. Real encryption uses keys far too long to guess.",
  "Morse code is over 150 years old and still used today by radio hobbyists and aircraft beacons.",
  "Julius Caesar wrote secret letters by shifting every letter 3 places. That's why it's called a Caesar cipher.",
  "A Caesar shift only has 25 possible keys. A computer tries them all before you blink.",
  "Computers store every letter as 0s and 1s. Ours used 5 bits; real text uses 8 or more.",
  "A modern 128-bit key has more combinations than there are grains of sand on Earth, by a lot.",
];
