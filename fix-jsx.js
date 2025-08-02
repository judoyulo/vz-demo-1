const fs = require("fs");

// Read the file
const content = fs.readFileSync("pages/app.tsx", "utf8");

// Count opening and closing braces for JSX conditional blocks
let conditionalBraces = 0;
let divTags = 0;
let closingDivTags = 0;

// Simple regex patterns
const conditionalOpen = /\{showChatModal && selectedChat && \(/g;
const conditionalClose = /\)\}/g;
const divOpen = /<div/g;
const divClose = /<\/div>/g;

// Count matches
const conditionalOpens = content.match(conditionalOpen) || [];
const conditionalCloses = content.match(conditionalClose) || [];
const divOpens = content.match(divOpen) || [];
const divCloses = content.match(divClose) || [];

console.log("JSX Structure Analysis:");
console.log("=======================");
console.log(`Conditional opens: ${conditionalOpens.length}`);
console.log(`Conditional closes: ${conditionalCloses.length}`);
console.log(`Div opens: ${divOpens.length}`);
console.log(`Div closes: ${divCloses.length}`);
console.log(
  `Balance: ${conditionalOpens.length - conditionalCloses.length} (should be 0)`
);
console.log(`Div balance: ${divOpens.length - divCloses.length} (should be 0)`);

// Find line numbers for conditional blocks
const lines = content.split("\n");
let conditionalOpenLine = -1;
let conditionalCloseLine = -1;

lines.forEach((line, index) => {
  if (line.includes("{showChatModal && selectedChat && (")) {
    conditionalOpenLine = index + 1;
  }
  if (line.includes(")}")) {
    conditionalCloseLine = index + 1;
  }
});

console.log(`\nConditional block opens at line: ${conditionalOpenLine}`);
console.log(`Last conditional close at line: ${conditionalCloseLine}`);

// Check the end of the file
const lastLines = lines.slice(-10);
console.log("\nLast 10 lines:");
lastLines.forEach((line, index) => {
  console.log(`${lines.length - 10 + index + 1}: ${line.trim()}`);
});
