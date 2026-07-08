const fs = require('fs');
const path = require('path');

const pagesDir = './src/page';

fs.readdirSync(pagesDir).forEach(pageFolder => {
  const pagePath = path.join(pagesDir, pageFolder, 'page.tsx');
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    let original = content;

    // Make sure the main div has bg-black
    // Look for <div className="... h-screen" or <div className="... min-h-screen"
    // that don't already have bg-black
    
    // Using regex to replace className="..." with bg-black if it's the outer container.
    // We can just find 'min-h-screen' and 'h-screen' and inject 'bg-black ' if missing.
    content = content.replace(/(className="[^"]*)(min-h-screen|h-screen)([^"]*")/g, (match, p1, p2, p3) => {
      if (p1.includes('bg-black') || p3.includes('bg-black')) return match;
      return p1 + p2 + ' bg-black' + p3;
    });

    if (content !== original) {
      fs.writeFileSync(pagePath, content, 'utf8');
      // console.log('Fixed ' + pagePath);
    }
  }
});
