function normalizeId(id, name) {
  id = id.trim();

  // Cas especial S/N → fer-los únics
  if (id.includes("S/N")) {
    return id.replace(/\s+/g, "") + "-" + name.split(" ")[0];
  }

  return id
    .replace(" Bis", "B")
    .replace(/\s+/g, "")
    .replace("AO200", "AO200-")
    .replace("AO100", "AO100-")
    .replace("AO50", "AO50-")
    .replace("NAO200", "NAO200-")
    .replace("NAO100", "NAO100-")
    .replace("NAO50", "NAO50-")
    .replace("DAO50", "DAO50-");
}

function detectType(name) {
  const n = name.toLowerCase();

  if (n.includes("escudo")) return { category: "base", sub: "escut" };
  if (n.includes("stadium")) return { category: "base", sub: "stadium" };
  if (n.includes("ampliación")) return { category: "base", sub: "bis" };

  if (n.includes("¡vamos")) return { category: "especial", sub: "vamos" };
  if (n.includes("guantes")) return { category: "especial", sub: "guantes" };
  if (n.includes("kryptonita")) return { category: "especial", sub: "kryptonita" };
  if (n.includes("diamante")) return { category: "especial", sub: "diamante" };
  if (n.includes("prota")) return { category: "especial", sub: "prota" };
  if (n.includes("supercrack")) return { category: "especial", sub: "supercrack" };

  if (n.includes("balón de oro")) return { category: "ultra", sub: "balon_oro" };
  if (n.includes("champions")) return { category: "ultra", sub: "champions" };

  if (n.includes("edición limitada")) return { category: "extra", sub: "limitada" };
  if (n.includes("momentum")) return { category: "extra", sub: "momentum" };
  if (n.includes("autógrafo")) return { category: "extra", sub: "autografo" };
  if (n.includes("total kings")) return { category: "extra", sub: "total_kings" };

  return { category: "base", sub: "jugador" };
}

function detectTags(name, tagMap) {
  const n = name.toLowerCase();
  return tagMap
    .filter(t => n.includes(t.match))
    .map(t => t.tag);
}

module.exports = { normalizeId, detectType, detectTags };
