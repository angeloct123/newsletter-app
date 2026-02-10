const fs = require('fs');

const FILE = 'node_modules/vite/dist/node/chunks/dep-827b23df.js';
const ASM = 'package/dist/lexer.asm.js';

let vite = fs.readFileSync(FILE, 'utf8');
let asm = fs.readFileSync(ASM, 'utf8');

const marker = '/* es-module-lexer 1.3.0 */';
const start = vite.indexOf(marker);
if (start === -1) { console.log('ERR: Marker non trovato'); process.exit(1); }

const endPattern = '}));var E;';
const end = vite.indexOf(endPattern, start);
if (end === -1) { console.log('ERR: Fine WASM non trovata'); process.exit(1); }
const sectionEnd = end + endPattern.length;

console.log('Sezione da sostituire: ' + (sectionEnd - start) + ' chars');

asm = asm.replace(/\/\* es-module-lexer.*?\*\/\s*/, '');
asm = asm.replace('export function parse', 'function parse');

const wrapped = `/* es-module-lexer 1.3.0 - asm.js patch */
var parse$e, init;
(function() {
${asm}
parse$e = parse;
init = Promise.resolve();
})();`;

const patched = vite.substring(0, start) + wrapped + '\n' + vite.substring(sectionEnd);

fs.writeFileSync(FILE, patched);
console.log('Patch v2 completata!');
