import { cards } from "../data/laliga-2026.js";

console.log("Cartes carregades:", cards.length);

// EXEMPLE: render simple
function renderCards(cards) {
  const container = document.getElementById("cards-container");

  if (!container) return;

  container.innerHTML = cards.map(card => `
    <div class="card">
      <strong>${card.id}</strong><br>
      ${card.name}<br>
      <small>${card.team} | ${card.type}</small>
    </div>
  `).join("");
}

// INIT
renderCards(cards);
