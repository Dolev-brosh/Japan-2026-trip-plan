const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startIdx = code.indexOf('const SwipeableCard = ({');
const endIdx = code.indexOf('const DeleteConfirmModal = ({');
console.log(startIdx, endIdx);
