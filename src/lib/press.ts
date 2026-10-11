export interface PressInput { stake: number; pressStake: number; down: number; holesLeft: number }
export interface PressCase { label: string; amount: number }

/** Every way the rest of the match can go, and what you end up with (original bet + press). */
export function pressScenarios({ stake, pressStake, down, holesLeft }: PressInput): PressCase[] {
  const out: PressCase[] = [];
  if (holesLeft > down) out.push({ label: `Win the rest by ${down + 1}+`, amount: stake + pressStake });
  if (down >= 1 && holesLeft >= down) out.push({ label: `Win the rest by ${down}`, amount: pressStake });
  const top = Math.min(down - 1, holesLeft);
  if (top >= 1) out.push({ label: top === 1 ? 'Win the rest by 1' : `Win the rest by 1–${top}`, amount: pressStake - stake });
  if (down === 0) out.push({ label: 'Halve the rest', amount: 0 });
  else out.push({ label: 'Halve the rest', amount: -stake });
  out.push({ label: 'Lose the rest', amount: -stake - pressStake });
  return out;
}

/** True when the original bet can no longer be won or halved. */
export const originalIsDead = (down: number, holesLeft: number) => down > holesLeft;
