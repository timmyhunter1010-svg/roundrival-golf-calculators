// Short how-to-play guides. Each one ends at its calculator, then RoundRival.

export interface Guide {
  slug: string;
  calc: string; // key in CALCS
  game: string;
  title: string;
  description: string;
  lede: string;
  glance: [string, string][];
  steps: string[];
  example: { setup: string; result: string };
  tips: string[];
  faq: { q: string; a: string }[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'skins', calc: 'skins', game: 'Skins',
    title: 'How to Play Skins in Golf',
    description: 'Skins golf rules in one minute: how skins work, carryovers, net vs gross, and how to tally up. Free skins calculator included.',
    lede: 'Every hole is a prize. Win it outright, take the skin.',
    glance: [['Players', '2–8'], ['Holes', '9 or 18'], ['Handicaps', 'Optional']],
    steps: [
      'Agree on what a skin is worth.',
      'Play each hole as normal.',
      'Lowest score on a hole wins the skin, but only if nobody ties it.',
      'Tie? With carryovers, the skin rolls to the next hole. Without, it’s gone.',
      'Count skins at the end and settle up.',
    ],
    example: { setup: 'Hole 1: everyone makes 4. Hole 2: Mike makes 3, everyone else 4.', result: 'Hole 1 carries over, so Mike wins 2 skins on hole 2.' },
    tips: ['Carryovers make the late holes exciting.', 'Play net so higher handicaps can win holes too.', 'Some groups require par or better to win a skin.'],
    faq: [
      { q: 'What happens if the last hole ties?', a: 'Those skins go unclaimed, unless your group plays a playoff or splits them.' },
      { q: 'How many people can play skins?', a: 'Any number, but 3 to 6 is the sweet spot. More players means fewer outright winners.' },
    ],
  },
  {
    slug: 'nassau', calc: 'nassau', game: 'Nassau',
    title: 'How to Play a Nassau in Golf',
    description: 'Nassau golf rules made simple: front 9, back 9, and overall matches, with handicaps. Free Nassau calculator included.',
    lede: 'Three matches in one round: front, back, and overall.',
    glance: [['Players', '2'], ['Holes', '18'], ['Format', 'Match play']],
    steps: [
      'Pick an amount for each of the three matches.',
      'Play match play: lower score wins the hole.',
      'Front 9: whoever wins more holes on 1–9 wins.',
      'Back 9: same for holes 10–18.',
      'Overall: whoever wins more holes over all 18 wins.',
    ],
    example: { setup: 'Jake wins the front 1 up. Mike wins the back 2 up and the overall 1 up.', result: 'Mike wins 2 of 3 matches, so Jake owes Mike one match’s worth.' },
    tips: ['A "$5 Nassau" means $5 on each of the three matches.', 'Use strokes off the low handicap.', 'Ties on a match are a push.'],
    faq: [
      { q: 'Why is it called a Nassau?', a: 'It’s named after the Nassau Country Club on Long Island, where the format became popular.' },
      { q: 'Can you play a Nassau with teams?', a: 'Yes. Use best ball for each team and score the three matches the same way.' },
    ],
  },
  {
    slug: 'match-play', calc: 'match', game: 'Match Play',
    title: 'How Match Play Works in Golf',
    description: 'Match play golf rules: winning holes, halves, what "3 & 2" means, and how handicap strokes work. Free match play calculator.',
    lede: 'Win holes, not strokes.',
    glance: [['Players', '2'], ['Holes', '9 or 18'], ['Handicaps', 'Off the low']],
    steps: [
      'Lower score wins the hole. A tie halves it.',
      'Keep track of how many holes up you are.',
      'Once you’re up more holes than are left, you win.',
      'Otherwise, whoever is up after the last hole wins.',
    ],
    example: { setup: 'Mike is 3 up with 2 holes to play.', result: 'Jake can’t catch up. Mike wins 3 & 2.' },
    tips: ['"Dormie" means you’re up as many holes as are left.', 'A blow-up hole only costs you one hole.', 'Concede short putts to speed things up.'],
    faq: [
      { q: 'How do strokes work in match play?', a: 'The lower handicap plays at zero. The other player gets the difference, one stroke on each of the hardest holes.' },
      { q: 'What does "all square" mean?', a: 'The match is tied.' },
    ],
  },
  {
    slug: 'best-ball', calc: 'bestball', game: 'Best Ball',
    title: 'How to Play Best Ball in Golf',
    description: 'Best ball (four-ball) golf rules: two-person teams, best score counts, match or stroke play, and handicaps. Free best ball calculator.',
    lede: 'Two vs two. Everyone plays their own ball. Best score counts.',
    glance: [['Players', '4'], ['Teams', '2 of 2'], ['Allowance', '90% (common)']],
    steps: [
      'Split into two teams of two.',
      'Everyone plays their own ball the whole hole.',
      'Each team’s lowest score is its team score.',
      'Match play: lower team score wins the hole. Stroke play: add them up.',
    ],
    example: { setup: 'Team A makes 4 and 6. Team B makes 5 and 5.', result: 'Team A’s 4 beats Team B’s 5. Team A wins the hole.' },
    tips: ['Your partner covers your bad holes, so swing free.', 'Play off the lowest of all four handicaps.', 'Also called four-ball.'],
    faq: [
      { q: 'Is best ball the same as a scramble?', a: 'No. In a scramble everyone hits from the best shot. In best ball everyone plays their own ball.' },
      { q: 'What handicap allowance is used?', a: 'The usual recommendation for four-ball match play is 90% of course handicap.' },
    ],
  },
  {
    slug: 'wolf', calc: 'wolf', game: 'Wolf',
    title: 'How to Play Wolf in Golf',
    description: 'Wolf golf rules for 3 or 4 players: the rotation, picking a partner, lone wolf and blind wolf. Free Wolf calculator included.',
    lede: 'One player is the Wolf. Pick a partner, or go it alone.',
    glance: [['Players', '3–4'], ['Holes', '18'], ['Format', 'Points']],
    steps: [
      'Rotate who is the Wolf each hole.',
      'The Wolf tees off first, then watches the others hit.',
      'After each drive, the Wolf can pick that player as a partner.',
      'Or go Lone Wolf (alone) for double points. Call Blind Wolf before anyone hits for triple.',
      'Best ball wins the hole. Losers pay winners the points.',
    ],
    example: { setup: 'Mike goes Lone Wolf and makes birdie. Everyone else makes par.', result: 'Mike wins 2 points from each of the other 3 players.' },
    tips: ['Pick a partner fast or you’ll be stuck with the last guy.', 'Lone Wolf on a hole you love.', 'Agree on multipliers before you tee off.'],
    faq: [
      { q: 'Who is Wolf on the last holes?', a: 'Many groups let the player in last place be Wolf on 17 and 18 to catch up.' },
      { q: 'Can you play Wolf with 3?', a: 'Yes. The Wolf picks one partner and plays 2 vs 1, or goes alone.' },
    ],
  },
  {
    slug: 'stableford', calc: 'stableford', game: 'Stableford',
    title: 'How Stableford Scoring Works',
    description: 'Stableford golf scoring explained: points for each score, modified Stableford, and net scoring. Free Stableford calculator.',
    lede: 'Points instead of strokes. Most points wins.',
    glance: [['Players', 'Any'], ['Holes', '9 or 18'], ['Handicaps', 'Full']],
    steps: [
      'Play every hole normally.',
      'Score points: bogey 1, par 2, birdie 3, eagle 4.',
      'Double bogey or worse is 0. Pick up and move on.',
      'Add up the points. Most points wins.',
    ],
    example: { setup: 'A player makes par, bogey, birdie, triple bogey.', result: '2 + 1 + 3 + 0 = 6 points. The triple only cost 2.' },
    tips: ['Great for mixed skill groups.', 'Speeds up play since you can pick up.', 'Modified Stableford rewards birdies more.'],
    faq: [
      { q: 'How many points is good?', a: 'In net Stableford, 36 points means you played to your handicap.' },
      { q: 'What is Modified Stableford?', a: 'Double bogey −3, bogey −1, par 0, birdie 2, eagle 5, albatross 8.' },
    ],
  },
  {
    slug: 'vegas', calc: 'vegas', game: 'Vegas',
    title: 'How to Play Vegas in Golf',
    description: 'Vegas golf game rules: team numbers, the 10+ rule, and the birdie flip. Free Vegas calculator for two-person teams.',
    lede: 'Two teams. Two scores become one number.',
    glance: [['Players', '4'], ['Teams', '2 of 2'], ['Format', 'Points']],
    steps: [
      'Split into two teams of two.',
      'Each hole, put your team’s two scores together, low first: 4 and 5 = 45.',
      'A score of 10 or more goes first: 4 and 10 = 104.',
      'Lower number wins the difference in points.',
      'Birdie flip: if your team makes birdie, the other team’s number flips (45 becomes 54).',
    ],
    example: { setup: 'Team A: 3 and 5 (birdie). Team B: 4 and 5.', result: 'A = 35. B flips to 54. Team A wins 19 points.' },
    tips: ['Keep the point value small. Swings get big fast.', 'One blow-up hole can cost a ton.', 'Agree on the birdie flip before teeing off.'],
    faq: [
      { q: 'Is Vegas played with handicaps?', a: 'Usually gross. Some groups give strokes, but it gets complicated fast.' },
      { q: 'What if both teams make birdie?', a: 'Both numbers flip, so it often evens out.' },
    ],
  },
  {
    slug: 'bingo-bango-bongo', calc: 'bbb', game: 'Bingo Bango Bongo',
    title: 'How to Play Bingo Bango Bongo',
    description: 'Bingo Bango Bongo golf rules: three points a hole for first on, closest, and first in. Free Bingo Bango Bongo calculator.',
    lede: 'Three points a hole. Anyone can win them.',
    glance: [['Players', '2–6'], ['Holes', '9 or 18'], ['Handicaps', 'Not needed']],
    steps: [
      'Bingo: first ball on the green.',
      'Bango: closest to the pin once everyone is on.',
      'Bongo: first ball in the hole.',
      'Farthest from the hole always plays first.',
      'Most points after the round wins.',
    ],
    example: { setup: 'Chris hits the green first. Jake is closest. Mike holes out first.', result: 'Each gets 1 point.' },
    tips: ['Perfect for groups with big skill gaps.', 'Playing order matters. Stick to farthest first.', 'Short hitters often win Bingo by playing first.'],
    faq: [
      { q: 'Do handicaps matter?', a: 'No. Order of play evens things out naturally.' },
      { q: 'What if nobody gets on the green?', a: 'Bingo goes to whoever gets on first, whenever that happens.' },
    ],
  },
  {
    slug: 'scramble', calc: 'scramble', game: 'Scramble',
    title: 'How a Golf Scramble Works',
    description: 'Golf scramble rules: everyone tees off, pick the best shot, repeat. Plus how scramble team handicaps are calculated.',
    lede: 'Everyone hits. Pick the best shot. Repeat.',
    glance: [['Team', '2–4'], ['Holes', '18'], ['Handicap', 'Team %']],
    steps: [
      'Everyone on the team tees off.',
      'Pick the best shot.',
      'Everyone plays their next shot from that spot.',
      'Repeat until the ball is in the hole. One team score per hole.',
    ],
    example: { setup: '4-person team with handicaps 4, 10, 16, 22.', result: 'USGA team handicap: 25% + 20% + 15% + 10% = 8 strokes.' },
    tips: ['Long hitter goes last off the tee.', 'Best putter reads first.', 'Many events require using each player’s drive a few times.'],
    faq: [
      { q: 'How is a 2-person scramble handicap figured?', a: '35% of the lower handicap plus 15% of the higher (USGA recommendation).' },
      { q: 'Is a scramble the same as best ball?', a: 'No. In best ball everyone plays their own ball the whole hole.' },
    ],
  },
  {
    slug: 'golf-handicaps', calc: 'coursehcp', game: 'Handicaps',
    title: 'How Golf Handicaps Work',
    description: 'Golf handicaps explained simply: Handicap Index, Course Handicap, slope and rating, and how strokes are given on each hole.',
    lede: 'How strokes are counted, in plain English.',
    glance: [['Index', 'Your ability'], ['Course Hcp', 'Strokes today'], ['Stroke index', 'Where they go']],
    steps: [
      'Handicap Index: your ability, from the best 8 of your last 20 rounds.',
      'Course Handicap: Index × (Slope ÷ 113) + (Rating − Par). Harder courses give more strokes.',
      'Each hole has a handicap (1 = hardest). Strokes go on the hardest holes first.',
      'Net score = your score minus the strokes on that hole.',
    ],
    example: { setup: 'Index 12.4 on a course with slope 130, rating 71.5, par 72.', result: '12.4 × 1.15 − 0.5 = 13.8, so 14 strokes. One on each of the 14 hardest holes.' },
    tips: ['In matches, play off the low: the best player plays at zero.', 'Plus handicaps give strokes back.', 'Check the scorecard for each hole’s handicap.'],
    faq: [
      { q: 'What is slope rating?', a: 'How much harder the course plays for a bogey golfer than a scratch golfer. 113 is average.' },
      { q: 'What is a stroke index?', a: 'The hole’s handicap number on the scorecard. It decides which holes get strokes first.' },
    ],
  },
];

export const guideFor = (calcKey: string) => GUIDES.find((g) => g.calc === calcKey);
