const SUITS = [
  { id: "spade", names: { en: "Spade", zh: "黑桃" }, symbol: "♠", tone: "black" },
  { id: "heart", names: { en: "Heart", zh: "红桃" }, symbol: "♥", tone: "red" },
  { id: "club", names: { en: "Club", zh: "梅花" }, symbol: "♣", tone: "black" },
  { id: "diamond", names: { en: "Diamond", zh: "方块" }, symbol: "♦", tone: "red" },
];

const SUIT_BY_ID = Object.fromEntries(SUITS.map((suit) => [suit.id, suit]));
const DEFAULT_LANGUAGE = "en";
const SCORE_KEY = "divine-gold-flip:scores";
const PLAYER_COUNT = 4;
const HUMAN_INDEX = 0;
const AI_THINK_DELAY = 2600;
const AI_DRAW_PLAY_DELAY = 2000;
const AI_DRAW_PASS_DELAY = 1400;
const HUMAN_CARD_ANIMATION_MS = 760;
const AI_CARD_ANIMATION_MS = 1150;
const MUSIC_BPM = 96;
const MUSIC_STEP_SECONDS = 60 / MUSIC_BPM / 2;
const MUSIC_VOLUME = 0.24;
const MUSIC_LOOKAHEAD_SECONDS = 0.42;

let nextCardId = 1;
let toastTimer = 0;
let directionNoticeTimer = 0;
let audioContext = null;
let musicMaster = null;
let musicTimer = 0;
let nextMusicTime = 0;
let musicStepIndex = 0;
let musicSessionId = 0;
const activeMusicSources = new Set();

const players = [
  { names: { en: "You", zh: "你" }, shortNames: { en: "You", zh: "你" }, kind: "human", hand: [], score: 0 },
  { names: { en: "AI East", zh: "AI 东" }, shortNames: { en: "E", zh: "东" }, kind: "ai-1", hand: [], score: 0 },
  { names: { en: "AI North", zh: "AI 北" }, shortNames: { en: "N", zh: "北" }, kind: "ai-2", hand: [], score: 0 },
  { names: { en: "AI West", zh: "AI 西" }, shortNames: { en: "W", zh: "西" }, kind: "ai-3", hand: [], score: 0 },
];

const TEXT = {
  en: {
    brandTitle: "Divine Gold Flip",
    brandMark: "D",
    languageButton: "中文",
    switchLanguageLabel: "Switch to Chinese",
    musicOnLabel: "Music on. Click to mute.",
    musicOffLabel: "Music off. Click to play.",
    rulesButton: "Rules",
    round: "Round {round}",
    dealer: "Dealer: {player}",
    score: "{score} pts",
    handCount: "Cards {count}",
    cardCount: "{count} cards",
    cardCountOne: "{count} card",
    dealerChip: "Dealer",
    calling: "Last card",
    thinkingChip: "Thinking",
    activeSuit: "Active suit",
    drawPile: "Draw Pile",
    discardPile: "Discard Pile",
    topCard: "Top Card",
    previousTopCard: "Previous Top",
    justPlayed: "Just Played",
    waitingSpecial: "Waiting for a special card",
    turnPaused: "Game Paused",
    roundOver: "Round Over",
    playerThinking: "{player} thinking",
    playerPlaying: "{player} playing",
    playerActing: "{player} turn",
    draw: "Draw",
    handTitle: "Your Hand",
    gameLog: "Game Log",
    suitModalTitle: "Choose the next suit",
    resultWin: "Win",
    resultRound: "Round",
    continueRound: "Continue",
    rulesTitle: "Rules",
    specialCardPreviewTitle: "Special Card Preview",
    specialCardPreviewIntro: "These are the special cards you will see in play.",
    closeRulesLabel: "Close rules",
    arenaLabel: "Divine Gold Flip table",
    centerTableLabel: "Table center",
    drawPileLabel: "Draw pile",
    tableTopCardLabel: "Table top card",
    handZoneLabel: "Your hand",
    logPanelLabel: "Game log",
    directionClockwise: "Clockwise",
    directionCounterClockwise: "Counterclockwise",
    statusPaused: "Rules open · game paused · active {suit}",
    statusRoundOver: "{player} won; score has been added",
    statusThinking: "{player} is thinking · active {suit}",
    statusPlaying: "{player} is playing · active {suit}",
    statusTurn: "{player}'s turn · active {suit}",
    hintPaused: "Rules are open. The game is paused.",
    hintRoundOver: "Round over. Continue to deal again.",
    hintAnimating: "Watch the card move onto the table.",
    hintThinking: "{player} is thinking.",
    hintAiActing: "AI is acting.",
    hintDrawn: "After drawing, you can only play the card you just drew.",
    hintPlayable: "Click a highlighted card to play it.",
    hintMustDraw: "No playable card. You must draw 1 card.",
    drawDisabledTitle: "You have a playable card, so you cannot draw",
    roundResultText: "Score: {scores}",
    scorePair: "{player} {score}",
    suitChoiceLabel: "{symbol} {suit}",
    bigJoker: "Big Joker",
    littleJoker: "Little Joker",
    reverse: "Reverse",
    wildSuit: "Wild Suit",
    beastNames: {
      dragon: "Azure Dragon",
      tiger: "White Tiger",
      phoenix: "Vermilion Bird",
    },
    beastShort: {
      dragon: "Dragon",
      tiger: "Tiger",
      phoenix: "Bird",
    },
    effectWild: "{card} is active. Suit changed to {symbol} {suit}",
    effectReverse: "{card} is active. Suit is {symbol} {suit}; direction changed to {icon} {direction}",
    effectPlayed: "{card} played",
    specialPlaying: "{card} is being played",
    flyingCard: "{player} played",
    toastWrongTurn: "It is not that player's turn.",
    toastDrawnOnly: "After drawing, you can only handle the card you just drew.",
    toastMismatch: "That card does not match the active suit or number.",
    toastAlreadyOver: "This round is already over.",
    toastRulesPaused: "The game is paused while rules are open.",
    toastWaitAnimation: "Please wait for this card to finish.",
    toastWaitAi: "Please wait for the AI.",
    toastAlreadyDrew: "You already drew this turn.",
    toastPlayableNoDraw: "You have a playable card, so you cannot draw.",
    toastDrawnPlayable: "The card you drew is playable. Click it to play.",
    toastDrawnUnplayable: "The card you drew cannot be played. Turn ends.",
    toastCannotDraw: "You cannot draw now.",
    toastNoSkip: "You cannot skip your turn.",
    logDeckRebuilt: "Draw pile was empty; discard pile was shuffled back in.",
    logOpeningWilds: "{count} wild card(s) were revealed at start and redrawn.",
    logOpeningReverse: "Opening card was {card}; direction reversed immediately.",
    logOpeningTop: "Opening top card was {card}.",
    logFirstPlayer: "{player} acts first.",
    logPlayedCard: "{player} played {card}{effect}.",
    logEffectChosenSuit: ", chose {suit}",
    logEffectReverse: ", direction reversed",
    logWinner: "{player} emptied their hand and won the round.",
    logNoDraw: "{player} had no card to draw; turn ends.",
    logDrewCard: "{player} drew 1 card.",
    directionNotice: "{player} played Little Joker. Direction changed to {icon} {direction}.",
    rules: [
      ["Deck", "55 cards total: four suits with 1-9 once each for 36 number cards, 4 Big Jokers, 6 Little Jokers, and 3 each of Azure Dragon, White Tiger, and Vermilion Bird."],
      ["Basics", "One human player faces 3 AI opponents. Everyone starts with 5 cards. The player after the dealer starts, and play begins clockwise."],
      ["Playing Cards", "Number cards must match the active suit or the number on the top card. If you have no legal card, you must draw 1 card. A playable drawn card can be played immediately."],
      ["Special Cards", "Big Joker and the three beasts can be played anytime and choose the next active suit. Little Joker must match the active suit and reverses direction immediately."],
      ["Winning", "The first player to empty their hand wins the round and gains 1 point. Scores keep accumulating."],
    ],
  },
  zh: {
    brandTitle: "神兽转向牌",
    brandMark: "令",
    languageButton: "English",
    switchLanguageLabel: "切换到英文",
    musicOnLabel: "音乐已开启，点击关闭。",
    musicOffLabel: "音乐已关闭，点击开启。",
    rulesButton: "规则",
    round: "第 {round} 局",
    dealer: "庄家: {player}",
    score: "{score} 分",
    handCount: "手牌 {count}",
    cardCount: "{count} 张",
    cardCountOne: "{count} 张",
    dealerChip: "庄家",
    calling: "报牌",
    thinkingChip: "思考中",
    activeSuit: "当前花色",
    drawPile: "抽牌堆",
    discardPile: "弃牌堆",
    topCard: "桌面顶牌",
    previousTopCard: "原顶牌",
    justPlayed: "刚打出",
    waitingSpecial: "等待特殊牌",
    turnPaused: "游戏暂停",
    roundOver: "本局结束",
    playerThinking: "{player} 思考中",
    playerPlaying: "{player} 出牌中",
    playerActing: "轮到{player}",
    draw: "摸牌",
    handTitle: "你的手牌",
    gameLog: "对局记录",
    suitModalTitle: "指定下一轮花色",
    resultWin: "胜",
    resultRound: "局",
    continueRound: "继续下一局",
    rulesTitle: "游戏规则",
    specialCardPreviewTitle: "特殊牌预览",
    specialCardPreviewIntro: "对局中会遇到这些特殊牌。",
    closeRulesLabel: "关闭规则",
    arenaLabel: "神兽转向牌牌桌",
    centerTableLabel: "牌桌中央",
    drawPileLabel: "抽牌堆",
    tableTopCardLabel: "桌面基准牌",
    handZoneLabel: "你的手牌",
    logPanelLabel: "对局记录",
    directionClockwise: "顺时针",
    directionCounterClockwise: "逆时针",
    statusPaused: "规则打开 · 游戏暂停 · 当前 {suit}",
    statusRoundOver: "{player} 获胜，比分已累计",
    statusThinking: "{player} 正在思考 · 当前 {suit}",
    statusPlaying: "{player} 正在出牌 · 当前 {suit}",
    statusTurn: "轮到 {player} · 当前 {suit}",
    hintPaused: "规则打开，游戏已暂停。",
    hintRoundOver: "本局结束，继续下一局后重新发牌。",
    hintAnimating: "正在出牌，请看牌面移动。",
    hintThinking: "{player} 正在思考。",
    hintAiActing: "AI 正在行动。",
    hintDrawn: "摸牌后只能打出刚摸到的牌。",
    hintPlayable: "点击高亮牌出牌。",
    hintMustDraw: "无牌可出，必须摸 1 张。",
    drawDisabledTitle: "有可出的牌时不能摸牌",
    roundResultText: "当前比分: {scores}",
    scorePair: "{player} {score}",
    suitChoiceLabel: "{symbol} {suit}",
    bigJoker: "大王",
    littleJoker: "小王",
    reverse: "反转",
    wildSuit: "万能变色",
    beastNames: {
      dragon: "青龙",
      tiger: "白虎",
      phoenix: "朱雀",
    },
    beastShort: {
      dragon: "龙",
      tiger: "虎",
      phoenix: "雀",
    },
    effectWild: "{card} 生效，当前花色改为 {symbol} {suit}",
    effectReverse: "{card} 生效，当前花色 {symbol} {suit}，方向改为 {icon} {direction}",
    effectPlayed: "{card} 已打出",
    specialPlaying: "{card} 正在打出",
    flyingCard: "{player} 出牌",
    toastWrongTurn: "还没轮到这位玩家。",
    toastDrawnOnly: "摸牌后只能处理刚摸到的那张牌。",
    toastMismatch: "这张牌不匹配当前花色或数字。",
    toastAlreadyOver: "本局已经结束。",
    toastRulesPaused: "规则打开时游戏暂停。",
    toastWaitAnimation: "请等这张牌出完。",
    toastWaitAi: "请等待 AI 行动。",
    toastAlreadyDrew: "本回合已经摸过牌。",
    toastPlayableNoDraw: "你有可出的牌，不能直接摸牌。",
    toastDrawnPlayable: "刚摸到的牌可以打出，请点击这张牌。",
    toastDrawnUnplayable: "摸到的牌不能出，回合结束。",
    toastCannotDraw: "现在不能摸牌。",
    toastNoSkip: "不能直接跳过回合。",
    logDeckRebuilt: "抽牌堆耗尽，已洗入弃牌堆。",
    logOpeningWilds: "开局翻到 {count} 张万能牌，已收回重翻。",
    logOpeningReverse: "开局翻出 {card}，方向立即反转。",
    logOpeningTop: "开局顶牌为 {card}。",
    logFirstPlayer: "{player} 先手行动。",
    logPlayedCard: "{player} 打出 {card}{effect}。",
    logEffectChosenSuit: "，指定 {suit}",
    logEffectReverse: "，出牌方向反转",
    logWinner: "{player} 打空手牌，赢得本局。",
    logNoDraw: "{player} 无牌可摸，回合结束。",
    logDrewCard: "{player} 摸了 1 张牌。",
    directionNotice: "{player} 打出小王，方向改为 {icon} {direction}。",
    rules: [
      ["牌组", "共 55 张：四种花色 1-9 各 1 张，共 36 张；大王 4 张；小王 6 张；青龙、白虎、朱雀各 3 张。"],
      ["基础玩法", "真人玩家对战 3 个 AI。每人开局 5 张手牌，庄家下家先手，默认顺时针行动。"],
      ["出牌规则", "数字牌必须匹配当前花色或当前顶牌数字。没有可出牌时必须摸 1 张，刚摸到的牌若可出可以立刻打出。"],
      ["特殊牌", "大王和青龙、白虎、朱雀可任意打出，并指定下一轮花色。小王需匹配当前花色，打出后立即反转方向。"],
      ["胜负", "率先打空手牌者本局获胜并获得 1 分。分数会持续累计，不清零。"],
    ],
  },
};

const state = {
  language: DEFAULT_LANGUAGE,
  deck: [],
  discard: [],
  currentSuit: "spade",
  direction: 1,
  dealerIndex: 0,
  currentPlayer: 1,
  round: 0,
  phase: "idle",
  drawnThisTurn: false,
  drawnCardId: null,
  pendingSuitCardId: null,
  winnerIndex: null,
  aiThinkingIndex: null,
  isAnimating: false,
  isRulesOpen: false,
  animatingCard: null,
  lastAction: null,
  directionNotice: null,
  musicEnabled: true,
  log: [],
  aiTimer: 0,
};

const els = {
  brandMark: document.querySelector("#brandMark"),
  brandTitle: document.querySelector("#brandTitle"),
  statusLine: document.querySelector("#statusLine"),
  roundLabel: document.querySelector("#roundLabel"),
  dealerLabel: document.querySelector("#dealerLabel"),
  directionLabel: document.querySelector("#directionLabel"),
  languageButton: document.querySelector("#languageButton"),
  musicButton: document.querySelector("#musicButton"),
  directionFlow: document.querySelector("#directionFlow"),
  directionFlowSvg: document.querySelector(".direction-flow-svg"),
  flowPaths: [...document.querySelectorAll(".flow-path")],
  directionNotice: document.querySelector("#directionNotice"),
  activeSuit: document.querySelector("#activeSuit"),
  arena: document.querySelector("#arena"),
  centerTable: document.querySelector("#centerTable"),
  drawPileTitle: document.querySelector("#drawPileTitle"),
  drawPileCard: document.querySelector("#drawPileCard"),
  cardStage: document.querySelector(".card-stage"),
  discardCard: document.querySelector("#discardCard"),
  discardSlotLabel: document.querySelector("#discardSlotLabel"),
  specialSlotLabel: document.querySelector("#specialSlotLabel"),
  specialPlayPanel: document.querySelector("#specialPlayPanel"),
  playedSpecialCard: document.querySelector("#playedSpecialCard"),
  specialEffectText: document.querySelector("#specialEffectText"),
  discardPileTitle: document.querySelector("#discardPileTitle"),
  discardStack: document.querySelector("#discardStack"),
  drawCount: document.querySelector("#drawCount"),
  discardCount: document.querySelector("#discardCount"),
  drawButton: document.querySelector("#drawButton"),
  drawButtonLabel: document.querySelector("#drawButtonLabel"),
  rulesButton: document.querySelector("#rulesButton"),
  rulesCloseButton: document.querySelector("#rulesCloseButton"),
  modalNextRound: document.querySelector("#modalNextRound"),
  turnRibbon: document.querySelector("#turnRibbon"),
  handZone: document.querySelector("#handZone"),
  handTitle: document.querySelector("#handTitle"),
  humanHand: document.querySelector("#humanHand"),
  humanHandCount: document.querySelector("#humanHandCount"),
  handHint: document.querySelector("#handHint"),
  logPanel: document.querySelector("#logPanel"),
  logTitle: document.querySelector("#logTitle"),
  gameLog: document.querySelector("#gameLog"),
  toast: document.querySelector("#toast"),
  suitModal: document.querySelector("#suitModal"),
  suitModalTitle: document.querySelector("#suitModalTitle"),
  suitChoices: document.querySelector("#suitChoices"),
  roundModal: document.querySelector("#roundModal"),
  rulesModal: document.querySelector("#rulesModal"),
  rulesTitle: document.querySelector("#rulesTitle"),
  rulesContent: document.querySelector("#rulesContent"),
  roundResultTitle: document.querySelector("#roundResultTitle"),
  roundResultText: document.querySelector("#roundResultText"),
  resultMark: document.querySelector("#resultMark"),
  seats: [...document.querySelectorAll(".seat")],
};

function cardId() {
  return `c${nextCardId++}`;
}

function shuffle(items) {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function mod(value, base) {
  return ((value % base) + base) % base;
}

function copy() {
  return TEXT[state.language];
}

function t(key, params = {}) {
  const template = copy()[key] || TEXT[DEFAULT_LANGUAGE][key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
}

function playerName(playerIndex) {
  return players[playerIndex]?.names[state.language] || players[playerIndex]?.names[DEFAULT_LANGUAGE] || "";
}

function playerShortName(playerIndex) {
  return players[playerIndex]?.shortNames[state.language] || players[playerIndex]?.shortNames[DEFAULT_LANGUAGE] || "";
}

function suitName(suitId) {
  const suit = SUIT_BY_ID[suitId];
  return suit?.names[state.language] || suit?.names[DEFAULT_LANGUAGE] || "";
}

function suitStatusName(suitId) {
  const suit = SUIT_BY_ID[suitId];
  if (!suit) return "";
  return `${suit.symbol} ${suitName(suitId)}`;
}

function cardCount(count) {
  const key = state.language === "en" && count === 1 ? "cardCountOne" : "cardCount";
  return t(key, { count });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function loadScores() {
  try {
    const saved = JSON.parse(localStorage.getItem(SCORE_KEY) || "[]");
    players.forEach((player, index) => {
      player.score = Number.isFinite(saved[index]) ? saved[index] : 0;
    });
  } catch {
    players.forEach((player) => {
      player.score = 0;
    });
  }
}

function saveScores() {
  localStorage.setItem(SCORE_KEY, JSON.stringify(players.map((player) => player.score)));
}

function createDeck() {
  const deck = [];

  SUITS.forEach((suit) => {
    for (let number = 1; number <= 9; number += 1) {
      deck.push({
        id: cardId(),
        kind: "number",
        suit: suit.id,
        number,
      });
    }
  });

  for (let index = 0; index < 4; index += 1) {
    deck.push({
      id: cardId(),
      kind: "wild",
      wildType: "joker",
      name: "大王",
      icon: "王",
    });
  }

  ["dragon", "tiger", "phoenix"].forEach((wildType) => {
    const names = {
      dragon: ["青龙", "龙"],
      tiger: ["白虎", "虎"],
      phoenix: ["朱雀", "雀"],
    };
    for (let index = 0; index < 3; index += 1) {
      deck.push({
        id: cardId(),
        kind: "wild",
        wildType,
        name: names[wildType][0],
        icon: names[wildType][1],
      });
    }
  });

  ["spade", "heart", "club", "diamond", "spade", "heart"].forEach((suit) => {
    deck.push({
      id: cardId(),
      kind: "reverse",
      suit,
      name: "小王",
    });
  });

  return shuffle(deck);
}

function isWild(card) {
  return card?.kind === "wild";
}

function topCard() {
  return state.discard[state.discard.length - 1];
}

function beastName(wildType) {
  return copy().beastNames[wildType] || wildType;
}

function cardName(card) {
  if (!card) return "";
  if (card.kind === "number") {
    return state.language === "zh" ? `${suitName(card.suit)}${card.number}` : `${suitName(card.suit)} ${card.number}`;
  }
  if (card.kind === "reverse") {
    return state.language === "zh"
      ? `${suitName(card.suit)}${t("littleJoker")}`
      : `${suitName(card.suit)} ${t("littleJoker")}`;
  }
  return card.wildType === "joker" ? t("bigJoker") : state.language === "zh" ? `${beastName(card.wildType)}大王` : beastName(card.wildType);
}

function addLog(key, params = {}) {
  state.log.unshift({ key, params });
  state.log = state.log.slice(0, 6);
}

function clearTurnTimer() {
  window.clearTimeout(state.aiTimer);
  state.aiTimer = 0;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 1800);
}

function showDirectionNotice(playerIndex) {
  window.clearTimeout(directionNoticeTimer);
  state.directionNotice = { playerIndex };
  directionNoticeTimer = window.setTimeout(() => {
    state.directionNotice = null;
    render();
  }, 2300);
}

function directionText() {
  return state.direction === 1 ? t("directionClockwise") : t("directionCounterClockwise");
}

function directionIcon() {
  return state.direction === 1 ? "↻" : "↺";
}

function updateMusicButton() {
  const label = state.musicEnabled ? t("musicOnLabel") : t("musicOffLabel");
  els.musicButton.classList.toggle("is-on", state.musicEnabled);
  els.musicButton.classList.toggle("is-off", !state.musicEnabled);
  els.musicButton.setAttribute("aria-label", label);
  els.musicButton.setAttribute("aria-pressed", String(state.musicEnabled));
  els.musicButton.title = label;
}

function initMusicEngine() {
  if (!audioContext || audioContext.state === "closed") {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    try {
      audioContext = new AudioContextClass();
    } catch {
      return false;
    }
  }

  if (!musicMaster) {
    musicMaster = audioContext.createGain();
    musicMaster.gain.value = 0;
    musicMaster.connect(audioContext.destination);
  }
  return true;
}

function noteFrequency(note) {
  const [, name, octaveText] = note.match(/^([A-G]#?)(\d)$/) || [];
  const semitones = { C: -9, "C#": -8, D: -7, "D#": -6, E: -5, F: -4, "F#": -3, G: -2, "G#": -1, A: 0, "A#": 1, B: 2 };
  const octave = Number(octaveText);
  return 440 * 2 ** ((semitones[name] + (octave - 4) * 12) / 12);
}

function playPluck(note, time, gain = 0.035, duration = 0.34) {
  if (!audioContext || !musicMaster || !state.musicEnabled) return;
  const osc = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  osc.type = "triangle";
  osc.frequency.value = noteFrequency(note);
  envelope.gain.setValueAtTime(0.0001, time);
  envelope.gain.exponentialRampToValueAtTime(gain, time + 0.018);
  envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(envelope).connect(musicMaster);
  activeMusicSources.add(osc);
  osc.addEventListener(
    "ended",
    () => {
      activeMusicSources.delete(osc);
      try {
        osc.disconnect();
      } catch {
        // The node may already be disconnected when the music is stopped.
      }
      try {
        envelope.disconnect();
      } catch {
        // The node may already be disconnected when the music is stopped.
      }
    },
    { once: true },
  );
  osc.start(time);
  osc.stop(time + duration + 0.04);
}

function scheduleMusic() {
  if (!audioContext || !musicMaster || !state.musicEnabled || audioContext.state !== "running") return;
  const melody = ["E5", "G5", "A5", "G5", "E5", "D5", "C5", "D5", "E5", "G5", "C6", "B5", "A5", "G5", "E5", "D5"];
  const bass = ["C3", "C3", "G2", "G2", "A2", "A2", "F2", "G2"];
  const chords = [
    ["C4", "E4", "G4"],
    ["G3", "B3", "D4"],
    ["A3", "C4", "E4"],
    ["F3", "A3", "C4"],
  ];
  while (nextMusicTime < audioContext.currentTime + MUSIC_LOOKAHEAD_SECONDS) {
    const step = musicStepIndex % melody.length;
    playPluck(melody[step], nextMusicTime, 0.05, 0.22);
    if (step % 4 === 0) playPluck(bass[(musicStepIndex / 4) % bass.length], nextMusicTime, 0.036, 0.48);
    if (step % 8 === 0) {
      chords[(musicStepIndex / 8) % chords.length].forEach((note, index) => {
        playPluck(note, nextMusicTime + index * 0.018, 0.022, 0.62);
      });
    }
    nextMusicTime += MUSIC_STEP_SECONDS;
    musicStepIndex += 1;
  }
}

async function startMusic() {
  const sessionId = ++musicSessionId;
  if (!state.musicEnabled || !initMusicEngine()) return;
  const context = audioContext;
  try {
    if (context.state !== "running") await context.resume();
  } catch {
    return;
  }
  if (sessionId !== musicSessionId || !state.musicEnabled || !musicMaster || audioContext !== context || context.state !== "running") return;
  const now = context.currentTime;
  musicMaster.gain.cancelScheduledValues(now);
  musicMaster.gain.setTargetAtTime(MUSIC_VOLUME, now, 0.08);
  if (!musicTimer) {
    nextMusicTime = now + 0.06;
    scheduleMusic();
    musicTimer = window.setInterval(scheduleMusic, 180);
  }
}

function stopMusic() {
  musicSessionId += 1;
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = 0;
  }

  activeMusicSources.forEach((source) => {
    try {
      source.stop(0);
    } catch {
      // The source may have already ended.
    }
    try {
      source.disconnect();
    } catch {
      // The source may have already been disconnected.
    }
  });
  activeMusicSources.clear();

  const context = audioContext;
  if (musicMaster) {
    try {
      const now = context?.currentTime || 0;
      musicMaster.gain.cancelScheduledValues(now);
      musicMaster.gain.setValueAtTime(0, now);
      musicMaster.disconnect();
    } catch {
      // Closing the audio context below is the final shutdown path.
    }
  }
  musicMaster = null;
  audioContext = null;
  nextMusicTime = 0;
  musicStepIndex = 0;

  if (context && context.state !== "closed") {
    context.close().catch(() => {});
  }
}

function setupMusicAutoplay() {
  const unlock = () => {
    if (state.musicEnabled) startMusic();
  };
  document.addEventListener("pointerdown", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });
  startMusic();
}

function isSpecialCard(card) {
  return isWild(card) || card?.kind === "reverse";
}

function describeCardEffect(action) {
  if (action.effectType === "wild") {
    const suit = SUIT_BY_ID[action.chosenSuit];
    return t("effectWild", {
      card: cardName(action.card),
      symbol: suit.symbol,
      suit: suitName(action.chosenSuit),
    });
  }

  if (action.effectType === "reverse") {
    const suit = SUIT_BY_ID[action.card.suit];
    return t("effectReverse", {
      card: cardName(action.card),
      symbol: suit.symbol,
      suit: suitName(action.card.suit),
      icon: directionIcon(),
      direction: directionText(),
    });
  }

  return t("effectPlayed", { card: cardName(action.card) });
}

function playedCardLogEffect(effectType, suitId) {
  if (effectType === "wild") {
    return t("logEffectChosenSuit", { suit: suitName(suitId) });
  }
  if (effectType === "reverse") {
    return t("logEffectReverse");
  }
  return "";
}

function formatLogEntry(entry) {
  if (typeof entry === "string") return entry;
  const params = entry.params || {};

  switch (entry.key) {
    case "deckRebuilt":
      return t("logDeckRebuilt");
    case "openingWilds":
      return t("logOpeningWilds", { count: params.count });
    case "openingReverse":
      return t("logOpeningReverse", { card: cardName(params.card) });
    case "openingTop":
      return t("logOpeningTop", { card: cardName(params.card) });
    case "firstPlayer":
      return t("logFirstPlayer", { player: playerName(params.playerIndex) });
    case "playedCard":
      return t("logPlayedCard", {
        player: playerName(params.playerIndex),
        card: cardName(params.card),
        effect: playedCardLogEffect(params.effectType, params.suitId),
      });
    case "winner":
      return t("logWinner", { player: playerName(params.playerIndex) });
    case "noDraw":
      return t("logNoDraw", { player: playerName(params.playerIndex) });
    case "drewCard":
      return t("logDrewCard", { player: playerName(params.playerIndex) });
    default:
      return "";
  }
}

function canPlay(card) {
  const top = topCard();
  if (!card || !top) return false;
  if (isWild(card)) return true;

  if (card.kind === "number") {
    return card.suit === state.currentSuit || (top.kind === "number" && card.number === top.number);
  }

  if (card.kind === "reverse") {
    return isWild(top) || card.suit === state.currentSuit;
  }

  return false;
}

function playableCardsFor(playerIndex) {
  const hand = players[playerIndex].hand;
  if (state.drawnThisTurn && playerIndex === state.currentPlayer) {
    return hand.filter((card) => card.id === state.drawnCardId && canPlay(card));
  }
  return hand.filter(canPlay);
}

function nextPlayerIndex(fromIndex = state.currentPlayer) {
  return mod(fromIndex - state.direction, PLAYER_COUNT);
}

function drawFromDeck() {
  if (!state.deck.length) {
    rebuildDeckFromDiscard();
  }
  return state.deck.pop() || null;
}

function rebuildDeckFromDiscard() {
  if (state.discard.length <= 1) {
    return;
  }
  const top = state.discard.pop();
  state.deck = shuffle(state.discard);
  state.discard = [top];
  addLog("deckRebuilt");
}

function pickOpeningCard() {
  const heldWilds = [];
  let opening = null;

  while (state.deck.length) {
    const card = state.deck.pop();
    if (isWild(card)) {
      heldWilds.push(card);
      continue;
    }
    opening = card;
    break;
  }

  if (heldWilds.length) {
    state.deck = shuffle([...state.deck, ...heldWilds]);
    addLog("openingWilds", { count: heldWilds.length });
  }

  return opening;
}

function startRound() {
  clearTurnTimer();
  state.round += 1;
  state.dealerIndex = mod(state.round - 1, PLAYER_COUNT);
  state.deck = createDeck();
  state.discard = [];
  state.direction = 1;
  state.phase = "playing";
  state.drawnThisTurn = false;
  state.drawnCardId = null;
  state.pendingSuitCardId = null;
  state.winnerIndex = null;
  state.aiThinkingIndex = null;
  state.isAnimating = false;
  state.isRulesOpen = false;
  state.animatingCard = null;
  state.lastAction = null;
  state.directionNotice = null;
  state.log = [];
  els.rulesModal.classList.remove("is-open");
  els.rulesModal.setAttribute("aria-hidden", "true");

  players.forEach((player) => {
    player.hand = [];
  });

  for (let count = 0; count < 5; count += 1) {
    players.forEach((player) => {
      const card = drawFromDeck();
      if (card) player.hand.push(card);
    });
  }

  const opening = pickOpeningCard();
  state.discard = [opening];
  state.currentSuit = opening.suit;

  if (opening.kind === "reverse") {
    state.direction = -1;
    state.currentPlayer = nextPlayerIndex(state.dealerIndex);
    addLog("openingReverse", { card: opening });
  } else {
    state.currentPlayer = nextPlayerIndex(state.dealerIndex);
    addLog("openingTop", { card: opening });
  }

  addLog("firstPlayer", { playerIndex: state.currentPlayer });
  render();
  scheduleAiTurn();
}

function finishTurn() {
  state.drawnThisTurn = false;
  state.drawnCardId = null;
  state.pendingSuitCardId = null;
  state.aiThinkingIndex = null;
  state.currentPlayer = nextPlayerIndex();
  render();
  scheduleAiTurn();
}

function chooseBestSuit(playerIndex) {
  const counts = Object.fromEntries(SUITS.map((suit) => [suit.id, 0]));
  players[playerIndex].hand.forEach((card) => {
    if (card.suit) counts[card.suit] += 1;
  });

  return SUITS.reduce((best, suit) => {
    if (counts[suit.id] > counts[best]) return suit.id;
    if (counts[suit.id] === counts[best] && suit.id === state.currentSuit) return suit.id;
    return best;
  }, SUITS[0].id);
}

function chooseAiCard(playerIndex, choices) {
  const hand = players[playerIndex].hand;
  const nonWild = choices.filter((card) => !isWild(card));
  const pool = nonWild.length && hand.length > 1 ? nonWild : choices;

  return [...pool].sort((a, b) => scoreAiCard(playerIndex, b) - scoreAiCard(playerIndex, a))[0];
}

function scoreAiCard(playerIndex, card) {
  const hand = players[playerIndex].hand;
  const sameSuitCount = card.suit ? hand.filter((item) => item.suit === card.suit).length : 0;
  const sameNumberCount =
    card.kind === "number" ? hand.filter((item) => item.kind === "number" && item.number === card.number).length : 0;

  if (isWild(card)) {
    return hand.length === 1 ? 100 : 8 + Math.max(...SUITS.map((suit) => hand.filter((item) => item.suit === suit.id).length));
  }

  if (card.kind === "reverse") {
    return 34 + sameSuitCount;
  }

  return 28 + sameSuitCount * 2 + sameNumberCount + card.number / 10;
}

async function playCard(playerIndex, cardId, chosenSuit = null) {
  if (state.phase !== "playing" || state.isAnimating || state.isRulesOpen) return false;
  if (playerIndex !== state.currentPlayer) {
    showToast(t("toastWrongTurn"));
    return false;
  }

  const hand = players[playerIndex].hand;
  const cardIndex = hand.findIndex((card) => card.id === cardId);
  const card = hand[cardIndex];

  if (!card) return false;

  if (state.drawnThisTurn && card.id !== state.drawnCardId) {
    showToast(t("toastDrawnOnly"));
    return false;
  }

  if (!canPlay(card)) {
    showToast(t("toastMismatch"));
    return false;
  }

  if (isWild(card) && !chosenSuit) {
    state.pendingSuitCardId = card.id;
    render();
    return false;
  }

  const previousTopCard = topCard();
  state.aiThinkingIndex = null;
  state.isAnimating = true;
  state.animatingCard = card;
  render();
  try {
    await animatePlayedCard(playerIndex, card);
  } finally {
    state.isAnimating = false;
    state.animatingCard = null;
  }

  hand.splice(cardIndex, 1);
  state.discard.push(card);

  let effectType = null;
  let effectSuit = null;
  let directionChanged = false;
  if (isWild(card)) {
    state.currentSuit = chosenSuit;
    effectType = "wild";
    effectSuit = chosenSuit;
  } else if (card.kind === "reverse") {
    state.currentSuit = card.suit;
    state.direction *= -1;
    directionChanged = true;
    effectType = "reverse";
  } else {
    state.currentSuit = card.suit;
  }

  state.lastAction = {
    card,
    playerIndex,
    previousTopCard,
    effectType: effectType || "played",
    chosenSuit,
    isSpecial: isSpecialCard(card),
  };

  addLog("playedCard", { playerIndex, card, effectType, suitId: effectSuit });
  if (directionChanged) {
    showDirectionNotice(playerIndex);
  }
  state.drawnThisTurn = false;
  state.drawnCardId = null;
  state.pendingSuitCardId = null;

  if (hand.length === 0) {
    endRound(playerIndex);
    return true;
  }

  state.currentPlayer = nextPlayerIndex(playerIndex);
  render();
  scheduleAiTurn();
  return true;
}

function endRound(winnerIndex) {
  clearTurnTimer();
  state.phase = "roundOver";
  state.winnerIndex = winnerIndex;
  state.aiThinkingIndex = null;
  state.isAnimating = false;
  players[winnerIndex].score += 1;
  saveScores();
  addLog("winner", { playerIndex: winnerIndex });
  render();
}

function drawForCurrentPlayer() {
  if (state.phase !== "playing" || state.isAnimating || state.isRulesOpen) return;
  const playerIndex = state.currentPlayer;
  const player = players[playerIndex];

  if (state.drawnThisTurn) {
    if (playerIndex === HUMAN_INDEX) showToast(t("toastAlreadyDrew"));
    return;
  }

  const playable = player.hand.filter(canPlay);
  if (playable.length) {
    if (playerIndex === HUMAN_INDEX) showToast(t("toastPlayableNoDraw"));
    return;
  }

  const card = drawFromDeck();
  if (!card) {
    addLog("noDraw", { playerIndex });
    finishTurn();
    return;
  }

  player.hand.push(card);
  state.drawnThisTurn = true;
  state.drawnCardId = card.id;
  state.aiThinkingIndex = null;
  addLog("drewCard", { playerIndex });

  if (canPlay(card)) {
    if (playerIndex === HUMAN_INDEX) {
      showToast(t("toastDrawnPlayable"));
      render();
      return;
    }

    render();
    scheduleAiDrawnCardPlay(playerIndex);
    return;
  }

  render();
  if (playerIndex === HUMAN_INDEX) {
    showToast(t("toastDrawnUnplayable"));
  }
  scheduleDrawPass(playerIndex, card.id, playerIndex === HUMAN_INDEX ? 900 : AI_DRAW_PASS_DELAY);
}

function scheduleAiDrawnCardPlay(playerIndex, delay = AI_DRAW_PLAY_DELAY) {
  clearTurnTimer();
  if (state.isRulesOpen || state.phase !== "playing" || state.currentPlayer !== playerIndex) return;

  state.aiThinkingIndex = playerIndex;
  render();
  state.aiTimer = window.setTimeout(() => {
    if (state.isRulesOpen || state.phase !== "playing" || state.currentPlayer !== playerIndex || state.isAnimating) return;
    const freshCard = players[playerIndex].hand.find((item) => item.id === state.drawnCardId);
    if (!freshCard) return;
    if (!canPlay(freshCard)) {
      finishTurn();
      return;
    }
    const suit = isWild(freshCard) ? chooseBestSuit(playerIndex) : null;
    playCard(playerIndex, freshCard.id, suit);
  }, delay);
}

function scheduleDrawPass(playerIndex, cardId, delay) {
  clearTurnTimer();
  if (state.isRulesOpen || state.phase !== "playing" || state.currentPlayer !== playerIndex) return;

  state.aiTimer = window.setTimeout(() => {
    if (!state.isRulesOpen && state.phase === "playing" && state.currentPlayer === playerIndex && state.drawnCardId === cardId) {
      finishTurn();
    }
  }, delay);
}

function scheduleAiTurn(delay = AI_THINK_DELAY) {
  clearTurnTimer();
  if (state.phase !== "playing" || state.currentPlayer === HUMAN_INDEX || state.isRulesOpen) {
    state.aiThinkingIndex = null;
    return;
  }

  state.aiThinkingIndex = state.currentPlayer;
  render();
  state.aiTimer = window.setTimeout(() => {
    runAiTurn();
  }, delay);
}

function runAiTurn() {
  if (state.phase !== "playing" || state.currentPlayer === HUMAN_INDEX || state.isAnimating || state.isRulesOpen) return;

  const playerIndex = state.currentPlayer;
  state.aiThinkingIndex = null;
  render();
  const choices = playableCardsFor(playerIndex);

  if (!choices.length) {
    drawForCurrentPlayer();
    return;
  }

  const card = chooseAiCard(playerIndex, choices);
  const suit = isWild(card) ? chooseBestSuit(playerIndex) : null;
  playCard(playerIndex, card.id, suit);
}

function handleHumanCardClick(cardId) {
  const card = players[HUMAN_INDEX].hand.find((item) => item.id === cardId);
  if (!card) return;

  if (state.phase !== "playing") {
    showToast(t("toastAlreadyOver"));
    return;
  }

  if (state.isRulesOpen) {
    showToast(t("toastRulesPaused"));
    return;
  }

  if (state.isAnimating) {
    showToast(t("toastWaitAnimation"));
    return;
  }

  if (state.currentPlayer !== HUMAN_INDEX) {
    showToast(t("toastWaitAi"));
    return;
  }

  playCard(HUMAN_INDEX, card.id);
}

function closeSuitModal() {
  state.pendingSuitCardId = null;
  render();
}

function openRulesModal() {
  if (state.isRulesOpen) return;
  clearTurnTimer();
  state.isRulesOpen = true;
  state.aiThinkingIndex = null;
  els.rulesModal.classList.add("is-open");
  els.rulesModal.setAttribute("aria-hidden", "false");
  render();
}

function closeRulesModal() {
  const wasPaused = state.isRulesOpen;
  state.isRulesOpen = false;
  els.rulesModal.classList.remove("is-open");
  els.rulesModal.setAttribute("aria-hidden", "true");
  render();
  if (wasPaused) {
    resumeAfterRulesModal();
  }
}

function resumeAfterRulesModal() {
  if (state.phase !== "playing" || state.isAnimating) return;

  const playerIndex = state.currentPlayer;
  const drawnCard = state.drawnCardId ? players[playerIndex].hand.find((card) => card.id === state.drawnCardId) : null;
  if (state.drawnThisTurn && !drawnCard) {
    state.drawnThisTurn = false;
    state.drawnCardId = null;
  }

  if (state.drawnThisTurn && drawnCard) {
    if (playerIndex === HUMAN_INDEX) {
      if (!canPlay(drawnCard)) {
        scheduleDrawPass(playerIndex, drawnCard.id, 900);
      }
      return;
    }

    if (canPlay(drawnCard)) {
      scheduleAiDrawnCardPlay(playerIndex);
    } else {
      scheduleDrawPass(playerIndex, drawnCard.id, AI_DRAW_PASS_DELAY);
    }
    return;
  }

  if (playerIndex !== HUMAN_INDEX) {
    scheduleAiTurn();
  }
}

function render() {
  renderStaticText();
  renderHeader();
  renderSeats();
  renderCenter();
  renderDirectionFlow();
  renderHand();
  renderLog();
  renderDirectionNotice();
  renderSuitModal();
  renderRoundModal();
}

function renderStaticText() {
  const text = copy();
  document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
  document.title = text.brandTitle;
  els.brandMark.textContent = text.brandMark;
  els.brandTitle.textContent = text.brandTitle;
  els.languageButton.textContent = text.languageButton;
  els.languageButton.setAttribute("aria-label", text.switchLanguageLabel);
  updateMusicButton();
  els.rulesButton.textContent = text.rulesButton;
  els.arena.setAttribute("aria-label", text.arenaLabel);
  els.centerTable.setAttribute("aria-label", text.centerTableLabel);
  els.drawPileTitle.textContent = text.drawPile;
  els.drawPileCard.setAttribute("aria-label", text.drawPileLabel);
  els.discardPileTitle.textContent = text.discardPile;
  els.specialSlotLabel.textContent = text.justPlayed;
  els.drawButtonLabel.textContent = text.draw;
  els.handZone.setAttribute("aria-label", text.handZoneLabel);
  els.handTitle.textContent = text.handTitle;
  els.logPanel.setAttribute("aria-label", text.logPanelLabel);
  els.logTitle.textContent = text.gameLog;
  els.suitModalTitle.textContent = text.suitModalTitle;
  els.modalNextRound.textContent = text.continueRound;
  els.rulesTitle.textContent = text.rulesTitle;
  els.rulesCloseButton.setAttribute("aria-label", text.closeRulesLabel);
  const [deckRule, ...otherRules] = text.rules;
  els.rulesContent.innerHTML = [
    `<section><h3>${escapeHtml(deckRule[0])}</h3><p>${escapeHtml(deckRule[1])}</p></section>`,
    `<section class="rules-card-guide"><h3>${escapeHtml(text.specialCardPreviewTitle)}</h3><p>${escapeHtml(text.specialCardPreviewIntro)}</p><div class="rules-card-grid"></div></section>`,
    ...otherRules.map(([title, body]) => `<section><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></section>`),
  ].join("");
  renderRulesCardPreview();
}

function rulesPreviewCards() {
  return [
    { card: { kind: "wild", wildType: "joker" }, label: t("bigJoker") },
    { card: { kind: "reverse", suit: "spade" }, label: t("littleJoker") },
    { card: { kind: "wild", wildType: "dragon" }, label: beastName("dragon") },
    { card: { kind: "wild", wildType: "tiger" }, label: beastName("tiger") },
    { card: { kind: "wild", wildType: "phoenix" }, label: beastName("phoenix") },
  ];
}

function renderRulesCardPreview() {
  const grid = els.rulesContent.querySelector(".rules-card-grid");
  if (!grid) return;

  rulesPreviewCards().forEach(({ card, label }) => {
    const item = document.createElement("div");
    item.className = "rules-card-item";
    const thumb = document.createElement("div");
    thumb.className = "rules-card-thumb";
    thumb.appendChild(renderCard(card, { interactive: false }));
    const caption = document.createElement("div");
    caption.className = "rules-card-caption";
    caption.textContent = label;
    item.append(thumb, caption);
    grid.appendChild(item);
  });
}

function renderHeader() {
  const currentPlayer = players[state.currentPlayer];
  const thinkingPlayer = state.aiThinkingIndex !== null ? players[state.aiThinkingIndex] : null;

  els.roundLabel.textContent = t("round", { round: state.round || 1 });
  els.dealerLabel.textContent = t("dealer", { player: playerName(state.dealerIndex) });
  els.directionLabel.innerHTML = `<span class="direction-icon">${directionIcon()}</span>${directionText()}`;

  if (state.isRulesOpen && state.phase === "playing") {
    els.statusLine.textContent = t("statusPaused", { suit: suitStatusName(state.currentSuit) });
  } else if (state.phase === "roundOver") {
    els.statusLine.textContent = t("statusRoundOver", { player: playerName(state.winnerIndex) });
  } else if (thinkingPlayer) {
    els.statusLine.textContent = t("statusThinking", { player: playerName(state.aiThinkingIndex), suit: suitStatusName(state.currentSuit) });
  } else if (state.isAnimating) {
    els.statusLine.textContent = t("statusPlaying", { player: playerName(state.currentPlayer), suit: suitStatusName(state.currentSuit) });
  } else {
    els.statusLine.textContent = t("statusTurn", { player: currentPlayer ? playerName(state.currentPlayer) : "", suit: suitStatusName(state.currentSuit) });
  }
}

function renderSeats() {
  players.forEach((player, index) => {
    const seat = document.querySelector(`#seat-${index}`);
    const isActive = state.phase === "playing" && !state.isRulesOpen && state.currentPlayer === index;
    const isThinking = !state.isRulesOpen && state.aiThinkingIndex === index;
    const isHuman = index === HUMAN_INDEX;
    const hiddenCount = Math.min(player.hand.length, 6);
    const callout = player.hand.length === 1 ? `<span class="callout">${t("calling")}</span>` : "";

    seat.innerHTML = `
      <article class="player-panel ${isActive ? "is-active" : ""} ${isThinking ? "is-thinking" : ""} ${isHuman ? "is-human" : ""}">
        <div class="score-badge">${t("score", { score: player.score })}</div>
        <div class="avatar ${isHuman ? "human" : player.kind}">${playerShortName(index)}</div>
        <div class="player-name">${playerName(index)}</div>
        <div class="player-meta">
          <span>${t("handCount", { count: player.hand.length })}</span>
          ${index === state.dealerIndex ? `<span>${t("dealerChip")}</span>` : ""}
          ${callout}
          ${isThinking ? `<span class="thinking-chip">${t("thinkingChip")}</span>` : ""}
        </div>
        <div class="mini-hand" aria-hidden="true">
          ${Array.from({ length: hiddenCount }, () => '<span class="mini-card"></span>').join("")}
        </div>
      </article>
    `;
  });
}

function renderDirectionFlow() {
  const flowRect = els.directionFlow.getBoundingClientRect();
  const panels = {
    south: document.querySelector("#seat-0 .player-panel")?.getBoundingClientRect(),
    east: document.querySelector("#seat-1 .player-panel")?.getBoundingClientRect(),
    north: document.querySelector("#seat-2 .player-panel")?.getBoundingClientRect(),
    west: document.querySelector("#seat-3 .player-panel")?.getBoundingClientRect(),
  };

  if (!flowRect.width || !flowRect.height || Object.values(panels).some((panel) => !panel)) {
    els.flowPaths.forEach((path) => path.removeAttribute("d"));
    return;
  }

  els.directionFlow.setAttribute("aria-label", directionText());
  els.directionFlow.classList.toggle("is-clockwise", state.direction === 1);
  els.directionFlow.classList.toggle("is-counter", state.direction === -1);
  els.directionFlowSvg.setAttribute("viewBox", `0 0 ${Math.round(flowRect.width)} ${Math.round(flowRect.height)}`);

  const sideMidpoint = (rect, side) => {
    const x = side === "left" ? rect.left : side === "right" ? rect.right : rect.left + rect.width / 2;
    const y = side === "top" ? rect.top : side === "bottom" ? rect.bottom : rect.top + rect.height / 2;
    return { x: x - flowRect.left, y: y - flowRect.top };
  };
  const q = (start, control, end) =>
    `M${Math.round(start.x)} ${Math.round(start.y)} Q${Math.round(control.x)} ${Math.round(control.y)} ${Math.round(end.x)} ${Math.round(end.y)}`;
  const p = {
    southLeft: sideMidpoint(panels.south, "left"),
    southRight: sideMidpoint(panels.south, "right"),
    westTop: sideMidpoint(panels.west, "top"),
    westBottom: sideMidpoint(panels.west, "bottom"),
    northLeft: sideMidpoint(panels.north, "left"),
    northRight: sideMidpoint(panels.north, "right"),
    eastTop: sideMidpoint(panels.east, "top"),
    eastBottom: sideMidpoint(panels.east, "bottom"),
  };
  const controls = {
    southwest: { x: p.westBottom.x, y: p.southLeft.y },
    northwest: { x: p.westTop.x, y: p.northLeft.y },
    northeast: { x: p.eastTop.x, y: p.northRight.y },
    southeast: { x: p.eastBottom.x, y: p.southRight.y },
  };
  const paths =
    state.direction === 1
      ? [
          q(p.southLeft, controls.southwest, p.westBottom),
          q(p.westTop, controls.northwest, p.northLeft),
          q(p.northRight, controls.northeast, p.eastTop),
          q(p.eastBottom, controls.southeast, p.southRight),
        ]
      : [
          q(p.southRight, controls.southeast, p.eastBottom),
          q(p.eastTop, controls.northeast, p.northRight),
          q(p.northLeft, controls.northwest, p.westTop),
          q(p.westBottom, controls.southwest, p.southLeft),
        ];

  paths.forEach((path, index) => {
    els.flowPaths[index].setAttribute("d", path);
  });
}

function renderCenter() {
  const top = topCard();
  const suit = SUIT_BY_ID[state.currentSuit];
  const specialCard = state.animatingCard && isSpecialCard(state.animatingCard) ? state.animatingCard : null;
  const visibleSpecialAction = state.lastAction?.isSpecial ? state.lastAction : null;
  const shouldShowSpecial = Boolean(specialCard || visibleSpecialAction);
  const baseCard = shouldShowSpecial ? visibleSpecialAction?.previousTopCard || top : top;
  const specialEffectText = specialCard
    ? t("specialPlaying", { card: cardName(specialCard) })
    : visibleSpecialAction
      ? describeCardEffect(visibleSpecialAction)
      : t("waitingSpecial");

  els.activeSuit.innerHTML = `${t("activeSuit")} <span class="suit-symbol ${suit.tone}">${suit.symbol}</span> ${suitName(state.currentSuit)}`;
  els.drawCount.textContent = cardCount(state.deck.length);
  els.discardCount.textContent = cardCount(state.discard.length);
  els.discardSlotLabel.textContent = shouldShowSpecial ? t("previousTopCard") : t("topCard");
  els.discardCard.setAttribute("aria-label", t("tableTopCardLabel"));
  els.cardStage.classList.toggle("has-special", shouldShowSpecial);
  els.discardCard.innerHTML = "";
  els.discardCard.appendChild(renderCard(baseCard, { interactive: false }));
  els.specialPlayPanel.classList.toggle("is-visible", shouldShowSpecial);
  els.playedSpecialCard.innerHTML = "";
  if (visibleSpecialAction?.card && !specialCard) {
    els.playedSpecialCard.appendChild(renderCard(visibleSpecialAction.card, { interactive: false }));
  }
  els.specialEffectText.textContent = specialEffectText;
  els.turnRibbon.textContent =
    state.isRulesOpen && state.phase === "playing"
      ? t("turnPaused")
      : state.phase === "roundOver"
      ? t("roundOver")
      : state.aiThinkingIndex !== null
        ? t("playerThinking", { player: playerName(state.aiThinkingIndex) })
        : state.isAnimating
          ? t("playerPlaying", { player: playerName(state.currentPlayer) })
          : t("playerActing", { player: playerName(state.currentPlayer) });
  els.turnRibbon.classList.toggle("is-thinking", !state.isRulesOpen && state.aiThinkingIndex !== null);

  const isHumanTurn = state.phase === "playing" && !state.isRulesOpen && state.currentPlayer === HUMAN_INDEX;
  const hasPlayable = players[HUMAN_INDEX].hand.some(canPlay);
  els.drawButton.disabled = state.isRulesOpen || state.isAnimating || !isHumanTurn || state.drawnThisTurn || hasPlayable;
  els.drawButton.title = isHumanTurn && hasPlayable ? t("drawDisabledTitle") : "";
  els.drawButton.classList.toggle("primary", isHumanTurn && !hasPlayable);
}

function renderHand() {
  const hand = players[HUMAN_INDEX].hand;
  const isHumanTurn = state.phase === "playing" && !state.isRulesOpen && state.currentPlayer === HUMAN_INDEX;
  els.handZone.classList.toggle("is-expanded", hand.length > 5);
  els.humanHandCount.textContent = cardCount(hand.length);
  els.humanHand.innerHTML = "";

  hand.forEach((card) => {
    const playable = isHumanTurn && playableCardsFor(HUMAN_INDEX).some((item) => item.id === card.id);
    const drawn = state.drawnCardId === card.id;
    const disabled = state.isRulesOpen || state.phase !== "playing" || state.isAnimating || !playable;
    els.humanHand.appendChild(renderCard(card, { interactive: true, playable, drawn, disabled }));
  });

  if (state.isRulesOpen && state.phase === "playing") {
    els.handHint.textContent = t("hintPaused");
  } else if (state.phase === "roundOver") {
    els.handHint.textContent = t("hintRoundOver");
  } else if (state.isAnimating) {
    els.handHint.textContent = t("hintAnimating");
  } else if (state.aiThinkingIndex !== null) {
    els.handHint.textContent = t("hintThinking", { player: playerName(state.aiThinkingIndex) });
  } else if (!isHumanTurn) {
    els.handHint.textContent = t("hintAiActing");
  } else if (state.drawnThisTurn) {
    els.handHint.textContent = t("hintDrawn");
  } else if (hand.some(canPlay)) {
    els.handHint.textContent = t("hintPlayable");
  } else {
    els.handHint.textContent = t("hintMustDraw");
  }
}

function renderLog() {
  els.gameLog.innerHTML = state.log.map((entry) => `<li>${escapeHtml(formatLogEntry(entry))}</li>`).join("");
}

function renderDirectionNotice() {
  const isVisible = Boolean(state.directionNotice);
  els.directionNotice.textContent = isVisible
    ? t("directionNotice", {
        player: playerName(state.directionNotice.playerIndex),
        icon: directionIcon(),
        direction: directionText(),
      })
    : "";
  els.directionNotice.classList.toggle("is-visible", isVisible);
}

function renderSuitModal() {
  const isOpen = Boolean(state.pendingSuitCardId);
  els.suitModal.classList.toggle("is-open", isOpen);
  els.suitModal.setAttribute("aria-hidden", String(!isOpen));

  if (!isOpen) {
    els.suitChoices.innerHTML = "";
    return;
  }

  els.suitChoices.innerHTML = "";
  SUITS.forEach((suit) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `suit-choice ${suit.tone}`;
    button.dataset.suit = suit.id;
    button.setAttribute("aria-label", t("suitChoiceLabel", { symbol: suit.symbol, suit: suitName(suit.id) }));
    button.innerHTML = `<span class="suit-symbol">${suit.symbol}</span><span>${suitName(suit.id)}</span>`;
    els.suitChoices.appendChild(button);
  });
}

function renderRoundModal() {
  const isOpen = state.phase === "roundOver";
  els.roundModal.classList.toggle("is-open", isOpen);
  els.roundModal.setAttribute("aria-hidden", String(!isOpen));

  if (!isOpen) return;

  els.resultMark.textContent = state.winnerIndex === HUMAN_INDEX ? t("resultWin") : t("resultRound");
  els.roundResultTitle.textContent = t("statusRoundOver", { player: playerName(state.winnerIndex) });
  els.roundResultText.textContent = t("roundResultText", {
    scores: players.map((player, index) => t("scorePair", { player: playerName(index), score: player.score })).join(" · "),
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function animatePlayedCard(playerIndex, card) {
  const sourceRect = getPlaySourceRect(playerIndex, card.id);
  const targetElement = isSpecialCard(card) ? els.playedSpecialCard : els.discardCard.querySelector(".card");
  const targetRect = targetElement?.getBoundingClientRect();

  if (!sourceRect || !targetRect) {
    await wait(120);
    return;
  }

  const flyingCard = renderCard(card, { interactive: false });
  const width = targetRect.width;
  const height = targetRect.height;
  const startLeft = sourceRect.left + sourceRect.width / 2 - width / 2;
  const startTop = sourceRect.top + sourceRect.height / 2 - height / 2;
  const endLeft = targetRect.left;
  const endTop = targetRect.top;

  flyingCard.classList.add("flying-card");
  flyingCard.dataset.player = t("flyingCard", { player: playerName(playerIndex) });
  Object.assign(flyingCard.style, {
    left: `${startLeft}px`,
    top: `${startTop}px`,
    width: `${width}px`,
    height: `${height}px`,
  });
  document.body.appendChild(flyingCard);

  const deltaX = endLeft - startLeft;
  const deltaY = endTop - startTop;
  const startScale = playerIndex === HUMAN_INDEX ? 0.88 : 0.58;
  const animationDuration = playerIndex === HUMAN_INDEX ? HUMAN_CARD_ANIMATION_MS : AI_CARD_ANIMATION_MS;

  try {
    const animation = flyingCard.animate(
      [
        {
          opacity: 0.2,
          transform: `translate(0, 0) scale(${startScale}) rotate(-8deg)`,
        },
        {
          opacity: 1,
          transform: `translate(${deltaX * 0.58}px, ${deltaY * 0.46}px) scale(1.08) rotate(4deg)`,
        },
        {
          opacity: 1,
          transform: `translate(${deltaX}px, ${deltaY}px) scale(1) rotate(0deg)`,
        },
      ],
      {
        duration: animationDuration,
        easing: "cubic-bezier(.2,.78,.2,1)",
      },
    );
    await animation.finished;
  } catch {
    await wait(animationDuration);
  } finally {
    flyingCard.remove();
  }
}

function getPlaySourceRect(playerIndex, cardId) {
  if (playerIndex === HUMAN_INDEX) {
    return document.querySelector(`#humanHand [data-card-id="${cardId}"]`)?.getBoundingClientRect();
  }

  return (
    document.querySelector(`#seat-${playerIndex} .mini-hand`)?.getBoundingClientRect() ||
    document.querySelector(`#seat-${playerIndex} .player-panel`)?.getBoundingClientRect()
  );
}

function renderCard(card, options = {}) {
  const { interactive = false, playable = false, drawn = false, disabled = false } = options;
  const el = document.createElement(interactive ? "button" : "div");
  el.className = getCardClasses(card, { playable, drawn });
  if (interactive) {
    el.type = "button";
    el.dataset.cardId = card.id;
    el.setAttribute("aria-label", cardName(card));
    el.disabled = disabled;
  }

  if (card.kind === "number") {
    const suit = SUIT_BY_ID[card.suit];
    el.innerHTML = `
      <span class="corner top"><span class="rank">${card.number}</span><span class="suit-symbol">${suit.symbol}</span></span>
      <span class="pip-grid">${renderPips(card.number, suit.symbol)}</span>
      <span class="corner bottom"><span class="rank">${card.number}</span><span class="suit-symbol">${suit.symbol}</span></span>
    `;
    return el;
  }

  if (card.kind === "reverse") {
    const suit = SUIT_BY_ID[card.suit];
    el.innerHTML = `
      ${renderJokerArt("small", t("littleJoker"), `${suit.symbol} ${suitName(card.suit)} · ${t("reverse")}`)}
    `;
    return el;
  }

  el.innerHTML = card.wildType === "joker" ? renderJokerArt("big", t("bigJoker"), t("wildSuit")) : renderBeastArt(card);
  return el;
}

function renderBeastArt(card) {
  const art = {
    dragon: `
      <path class="beast-cloud" d="M17 77c7-8 16-9 23-4 7-8 22-7 30 2-8 8-44 10-53 2Z" />
      <path class="dragon-body" d="M18 57c10-23 40-34 52-13 7 12-1 29-17 28-11 0-15-8-10-15 5-6 17-4 17 5" />
      <path class="dragon-neck" d="M32 57c7-7 17-8 25-4" />
      <path class="dragon-head" d="M58 32l12-7-1 11 9 5-12 4-7 9-7-8-11 1 8-9-3-10Z" />
      <path class="dragon-horn" d="M58 31l-5-11M66 29l6-10" />
      <circle class="beast-eye" cx="63" cy="38" r="2.4" />
      <path class="dragon-whisker" d="M68 42c8-1 11 3 14 8M56 45c-8 3-11 8-13 14" />
      <path class="dragon-scale" d="M25 57c5 2 8 2 13 0M35 49c5 2 9 2 14 0M46 43c5 1 8 1 12-1" />
    `,
    tiger: `
      <path class="tiger-body" d="M17 70c4-20 14-34 28-34s24 14 28 34c-9 11-47 11-56 0Z" />
      <path class="tiger-ear left" d="M25 38l-8-16 18 7" />
      <path class="tiger-ear right" d="M65 38l8-16-18 7" />
      <path class="tiger-face" d="M23 47c5-12 13-18 22-18s17 6 22 18c4 11-4 28-22 28S19 58 23 47Z" />
      <path class="tiger-stripe" d="M45 31v13M35 36l7 8M55 36l-7 8M28 49l10 3M62 49l-10 3M30 61l9-4M60 61l-9-4" />
      <circle class="beast-eye" cx="37" cy="51" r="2.8" />
      <circle class="beast-eye" cx="53" cy="51" r="2.8" />
      <path class="tiger-nose" d="M41 59h8l-4 5Z" />
      <path class="tiger-mouth" d="M45 64c-3 4-7 5-12 3M45 64c3 4 7 5 12 3" />
      <path class="tiger-tail" d="M69 61c11-2 14-13 8-20" />
    `,
    phoenix: `
      <path class="phoenix-tail" d="M45 59c-18 7-25 18-27 31 12-8 21-13 27-15 6 2 15 7 27 15-2-13-9-24-27-31Z" />
      <path class="phoenix-wing left" d="M42 48c-18-14-28-15-36-9 10 5 15 12 19 22" />
      <path class="phoenix-wing right" d="M48 48c18-14 28-15 36-9-10 5-15 12-19 22" />
      <path class="phoenix-body" d="M33 72c2-24 7-43 12-43s10 19 12 43c-6 7-18 7-24 0Z" />
      <path class="phoenix-neck" d="M44 32c-2-10 3-17 11-21-2 11 2 17 11 22-9 3-16 1-22-1Z" />
      <path class="phoenix-crest" d="M55 11l7-8 2 12 10-4-7 10" />
      <circle class="beast-eye" cx="56" cy="25" r="2.2" />
      <path class="phoenix-feather" d="M31 62c-7 5-13 12-18 22M59 62c7 5 13 12 18 22M45 63v26" />
    `,
  };

  return `
    <span class="card-main beast-main beast-${card.wildType}">
      <svg class="beast-illustration" viewBox="0 0 90 100" aria-hidden="true" focusable="false">
        <rect class="beast-frame" x="11" y="9" width="68" height="82" rx="12" />
        ${art[card.wildType]}
      </svg>
      <span class="beast-title">${beastName(card.wildType)}</span>
      <span class="beast-sub">${t("wildSuit")}</span>
    </span>
  `;
}

function renderJokerArt(variant, title, subtitle) {
  return `
    <span class="card-main joker-main joker-${variant}">
      <span class="joker-side left">JOKER</span>
      <span class="joker-side right">JOKER</span>
      <svg class="joker-illustration" viewBox="0 0 100 120" aria-hidden="true" focusable="false">
        <path class="joker-stage" d="M17 102c12 9 54 9 66 0 5-23-3-43-18-54-8-6-22-6-30 0-15 11-23 31-18 54Z" />
        <path class="joker-hat-left" d="M43 34C30 18 19 11 7 10c8 12 13 25 16 44" />
        <path class="joker-hat-mid" d="M50 31c-4-13-4-24 0-29 5 7 6 17 1 29" />
        <path class="joker-hat-right" d="M57 34c13-16 24-23 36-24-8 12-13 25-16 44" />
        <circle class="joker-bell" cx="7" cy="10" r="4.6" />
        <circle class="joker-bell" cx="50" cy="3" r="4.6" />
        <circle class="joker-bell" cx="93" cy="10" r="4.6" />
        <path class="joker-hair left" d="M31 54c-8 2-12 9-12 18 7-1 12-4 16-9" />
        <path class="joker-hair right" d="M69 54c8 2 12 9 12 18-7-1-12-4-16-9" />
        <ellipse class="joker-face-shape" cx="50" cy="58" rx="22" ry="25" />
        <circle class="joker-eye" cx="42" cy="54" r="2.7" />
        <circle class="joker-eye" cx="58" cy="54" r="2.7" />
        <path class="joker-smile" d="M40 67c6 6 14 6 20 0" />
        <path class="joker-collar" d="M20 95l12-19 10 18 8-19 8 19 10-18 12 19c-12 13-48 13-60 0Z" />
        <path class="joker-staff" d="M74 43c13 13 9 32-8 45" />
        <circle class="joker-staff-top" cx="79" cy="47" r="5.8" />
      </svg>
      <span class="joker-title">${title}</span>
      <span class="joker-sub">${subtitle}</span>
    </span>
  `;
}

function renderPips(count, symbol) {
  const positions = {
    1: [[4, 2]],
    2: [
      [1, 2],
      [7, 2],
    ],
    3: [
      [1, 2],
      [4, 2],
      [7, 2],
    ],
    4: [
      [1, 1],
      [1, 3],
      [7, 1],
      [7, 3],
    ],
    5: [
      [1, 1],
      [1, 3],
      [4, 2],
      [7, 1],
      [7, 3],
    ],
    6: [
      [1, 1],
      [1, 3],
      [4, 1],
      [4, 3],
      [7, 1],
      [7, 3],
    ],
    7: [
      [1, 1],
      [1, 3],
      [3, 2],
      [4, 1],
      [4, 3],
      [7, 1],
      [7, 3],
    ],
    8: [
      [1, 1],
      [1, 3],
      [3, 2],
      [4, 1],
      [4, 3],
      [5, 2],
      [7, 1],
      [7, 3],
    ],
    9: [
      [1, 1],
      [1, 2],
      [1, 3],
      [4, 1],
      [4, 2],
      [4, 3],
      [7, 1],
      [7, 2],
      [7, 3],
    ],
  };

  return positions[count]
    .map(([row, column]) => `<span class="pip" style="grid-row:${row};grid-column:${column};">${symbol}</span>`)
    .join("");
}

function getCardClasses(card, { playable, drawn }) {
  const classes = ["card"];
  if (card.suit) {
    classes.push(SUIT_BY_ID[card.suit].tone);
  }
  if (card.kind === "reverse") {
    classes.push("reverse");
  }
  if (isWild(card)) {
    classes.push(`wild-${card.wildType}`);
  }
  if (playable) classes.push("playable");
  if (!playable && state.phase === "playing" && !state.isRulesOpen && state.currentPlayer === HUMAN_INDEX) classes.push("unplayable");
  if (drawn) classes.push("drawn");
  return classes.join(" ");
}

els.humanHand.addEventListener("click", (event) => {
  const card = event.target.closest("[data-card-id]");
  if (!card) return;
  handleHumanCardClick(card.dataset.cardId);
});

els.drawButton.addEventListener("click", () => {
  if (state.isRulesOpen || state.currentPlayer !== HUMAN_INDEX || state.phase !== "playing") {
    showToast(t("toastCannotDraw"));
    return;
  }
  drawForCurrentPlayer();
});

els.modalNextRound.addEventListener("click", startRound);
els.rulesButton.addEventListener("click", openRulesModal);
els.rulesCloseButton.addEventListener("click", closeRulesModal);
els.musicButton.addEventListener("click", () => {
  state.musicEnabled = !state.musicEnabled;
  updateMusicButton();
  if (state.musicEnabled) {
    startMusic();
  } else {
    stopMusic();
  }
});
els.languageButton.addEventListener("click", () => {
  state.language = state.language === "en" ? "zh" : "en";
  render();
});

els.suitChoices.addEventListener("click", (event) => {
  const button = event.target.closest("[data-suit]");
  if (!button || !state.pendingSuitCardId) return;
  const cardId = state.pendingSuitCardId;
  const suit = button.dataset.suit;
  state.pendingSuitCardId = null;
  playCard(HUMAN_INDEX, cardId, suit);
});

els.suitModal.addEventListener("click", (event) => {
  if (event.target === els.suitModal) closeSuitModal();
});

els.rulesModal.addEventListener("click", (event) => {
  if (event.target === els.rulesModal) closeRulesModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (els.rulesModal.classList.contains("is-open")) {
    closeRulesModal();
  } else if (state.pendingSuitCardId) {
    closeSuitModal();
  }
});

loadScores();
updateMusicButton();
setupMusicAutoplay();
startRound();
