# Open questions for Anmol

None of these block shipping; each has a default already in the code.

1. **Event date?** No deadline was given, so nothing is scheduled around one.
2. **Club in-jokes for the word list?** Add them to `content/words.ts` (4 letters) and
   run `npm test` to make sure they pass the rude-word checks.
3. **Missing club words.** NODE, DISK, LOOP, BOOT and BIT were left out because they are one typo away from
   a rude word (the plan asked for that rule). NODE was in the plan's example list. Say if you want any back.
4. **Lesson line about Caesar.** The plan said "Caesar used a shift cipher to send military messages."
   Suetonius (*Life of Julius Caesar*, ch. 56) actually describes Caesar's *confidential letters*, so the
   line now says "Julius Caesar wrote secret letters by shifting every letter 3 places." The Morse line was
   also made more specific ("still used today by radio hobbyists and aircraft beacons"). Three extra true
   lines were added so the rotation feels fresh (25 Caesar keys, 5-bit vs 8-bit text, 128-bit keys).
5. **Rank thresholds** are the plan's (3 / 5 / 7). The e2e bot solves a word every ~3 s and gets 15, which
   says nothing about humans; please tune `content/ranks.ts` after the 5-person playtest.
6. **Sound.** Not added (optional in the plan, muted-by-default). Say if you want the speaker toggle.
7. **SOCIALTRACE styling.** The private `anmoln07/socialtrace` repo couldn't be read from the build
   environment, so the look uses the fallback tokens from the style guide (colours, type, nav pill,
   magnetic button). Worth a side-by-side glance once both are live.
8. **"How it works" overlay** shows once per device (remembered in `localStorage`). On the stall laptop it
   will only show for the very first visitor. If you'd rather show it every time on the laptop, say so.
