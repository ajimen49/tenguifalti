const fs = require("fs");
const path = require("path");

const config = require("./config");
const { normalizeId, detectType, detectTags } = require("./utils");

const inputPath = path.join(__dirname, "input", `${config.collectionId}.txt`);
const raw = fs.readFileSync(inputPath, "utf8");

const lines = raw.split("\n");

const cards = [];
const ids = new Set();
const errors = [];

lines.forEach((line, i) => {
  line = line.trim();
  if (!line) return;

// Ignorar línies que no són cartes reals
if (
  line.startsWith("Listado") ||
  line.includes(" -- ") && !line.match(/^\S+\s*-\s*\S+/) ||
  line.match(/^[A-Za-z\s]+$/) // noms d'equip sols
) {
  return;
}
  
  const match = line.match(/^([A-Za-z0-9\/\-\s]+?)\s*-\s*(.+)$/);

// validar que ID comença per número o prefix vàlid
if (!match || !match[1].match(/^\d|^(BI|AO|NAO|DAO|NM|CU|TK|ND)/)) {
  return;
}

  let id = normalizeId(match[1]);
  let name = match[2];

  if (ids.has(id)) {
  errors.push(`Duplicat ID: ${id} (línia ${i}) -> ${name}`);
}
  ids.add(id);

  const type = detectType(name);
  const tags = detectTags(name, config.tagMap);

  cards.push({
    id,
    name,
    type: tags.length ? { ...type, tags } : type
  });
});

// SORT opcional (molt útil)
cards.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

// OUTPUT
const output = `// ${config.collectionId}
const cards = ${JSON.stringify(cards, null, 2)};

window.cards = cards;
`;

fs.writeFileSync(path.join(__dirname, config.outputFile), output);

// LOG
console.log("✅ Cartes:", cards.length);
if (errors.length) {
  console.log("⚠️ Errors:");
  errors.forEach(e => console.log(e));
}

console.log("Total línies processades:", lines.length);
console.log("Cartes generades:", cards.length);

if(errors.length){
  console.log("---- DUPLICATS ----");
  errors.forEach(e => console.log(e));
}
