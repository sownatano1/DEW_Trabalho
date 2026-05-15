
    const suits = ["♠", "♥", "♦", "♣"];
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const STARTING_POINTS = 1000;

    const dealerCardsEl = document.getElementById("dealer-cards");
    const dealerScoreEl = document.getElementById("dealer-score");
    const playerHandsEl = document.getElementById("player-hands");
    const playerStateEl = document.getElementById("player-state");
    const pointsDisplayEl = document.getElementById("points-display");
    const betDisplayEl = document.getElementById("bet-display");
    const bestDisplayEl = document.getElementById("best-display");
    const roundDisplayEl = document.getElementById("round-display");
    const statusEl = document.getElementById("status");
    const hitBtn = document.getElementById("hit-btn");
    const standBtn = document.getElementById("stand-btn");
    const splitBtn = document.getElementById("split-btn");
    const dealBtn = document.getElementById("deal-btn");
    const resetBtn = document.getElementById("reset-btn");
    const betMinus10Btn = document.getElementById("bet-minus-10");
    const betMinus50Btn = document.getElementById("bet-minus-50");
    const betPlus10Btn = document.getElementById("bet-plus-10");
    const betPlus50Btn = document.getElementById("bet-plus-50");
    const betMaxBtn = document.getElementById("bet-max");

    let deck = [];
    let playerHands = [];
    let dealerHand = [];
    let gameOver = true;
    let dealerHidden = true;
    let activeHandIndex = 0;
    let hasSplit = false;
    let points = STARTING_POINTS;
    let bestPoints = STARTING_POINTS;
    let currentBet = 50;
    let roundNumber = 0;
    let roundStartPoints = STARTING_POINTS;

    function createDeck() {
    const newDeck = [];
    for (const suit of suits) {
    for (const value of values) {
    newDeck.push({ value, suit });
}
}
    return shuffle(newDeck);
}

    function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
}
    return arr;
}

    function drawCard() {
    if (deck.length === 0) {
    deck = createDeck();
}
    return deck.pop();
}

    function getCardValue(card) {
    if (["J", "Q", "K"].includes(card.value)) return 10;
    if (card.value === "A") return 11;
    return Number(card.value);
}

    function getHandScore(cards) {
    let total = 0;
    let aces = 0;

    for (const card of cards) {
    total += getCardValue(card);
    if (card.value === "A") aces++;
}

    while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
}

    return total;
}

    function isRedSuit(suit) {
    return suit === "♥" || suit === "♦";
}

    function getMinBet() {
    return points > 0 ? Math.min(10, points) : 0;
}

    function clampBet() {
    if (points <= 0) {
    currentBet = 0;
    return;
}
    currentBet = Math.max(getMinBet(), Math.min(currentBet, points));
}

    function adjustBet(amount) {
    if (!gameOver || points <= 0) return;
    currentBet += amount;
    clampBet();
    renderAll();
}

    function maxBet() {
    if (!gameOver || points <= 0) return;
    currentBet = points;
    renderAll();
}

    function canDealRound() {
    return gameOver && points > 0 && currentBet > 0;
}

    function getCurrentHand() {
    return playerHands[activeHandIndex];
}

    function canSplitHand() {
    if (gameOver || hasSplit || playerHands.length !== 1) return false;
    const hand = playerHands[0];
    return hand.cards.length === 2 && hand.cards[0].value === hand.cards[1].value && points >= hand.wager;
}

    function allPlayerHandsBusted() {
    return playerHands.length > 0 && playerHands.every(hand => getHandScore(hand.cards) > 21);
}

    function createCardElement(card, hidden = false) {
    const div = document.createElement("div");

    if (hidden) {
    div.className = "card card-back";
    div.textContent = "🂠";
    return div;
}

    div.className = `card ${isRedSuit(card.suit) ? "red" : ""}`.trim();
    div.innerHTML = `
        <div class="card-top">${card.value}${card.suit}</div>
        <div class="card-center">${card.suit}</div>
        <div class="card-bottom">${card.value}${card.suit}</div>
      `;
    return div;
}

    function getHandTitle(index, hand) {
    const score = getHandScore(hand.cards);
    const baseTitle = playerHands.length === 1 ? "Jogador" : `Hand ${index + 1}`;
    if (score > 21) return `${baseTitle} — Busted`;
    return baseTitle;
}

    function getTurnPrompt() {
    if (playerHands.length === 1) {
    return "é o seu turno";
}
    return `Jogando a ${activeHandIndex + 1}° mão: Pedir cartar ou Passar?`;
}

    function formatDelta(value) {
    return value > 0 ? `+${value}` : `${value}`;
}

    function renderSession() {
    pointsDisplayEl.textContent = points;
    betDisplayEl.textContent = currentBet;
    bestDisplayEl.textContent = bestPoints;
    roundDisplayEl.textContent = roundNumber;
}

    function renderHands() {
    dealerCardsEl.innerHTML = "";
    playerHandsEl.innerHTML = "";

    dealerHand.forEach((card, index) => {
    const hidden = dealerHidden && index === 1 && !gameOver;
    dealerCardsEl.appendChild(createCardElement(card, hidden));
});

    playerHands.forEach((hand, index) => {
    const handBox = document.createElement("div");
    handBox.className = `player-hand ${!gameOver && index === activeHandIndex ? "active" : ""}`.trim();

    const header = document.createElement("div");
    header.className = "hand-header";
    header.innerHTML = `
          <div class="hand-title">${getHandTitle(index, hand)}</div>
          <div class="score">Apostando: ${hand.wager} • Reais: ${getHandScore(hand.cards)}</div>
        `;

    const cards = document.createElement("div");
    cards.className = "cards";
    hand.cards.forEach(card => cards.appendChild(createCardElement(card)));

    handBox.appendChild(header);
    handBox.appendChild(cards);
    playerHandsEl.appendChild(handBox);
});

    const totalAtRisk = playerHands.reduce((sum, hand) => sum + hand.wager, 0);
    const handLabel = playerHands.length === 1 ? "mão 1" : `${playerHands.length} hands`;
    playerStateEl.textContent = totalAtRisk > 0 ? `${handLabel} • ${totalAtRisk} points at risk` : handLabel;

    if (dealerHidden && !gameOver && dealerHand.length > 0) {
    dealerScoreEl.textContent = `Reais: ${getCardValue(dealerHand[0])} + ?`;
} else {
    dealerScoreEl.textContent = `Reais: ${dealerHand.length ? getHandScore(dealerHand) : 0}`;
}
}

    function setControls() {
    const betDisabled = !gameOver || points <= 0;
    hitBtn.disabled = gameOver;
    standBtn.disabled = gameOver;
    splitBtn.disabled = !canSplitHand();
    dealBtn.disabled = !canDealRound();
    betMinus10Btn.disabled = betDisabled;
    betMinus50Btn.disabled = betDisabled;
    betPlus10Btn.disabled = betDisabled;
    betPlus50Btn.disabled = betDisabled;
    betMaxBtn.disabled = betDisabled;
}

    function renderAll() {
    clampBet();
    renderSession();
    renderHands();
    setControls();
}

    function resetSession() {
    points = STARTING_POINTS;
    bestPoints = STARTING_POINTS;
    currentBet = 50;
    roundNumber = 0;
    roundStartPoints = STARTING_POINTS;
    deck = [];
    playerHands = [{ cards: [], wager: 0 }];
    dealerHand = [];
    gameOver = true;
    dealerHidden = true;
    activeHandIndex = 0;
    hasSplit = false;
    statusEl.textContent = "Escolha sua aposta!";
    renderAll();
}

    function startRound() {
    if (!canDealRound()) return;

    roundStartPoints = points;
    points -= currentBet;
    roundNumber += 1;
    deck = createDeck();
    playerHands = [{ cards: [drawCard(), drawCard()], wager: currentBet }];
    dealerHand = [drawCard(), drawCard()];
    gameOver = false;
    dealerHidden = true;
    activeHandIndex = 0;
    hasSplit = false;
    statusEl.textContent = getTurnPrompt();
    renderAll();

    const playerScore = getHandScore(playerHands[0].cards);
    const dealerScore = getHandScore(dealerHand);
    if (playerScore === 21 || dealerScore === 21) {
    finishRound(true);
}
}

    function splitHand() {
    if (!canSplitHand()) return;

    const original = playerHands[0];
    points -= original.wager;
    const [firstCard, secondCard] = original.cards;
    playerHands = [
{ cards: [firstCard, drawCard()], wager: original.wager },
{ cards: [secondCard, drawCard()], wager: original.wager }
    ];
    hasSplit = true;
    activeHandIndex = 0;
    statusEl.textContent = "Cartas Divididas. Jogando com a 1a Mão";
    renderAll();
}

    function playerHit() {
    if (gameOver) return;

    const hand = getCurrentHand();
    hand.cards.push(drawCard());
    const score = getHandScore(hand.cards);
    renderAll();

    if (score > 21) {
    advanceToNextHandOrDealer(playerHands.length > 1 ? `Hand ${activeHandIndex + 1} busted.` : "Você Estorou.");
} else if (score === 21) {
    advanceToNextHandOrDealer(playerHands.length > 1 ? `Hand ${activeHandIndex + 1} has 21.` : "BlackJack!");
} else {
    statusEl.textContent = getTurnPrompt();
}
    setControls();
}

    function playerStand() {
    if (gameOver) return;
    advanceToNextHandOrDealer(playerHands.length > 1 ? `Hand ${activeHandIndex + 1} stands.` : "Você Não comprou.");
    setControls();
}

    function advanceToNextHandOrDealer(message = "") {
    if (activeHandIndex < playerHands.length - 1) {
    activeHandIndex += 1;
    statusEl.textContent = `${message} ${getTurnPrompt()}`.trim();
    renderAll();
    return;
}

    if (allPlayerHandsBusted()) {
    finishRound(false);
    return;
}

    dealerTurn();
}

    function dealerTurn() {
    dealerHidden = false;
    renderAll();

    while (getHandScore(dealerHand) < 17) {
    dealerHand.push(drawCard());
}

    finishRound(false);
}

    function settleNormalHand(hand, dealerScore) {
    const playerScore = getHandScore(hand.cards);
    if (playerScore > 21) {
    return { text: "loses", payout: 0 };
}
    if (dealerScore > 21) {
    return { text: `wins (${formatDelta(hand.wager)})`, payout: hand.wager * 2 };
}
    if (playerScore > dealerScore) {
    return { text: `wins (${formatDelta(hand.wager)})`, payout: hand.wager * 2 };
}
    if (playerScore === dealerScore) {
    return { text: "pushes (+0)", payout: hand.wager };
}
    return { text: `loses (${formatDelta(-hand.wager)})`, payout: 0 };
}

    function finishRound(checkImmediateBlackjack = false) {
    gameOver = true;
    dealerHidden = false;
    let totalPayout = 0;
    const dealerScore = dealerHand.length ? getHandScore(dealerHand) : 0;
    const results = [];

    if (checkImmediateBlackjack) {
    const hand = playerHands[0];
    const playerScore = getHandScore(hand.cards);
    const playerNatural = hand.cards.length === 2 && playerScore === 21;
    const dealerNatural = dealerHand.length === 2 && dealerScore === 21;

    if (playerNatural && dealerNatural) {
    totalPayout += hand.wager;
    results.push("Ambos tem BlackJack - Empate");
} else if (playerNatural) {
    const blackjackPayout = Math.round(hand.wager * 2.5);
    totalPayout += blackjackPayout;
    results.push(`Blackjack! (${formatDelta(blackjackPayout - hand.wager)})`);
} else if (dealerNatural) {
    results.push(`Dealer Blackjack (${formatDelta(-hand.wager)})`);
}
} else {
    playerHands.forEach((hand, index) => {
    const settled = settleNormalHand(hand, dealerScore);
    totalPayout += settled.payout;
    const label = playerHands.length === 1 ? "Round" : `Hand ${index + 1}`;
    results.push(`${label} ${settled.text}`);
});
}

    points += totalPayout;
    bestPoints = Math.max(bestPoints, points);
    const totalDelta = points - roundStartPoints;

    statusEl.textContent = `${results.join(" | ")} • Total ${formatDelta(totalDelta)} points.`;
    if (points <= 0) {
    statusEl.textContent += " Você está sem dinheiro.... Adicione mais na pagina principal";
}

    renderAll();
}

    hitBtn.addEventListener("click", playerHit);
    standBtn.addEventListener("click", playerStand);
    splitBtn.addEventListener("click", splitHand);
    dealBtn.addEventListener("click", startRound);
    resetBtn.addEventListener("click", resetSession);
    betMinus10Btn.addEventListener("click", () => adjustBet(-10));
    betMinus50Btn.addEventListener("click", () => adjustBet(-50));
    betPlus10Btn.addEventListener("click", () => adjustBet(10));
    betPlus50Btn.addEventListener("click", () => adjustBet(50));
    betMaxBtn.addEventListener("click", maxBet);

    resetSession();
