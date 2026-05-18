const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// The file has a :root block and a .dark block.
// I will just replace :root { ... } with the contents of .dark { ... }
// Actually, it's easier to just force dark mode on html.
