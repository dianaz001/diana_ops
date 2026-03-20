#!/usr/bin/env node
//
// set-tab-title.js — Claude Code UserPromptSubmit hook
// Reads the user's prompt from stdin JSON and sets the
// Windows Terminal tab title to a condensed 2-5 word summary.
//

const FILLER_STARTS = [
  'can you', 'could you', 'would you', 'please', 'i want to',
  'i would like to', "i'd like to", 'i need to', 'i want you to',
  'help me', "let's", 'lets', 'go ahead and', 'now', 'ok',
  'okay', 'hey', 'hi', 'hello', 'also', 'then',
  'please continue', 'continue with',
  'continue the conversation from where we left it off',
  'continue the conversation from where',
  'continue the conversation',
  'please continue the conversation',
  'why does my', 'why is my', 'why are my',
  'how do i', 'how can i', 'how would i',
  'make sure', 'make it so',
];

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'to', 'for', 'in', 'on', 'with', 'is', 'are',
  'this', 'that', 'it', 'my', 'of', 'and', 'or', 'but', 'be', 'do',
  'does', 'did', 'has', 'have', 'had', 'was', 'were', 'been', 'being',
  'so', 'if', 'at', 'by', 'from', 'as', 'into', 'not', 'no', 'just',
  'like', 'all', 'its', 'i', 'me', 'we', 'us', 'our', 'some', 'any',
  'there', 'here', 'very', 'really', 'way', 'also', 'about',
  'without', 'asking', 'further', 'questions', 'user', 'should',
  'when', 'where', 'how', 'what', 'why', 'which', 'who',
]);

function condense(prompt) {
  if (!prompt || typeof prompt !== 'string') return 'Juliz Portal Task';

  let text = prompt.trim().toLowerCase();

  if (text.includes('continue') && (text.includes('conversation') || text.includes('left it off') || text.includes('left off') || text.includes('previous'))) {
    return 'Continue Previous Task';
  }

  text = text.replace(/@\S+/g, '');
  text = text.replace(/https?:\/\/\S+/g, '');
  text = text.replace(/!?\[.*?\]\(.*?\)/g, '');

  const sorted = [...FILLER_STARTS].sort((a, b) => b.length - a.length);
  for (const filler of sorted) {
    if (text.startsWith(filler)) {
      text = text.slice(filler.length).trim();
      text = text.replace(/^[,\s]+/, '');
      break;
    }
  }

  const words = text
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));

  if (words.length === 0) return 'Juliz Portal Task';

  const count = Math.min(5, Math.max(3, words.length));
  const selected = words.slice(0, count);

  return selected
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const title = condense(data.prompt);
    process.stderr.write(`\x1b]0;${title}\x07`);
  } catch {
    // Silently ignore errors
  }
});
