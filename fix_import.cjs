const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect, useRef } from 'react';");
// Also check if it just imports { useState, useEffect }
code = code.replace(/import \{ useState, useEffect \} from 'react';/, "import { useState, useEffect, useRef } from 'react';");

fs.writeFileSync('src/App.tsx', code);
