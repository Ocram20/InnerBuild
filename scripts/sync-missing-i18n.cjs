const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');
const sourceFile = path.join(localesDir, 'it.json');
const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

function fillMissingKeys(source, target) {
  let isMissing = false;
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
        isMissing = true;
      }
      if (fillMissingKeys(source[key], target[key])) {
        isMissing = true;
      }
    } else {
      if (target[key] === undefined || target[key] === null) {
        target[key] = source[key];
        isMissing = true;
        console.log(`Missing key added: ${key} = ${source[key]}`);
      }
    }
  }
  return isMissing;
}

const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'it.json');

let hasUpdates = false;
for (const file of files) {
  const filePath = path.join(localesDir, file);
  try {
    const targetData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`\nSyncing ${file}...`);
    const wasUpdated = fillMissingKeys(sourceData, targetData);
    if (wasUpdated) {
      fs.writeFileSync(filePath, JSON.stringify(targetData, null, 2) + '\n', 'utf8');
      console.log(`Updated ${file}`);
      hasUpdates = true;
    } else {
      console.log(`${file} is up to date.`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

if (hasUpdates) {
  console.log('\n✅ Successfully synchronized missing i18n keys!');
} else {
  console.log('\n✅ No missing keys found.');
}
