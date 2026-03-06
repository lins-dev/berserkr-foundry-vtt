/**
 * Dice Engine for Berserkr
 */

export interface TestResult {
  roll: any;
  success: boolean;
  critical: boolean;
  fumble: boolean;
  total: number;
  dr: number;
}

/**
 * Perform a Berserkr Test
 * @param {number} modifier - The attribute modifier
 * @param {number} dr - The Difficulty Rating
 * @param {string} label - Label for the roll
 * @returns {Promise<TestResult>}
 */
export async function performTest(modifier: number, dr: number, label: string): Promise<TestResult> {
  const formula = `1d20 + ${modifier}`;
  const roll = await new Roll(formula).evaluate();

  const dieResult = roll.dice[0].results[0].result;
  const total = roll.total;

  const critical = dieResult === 20;
  const fumble = dieResult === 1;
  const success = !fumble && (critical || total >= dr);

  // Send to chat
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: `${label} (DR ${dr})`,
  });

  return {
    roll,
    success,
    critical,
    fumble,
    total,
    dr,
  };
}
