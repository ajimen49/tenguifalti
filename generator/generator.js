const fs = require("fs");
const path = require("path");

// 📥 INPUT
const INPUT_FILE = path.join(__dirname, "input/laliga-2026.txt");

// 📤 OUTPUT
const OUTPUT_FILE = path.join(__dirname, "../data/laliga-2026.js");

// 📊 CONTROL
let totalLines = 0;
let generated = 0;
let ignored = 0;

const ids = new Set();
const duplicates = [];
const notGenerated = [];

// 🔍 Detectar tipus de carta
function detectType(text) {
  text = text.toLowerCase();

  if (text.includes("momentum oro")) return "Momentum Oro";
  if (text.includes("momentum")) return "Momentum";
  if (text.includes("dream box")) return "Dream Box";
  if (text.includes("premium oro")) return "Premium Oro";
  if (text.includes("premium")) return "Premium";
  if (text.includes("box serie oro")) return "Box Serie Oro";
  if (text.includes("platinum")) return "Platinum";
  if (text.includes("nuevo fichaje")) return "Nuevo Fichaje";
  if (text.includes("ampliación")) return "Ampliación";

  return "Base";
}

// 🧠 Parser principal
function parseLine(line, index) {
  totalLines++;

  line = line.trim();
  if (!line) return null;

  // Format: ID - text
  const match = line.match(/^(.+?)\s*-\s*(.+)$/);

  if (!match) {
    console.log(`⚠️ Línia ignorada: ${line}`);
    ignored++;
    return null;
  }

  let idRaw = match[1].trim();
  let content = match[2].trim();

  // 🔧 NORMALITZACIÓ IMPORTANT (manté "1 Bis")
  idRaw = idRaw
    .replace(/\s+/g, " ")
    .replace(/\s?Bis$/i, " Bis");

  // ❌ evitar coses rares sense números ni codis
  if (!idRaw.match(/[0-9]/) && !idRaw.match(/[A-Z]{2,}/)) {
    ignored++;
    return null;
  }

  // 🚫 duplicats
  if (ids.has(idRaw)) {
    duplicates.push(`Duplicat ID: ${idRaw} (línia ${index + 1}) -> ${line}`);
    return null;
  }

  ids.add(idRaw);

  // 🎯 extreure equip (si hi és)
  let team = "";
  const teamMatch = content.match(/\((.*?)\)/);
  if (teamMatch) {
    team = teamMatch[1];
  }

  // 🧩 tipus de carta
  const type = detectType(content);

  generated++;

  return {
    id: idRaw,
    name: content,
    team,
    type,
    owned: false
  };
}

// 🚀 EXECUCIÓ
function run() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error("❌ No existeix cards.txt");
    return;
  }

  const raw = fs.readFileSync(INPUT_FILE, "utf-8");
  const lines = raw.split("\n");

  const cards = [];

  lines.forEach((line, index) => {
    const card = parseLine(line, index);
    if (card) {
      cards.push(card);
    } else {
      if (line.trim()) {
        notGenerated.push(`${line.trim()} (línia ${index + 1})`);
      }
    }
  });

  // 📄 generar fitxer
  const output = `export const cards = ${JSON.stringify(cards, null, 2)};`;

  fs.writeFileSync(OUTPUT_FILE, output, "utf-8");

  // 📊 LOG FINAL
  console.log("\n==============================");
  console.log(`Total línies: ${totalLines}`);
  console.log(`Cartes generades: ${generated}`);
  console.log(`Ignorades: ${ignored}`);

  if (duplicates.length) {
    console.log("\n⚠️ DUPLICATS:");
    duplicates.forEach(d => console.log(d));
  } else {
    console.log("\n✅ Sense duplicats");
  }

  console.log("\n---- CARTES NO GENERADES ----");
  notGenerated.slice(0, 50).forEach(l => console.log(l));

  console.log("\n==============================");
}

// ▶️ RUN
run();