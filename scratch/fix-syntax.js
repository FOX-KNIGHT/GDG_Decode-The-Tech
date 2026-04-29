const fs = require('fs');
const file = 'app/team/[teamId]/page.js';
let code = fs.readFileSync(file, 'utf8');

// Replace { \` ... \` } with { ` ... ` }
code = code.replace(/{\\`([^}]*)\\`}/g, (match, p1) => {
    return '{`' + p1.replace(/\\\$/g, '$') + '`}';
});

// Also replace inside style attributes
code = code.replace(/transformOrigin: \\`([^`]+)\\`/g, (match, p1) => {
    return 'transformOrigin: `' + p1.replace(/\\\$/g, '$') + '`';
});
code = code.replace(/strokeDasharray={\\`([^`]+)\\`}/g, (match, p1) => {
    return 'strokeDasharray={`' + p1.replace(/\\\$/g, '$') + '`}';
});
code = code.replace(/points={\\`([^`]+)\\`}/g, (match, p1) => {
    return 'points={`' + p1.replace(/\\\$/g, '$') + '`}';
});


// Just unescape all occurrences of \` and \$ where they are clearly meant to be string templates inside JSX brackets
code = code.replace(/\\`/g, '`').replace(/\\\$/g, '$');

fs.writeFileSync(file, code);
console.log("Fixed!");
