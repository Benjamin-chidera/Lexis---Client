const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Change hardcoded dark backgrounds to modern black
    content = content.replace(/bg-\[#06080f\]/g, 'bg-black');
    content = content.replace(/bg-\[#09090b\]/g, 'bg-black');
    
    // 2. Change buttons from purple to white monochrome
    // A regex that matches typical primary button classes containing bg-purple-600
    // Example: "bg-purple-600 hover:bg-purple-500 text-white ..."
    // Let's just find and replace specific string fragments to be safer.
    content = content.replace(/bg-purple-600 hover:bg-purple-[567]00 text-white/g, 'bg-white hover:bg-zinc-200 text-black border border-white/20');
    content = content.replace(/bg-purple-600 hover:bg-purple-500/g, 'bg-white hover:bg-zinc-200 text-black border border-white/20');
    
    // 3. For any remaining bg-purple-600 in buttons that wasn't caught
    content = content.replace(/className="([^"]*)bg-purple-600([^"]*text-white)?([^"]*)"/g, (match, p1, p2, p3) => {
        // If it's an icon badge or ring, don't change. 
        if (p1.includes('w-') && p1.includes('h-') && !p1.includes('px-')) return match;
        
        let newClasses = p1 + 'bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/10 border border-white/20' + p3;
        // remove text-white
        newClasses = newClasses.replace(/text-white/g, '');
        // remove hover:bg-purple-*
        newClasses = newClasses.replace(/hover:bg-purple-[0-9]{3}/g, '');
        // clean up extra spaces
        newClasses = newClasses.replace(/\s+/g, ' ');
        return `className="${newClasses}"`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      // console.log('Updated: ' + filePath);
    }
  }
});
