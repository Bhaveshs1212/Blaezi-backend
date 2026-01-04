const fs = require('fs');

const filePath = 'src/services/striverSheetService.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add id field to all problems that don't have it yet
content = content.replace(/\{ problemNumber: (\d+),/g, '{ id: "striver-$1", problemNumber: $1,');

fs.writeFileSync(filePath, content);

console.log('✅ Successfully added unique IDs to all DSA problems');
console.log('   Format: id: "striver-1", id: "striver-2", etc.');
