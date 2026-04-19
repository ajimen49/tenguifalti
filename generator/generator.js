const fs = require("fs");
const path = require("path");

const config = require("./config");
const { normalizeId, detectType, detectTags } = require("./utils");

// 📥 input
const inputPath = path.join(__dirname, "input", `${config.collectionId}.txt`);
const raw = fs.readFileSync(inputPath, "utf8");

const lines = raw.split("\n");

const cards = [];
const ids = new Set();
const errors = [];

// --------------------
// PARSER
// --------------------

lines.forEach((line, i) => {
  line = line.trim();
  if (!line) return;

  const match = line.match(/^(.+?)\s*-\s*(.+)$/);
  if (!match) {
  if (line.match(/\d/)) {
    console.log("⚠️ Línia ignorada:", line);
  }
  return;
}

  let idRaw = match[1].trim();
  let name = match[2].trim();

  // ❌ descartar línies que NO són cartes
  if (
    !idRaw.match(/\d/) &&
    !idRaw.match(/^(BI|AO|NAO|DAO|NM|CU|TK|ND|PPA|PPB|PPC|Índ)/)
  ) {
    return;
  }

  // ✅ normalitzar ID (IMPORTANT: amb name per S/N)
  let id = normalizeId(idRaw, name);

  // ❗ detectar duplicats
  if (ids.has(id)) {
    errors.push(`Duplicat ID: ${id} (línia ${i}) -> ${name}`);
    return; // ignorem duplicat
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

// --------------------
// SORT (molt útil)
// --------------------

cards.sort((a, b) =>
  a.id.localeCompare(b.id, undefined, { numeric: true })
);

// --------------------
// OUTPUT
// --------------------

const output = `// ${config.collectionId}
const cards = ${JSON.stringify(cards, null, 2)};

window.cards = cards;
`;

const outputPath = path.join(__dirname, config.outputFile);
const dir = path.dirname(outputPath);

// crear carpeta si no existeix
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outputPath, output);

// --------------------
// LOG
// --------------------

console.log("Total línies:", lines.length);
console.log("Cartes generades:", cards.length);

if (errors.length) {
  console.log("⚠️ DUPLICATS DETECTATS:");
  errors.forEach(e => console.log(e));
} else {
  console.log("✅ Sense duplicats");
}

// DEBUG: buscar cartes sospitoses
const missingCandidates = lines.filter(line => {
  const match = line.match(/^(.+?)\s*-\s*(.+)$/);
  if (!match) return false;

  let idRaw = match[1].trim();

  // línies que semblen cartes però han estat descartades
  const looksLikeCard =
    idRaw.match(/\d/) ||
    idRaw.match(/^(BI|AO|NAO|DAO|NM|CU|TK|ND|PPA|PPB|PPC|Índ)/);

  return looksLikeCard && !cards.find(c => line.includes(c.name));
});

console.log("---- POSSIBLES CARTES PERDUDES ----");
missingCandidates.slice(0, 20).forEach(l => console.log(l));
