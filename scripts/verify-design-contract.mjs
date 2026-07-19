import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const allowedPrefixes = ['src/design/'];
const extensions = new Set(['.ts', '.tsx', '.css']);
const forbidden = [
  { name: 'hard-coded hex color', regex: /#[0-9a-fA-F]{3,8}\b/g },
  { name: 'decorative gradient', regex: /\b(?:bg-gradient|from-|via-|to-)[\w[\]-]+/g },
  { name: 'oversized shadow', regex: /\bshadow-(?:xl|2xl)\b/g },
  { name: 'arbitrary color utility', regex: /\b(?:bg|text|border)-\[#[0-9a-fA-F]{3,8}\]/g },
];
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
const violations = [];
for (const file of walk(path.join(root, 'src'))) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if (
    !extensions.has(path.extname(file)) ||
    allowedPrefixes.some((prefix) => rel.startsWith(prefix))
  )
    continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const rule of forbidden) {
    for (const match of text.matchAll(rule.regex))
      violations.push(`${rel}: ${rule.name}: ${match[0]}`);
  }
  if (rel.startsWith('src/pages/') && /\bfetch\s*\(/.test(text))
    violations.push(`${rel}: page components must not call fetch directly`);
}
const required = [
  'src/components/market/MarketCard.tsx',
  'src/components/market/OutcomeButton.tsx',
  'src/components/trading/TradePanel.tsx',
  'src/design/globals.css',
  '.codex/skills/prediction-market-ui/SKILL.md',
  'AGENTS.md',
];
for (const rel of required)
  if (!fs.existsSync(path.join(root, rel)))
    violations.push(`${rel}: required design-governance file missing`);
if (violations.length) {
  console.error('Design contract failed:\n' + violations.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}
console.log('Design contract passed: semantic tokens and required primitives are present.');
