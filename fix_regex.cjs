const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/day\.transitDetails\.split\(\/\?\n\/\)/g, 'day.transitDetails.split(/\\r?\\n/)');
code = code.replace(/day\.description\.split\(\/\?\n\/\)/g, 'day.description.split(/\\r?\\n/)');
// Wait, in my grep output it was literally `{day.transitDetails.split(/?` followed by a newline, because `\r` became carriage return.
