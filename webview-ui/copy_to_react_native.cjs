const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'dist', 'index.html');
const destPath = path.join(__dirname, '..', 'src', 'screens', 'FamilyTree', 'webviewHtml.ts');

const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

const tsContent = `export const WEBVIEW_HTML_V2 = ${JSON.stringify(htmlContent)};\n`;

fs.writeFileSync(destPath, tsContent);
console.log('Successfully copied to ' + destPath);
