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
const MUSIC_BPM = 132;
const MUSIC_STEP_SECONDS = 60 / MUSIC_BPM / 2;
const MUSIC_LOOP_STEPS = 32;
const MUSIC_VOLUME = 0.24;
const MUSIC_DUCK_VOLUME = 0.07;
const SPEECH_VOLUME = 1;
const VOICE_CONFIRM_VOLUME = 0.92;
const MUSIC_STOP_CHANNEL = "divine-gold-flip:music-stop";
const MUSIC_PREF_KEY = "divine-gold-flip:music-enabled";
const MUSIC_OWNER_KEY = "divine-gold-flip:music-owner";
const MUSIC_OWNER_CHECK_MS = 650;
const MUSIC_LOCK_NAME = "divine-gold-flip:music-lock";
const MUSIC_INSTANCE_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const MUSIC_CONTROLLER_KEY = "__divineGoldFlipMusicController";
const MUSIC_REGISTRY_KEY = "__divineGoldFlipMusicAudios";
const SFX_REGISTRY_KEY = "__divineGoldFlipSfxAudios";
const ANALYTICS_STATE_KEY = "__divineGoldFlipAnalytics";
const MUSIC_AUDIO_ATTRIBUTE = "data-divine-gold-flip-music";

let nextCardId = 1;
let toastTimer = 0;
let directionNoticeTimer = 0;
let musicAudio = null;
let musicChannel = null;
let musicSessionId = 0;
let musicStartPromise = null;
let musicOwnerTimer = 0;
let releaseMusicLock = null;
let pageAudioCleanupDone = false;
let speechDuckingToken = 0;
let speechEngineTouched = false;
let activeSpeechUtterances = new Set();
let dealCueDataUrl = "";
let lastCardCueDataUrl = "";
let victoryCueDataUrl = "";

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
    welcomeKicker: "Divine Gold Flip",
    welcomeTitle: "Welcome to Divine Gold Flip",
    welcomeSubtitle: "Press start to deal the round and watch the order around the table.",
    startGame: "Start Game",
    musicOnLabel: "Background music on. Click to mute.",
    musicReadyLabel: "Background music ready. Click to mute.",
    musicOffLabel: "Background music off. Click to play.",
    voiceOnLabel: "Voice narration on. Click to mute.",
    voiceOffLabel: "Voice narration off. Click to play.",
    rulesButton: "Rules",
    round: "Round {round}",
    dealer: "Dealer: {player}",
    score: "{score} pts",
    handCount: "Cards {count}",
    cardCount: "{count} cards",
    cardCountOne: "{count} card",
    dealerChip: "Dealer",
    calling: "Last card",
    turnChip: "Turn",
    thinkingChip: "Thinking",
    activeSuit: "Active suit",
    drawPile: "Draw Pile",
    discardPile: "Discard Pile",
    topCard: "Top Card",
    previousTopCard: "Previous Top",
    justPlayed: "Just Played",
    waitingSpecial: "Waiting for a special card",
    turnPaused: "Game Paused",
    tableWaiting: "Waiting for start",
    dealOrderTitle: "Deal order",
    dealingChip: "Dealing",
    dealingTo: "Dealing to {player} · card {card}/5",
    roundOver: "Round Over",
    playerThinking: "{player} thinking",
    playerPlaying: "{player} playing",
    playerActing: "{player} turn",
    draw: "Draw",
    handTitle: "Your Hand",
    gameLog: "Game Log",
    logOpenButton: "Log",
    logCloseButton: "Close",
    logOpenLabel: "Open game log",
    logCloseLabel: "Close game log",
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
    statusWelcome: "Welcome · press Start Game",
    statusDealing: "Dealing cards · {player} card {card} of 5",
    statusRoundOver: "{player} won; score has been added",
    statusThinking: "{player} is thinking · active {suit}",
    statusPlaying: "{player} is playing · active {suit}",
    statusTurn: "{player}'s turn · active {suit}",
    hintPaused: "Rules are open. The game is paused.",
    hintWelcome: "Press Start Game to deal the first round.",
    hintDealing: "Dealing cards around the table.",
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
    beastPass: "Beast Pass",
    activeNumber: "number {number}",
    noActiveNumber: "no active number",
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
    effectBeast: "{card} played. Active suit and number stay {symbol} {suit}, {number}",
    effectReverse: "{card} is active. Direction changed to {icon} {direction}; active suit stays {symbol} {suit}",
    effectPlayed: "{card} played",
    voicePlayed: "{player} played {card}.",
    voiceSuitChanged: "Suit changed to {symbol} {suit}.",
    voiceDirectionChanged: "Direction changed to {icon} {direction}.",
    voiceWinner: "Winner is {winner}.",
    voiceRoundStart: "Game start.",
    voiceMustDraw: "No playable card. You must draw first.",
    voiceOnConfirm: "Voice narration on.",
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
    logEffectBeast: ", kept the active suit and number",
    logEffectReverse: ", direction reversed",
    logWinner: "{player} emptied their hand and won the round.",
    logNoDraw: "{player} had no card to draw; turn ends.",
    logDrewCard: "{player} drew 1 card.",
    directionNotice: "{player} played Little Joker. Direction changed to {icon} {direction}.",
    rules: [
      ["Deck", "55 cards total: four suits with 1-9 once each for 36 number cards, 4 Big Jokers, 6 Little Jokers, and 3 each of Azure Dragon, White Tiger, and Vermilion Bird."],
      ["Basics", "One human player faces 3 AI opponents. Everyone starts with 5 cards. The player after the dealer starts, and play begins clockwise."],
      ["Playing Cards", "Number cards must match the active suit or the active number. If you have no legal card, you must draw 1 card. A playable drawn card can be played immediately."],
      ["Special Cards", "Big Joker can be played anytime and choose the next active suit. Azure Dragon, White Tiger, and Vermilion Bird can be played as 1-9 number-card substitutes only: they do not change suit, number, or direction, so the next player still follows the previous active suit and number."],
      ["Little Joker", "Little Joker can be played on your turn as a reverse card. It reverses direction immediately and keeps the current active suit and number unchanged."],
      ["Winning", "The first player to empty their hand wins the round and gains 1 point. Scores keep accumulating."],
    ],
  },
  zh: {
    brandTitle: "神兽转向牌",
    brandMark: "令",
    languageButton: "English",
    switchLanguageLabel: "切换到英文",
    welcomeKicker: "神兽转向牌",
    welcomeTitle: "欢迎来到神兽转向牌",
    welcomeSubtitle: "点击开始后发牌，并展示每一家的发牌顺序。",
    startGame: "开始游戏",
    musicOnLabel: "背景音乐已开启，点击关闭。",
    musicReadyLabel: "背景音乐已准备好，点击关闭。",
    musicOffLabel: "背景音乐已关闭，点击开启。",
    voiceOnLabel: "语音播报已开启，点击关闭。",
    voiceOffLabel: "语音播报已关闭，点击开启。",
    rulesButton: "规则",
    round: "第 {round} 局",
    dealer: "庄家: {player}",
    score: "{score} 分",
    handCount: "手牌 {count}",
    cardCount: "{count} 张",
    cardCountOne: "{count} 张",
    dealerChip: "庄家",
    calling: "报牌",
    turnChip: "轮到",
    thinkingChip: "思考中",
    activeSuit: "当前花色",
    drawPile: "抽牌堆",
    discardPile: "弃牌堆",
    topCard: "桌面顶牌",
    previousTopCard: "原顶牌",
    justPlayed: "刚打出",
    waitingSpecial: "等待特殊牌",
    turnPaused: "游戏暂停",
    tableWaiting: "等待开始",
    dealOrderTitle: "发牌顺序",
    dealingChip: "发牌中",
    dealingTo: "发给{player} · 第 {card}/5 张",
    roundOver: "本局结束",
    playerThinking: "{player} 思考中",
    playerPlaying: "{player} 出牌中",
    playerActing: "轮到{player}",
    draw: "摸牌",
    handTitle: "你的手牌",
    gameLog: "对局记录",
    logOpenButton: "记录",
    logCloseButton: "收起",
    logOpenLabel: "打开对局记录",
    logCloseLabel: "收起对局记录",
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
    statusWelcome: "欢迎 · 点击开始游戏",
    statusDealing: "正在发牌 · {player} 第 {card}/5 张",
    statusRoundOver: "{player} 获胜，比分已累计",
    statusThinking: "{player} 正在思考 · 当前 {suit}",
    statusPlaying: "{player} 正在出牌 · 当前 {suit}",
    statusTurn: "轮到 {player} · 当前 {suit}",
    hintPaused: "规则打开，游戏已暂停。",
    hintWelcome: "点击开始游戏后发第一局。",
    hintDealing: "正在按顺序发牌。",
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
    beastPass: "神兽跳过",
    activeNumber: "数字 {number}",
    noActiveNumber: "无生效数字",
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
    effectBeast: "{card} 已打出，继续沿用 {symbol} {suit}、{number}",
    effectReverse: "{card} 生效，方向改为 {icon} {direction}，继续沿用 {symbol} {suit}",
    effectPlayed: "{card} 已打出",
    voicePlayed: "{player} 打出 {card}。",
    voiceSuitChanged: "花色改为 {symbol} {suit}。",
    voiceDirectionChanged: "方向改为 {icon} {direction}。",
    voiceWinner: "赢家是{winner}。",
    voiceRoundStart: "游戏开始。",
    voiceMustDraw: "无牌可出，你要先摸牌。",
    voiceOnConfirm: "语音播报已开启。",
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
    logEffectBeast: "，沿用当前花色和数字",
    logEffectReverse: "，出牌方向反转",
    logWinner: "{player} 打空手牌，赢得本局。",
    logNoDraw: "{player} 无牌可摸，回合结束。",
    logDrewCard: "{player} 摸了 1 张牌。",
    directionNotice: "{player} 打出小王，方向改为 {icon} {direction}。",
    rules: [
      ["牌组", "共 55 张：四种花色 1-9 各 1 张，共 36 张；大王 4 张；小王 6 张；青龙、白虎、朱雀各 3 张。"],
      ["基础玩法", "真人玩家对战 3 个 AI。每人开局 5 张手牌，庄家下家先手，默认顺时针行动。"],
      ["出牌规则", "数字牌必须匹配当前花色或当前生效数字。没有可出牌时必须摸 1 张，刚摸到的牌若可出可以立刻打出。"],
      ["特殊牌", "大王可任意打出，并指定下一轮花色。青龙、白虎、朱雀只能作为 1-9 数字普通牌的替代牌：不改变花色、不改变数字、不改变方向，相当于跳过自己，下一位仍沿用上一家的花色和数字。"],
      ["小王", "小王在自己的回合可作为反转牌打出，打出后立即反转方向，并继续沿用当前花色和数字。"],
      ["胜负", "率先打空手牌者本局获胜并获得 1 分。分数会持续累计，不清零。"],
    ],
  },
};

const state = {
  language: DEFAULT_LANGUAGE,
  deck: [],
  discard: [],
  currentSuit: "spade",
  currentNumber: null,
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
  dealingTarget: null,
  dealingCardNumber: 0,
  mustDrawVoiceKey: "",
  isLogOpen: false,
  musicEnabled: true,
  voiceEnabled: true,
  log: [],
  aiTimer: 0,
};

const els = {
  app: document.querySelector(".app"),
  brandMark: document.querySelector("#brandMark"),
  brandTitle: document.querySelector("#brandTitle"),
  statusLine: document.querySelector("#statusLine"),
  roundLabel: document.querySelector("#roundLabel"),
  dealerLabel: document.querySelector("#dealerLabel"),
  directionLabel: document.querySelector("#directionLabel"),
  languageButton: document.querySelector("#languageButton"),
  musicButton: document.querySelector("#musicButton"),
  voiceButton: document.querySelector("#voiceButton"),
  directionFlow: document.querySelector("#directionFlow"),
  directionFlowSvg: document.querySelector(".direction-flow-svg"),
  flowPaths: [...document.querySelectorAll(".flow-path")],
  dealBanner: document.querySelector("#dealBanner"),
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
  logToggleButton: document.querySelector("#logToggleButton"),
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
  welcomeScreen: document.querySelector("#welcomeScreen"),
  welcomeKicker: document.querySelector("#welcomeKicker"),
  welcomeTitle: document.querySelector("#welcomeTitle"),
  welcomeSubtitle: document.querySelector("#welcomeSubtitle"),
  startGameButton: document.querySelector("#startGameButton"),
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

function renderPlayerAvatar(playerIndex) {
  const avatarSymbols = ["凤", "翠", "北", "西"];
  const label = escapeHtml(playerName(playerIndex));
  const symbol = avatarSymbols[playerIndex] || playerShortName(playerIndex);

  return `
    <div class="avatar avatar-player-${playerIndex} ${playerIndex === HUMAN_INDEX ? "human" : players[playerIndex].kind}" role="img" aria-label="${label} avatar">
      <svg class="avatar-art" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <circle class="avatar-bg-circle" cx="32" cy="32" r="31"></circle>
        <path class="avatar-aura" d="M13 44c4-13 12-23 20-23s16 10 20 23c-6 8-13 12-20 12s-14-4-20-12Z"></path>
        <path class="avatar-hair-back" d="M17 34c0-14 7-24 16-24s15 9 15 23c0 8-4 17-15 20-12-4-16-11-16-19Z"></path>
        <path class="avatar-shoulders" d="M11 58c2-12 11-18 22-18s20 6 22 18H11Z"></path>
        <path class="avatar-robe" d="M20 58c2-8 6-13 13-13s11 5 13 13H20Z"></path>
        <ellipse class="avatar-face" cx="33" cy="29" rx="11" ry="14"></ellipse>
        <path class="avatar-hair" d="M20 27c2-12 8-18 15-18 7 1 12 7 13 18-5-5-10-7-16-8-4 3-8 5-12 8Z"></path>
        <path class="avatar-bang" d="M25 19c2 5 5 7 10 8-3-4-3-8 0-13-4 1-8 3-10 5Z"></path>
        <path class="avatar-side-locks" d="M21 25c-5 9-4 18 2 25M45 25c5 9 4 18-2 25"></path>
        <path class="avatar-beard" d="M27 38c2 4 10 4 12 0 0 5-3 8-6 8s-6-3-6-8Z"></path>
        <path class="avatar-hairpin" d="M40 16l9-4M42 11l5 8"></path>
        <circle class="avatar-eye" cx="29" cy="30" r="1.4"></circle>
        <circle class="avatar-eye" cx="37" cy="30" r="1.4"></circle>
        <path class="avatar-brow" d="M26 27c2-1 4-1 6 0M34 27c2-1 4-1 6 0"></path>
        <path class="avatar-mouth" d="M30 37c2 1.5 5 1.5 7 0"></path>
        <path class="avatar-collar" d="M24 48l9 7 9-7"></path>
        <path class="avatar-ornament" d="M24 16l8-8 8 8M28 14h8"></path>
        <text class="avatar-symbol" x="47" y="20">${escapeHtml(symbol)}</text>
      </svg>
    </div>
  `;
}

function suitName(suitId) {
  const suit = SUIT_BY_ID[suitId];
  return suit?.names[state.language] || suit?.names[DEFAULT_LANGUAGE] || "";
}

function suitStatusName(suitId) {
  const suit = SUIT_BY_ID[suitId];
  if (!suit) return "";
  return `${suit.symbol} ${suitName(suitId)} · ${currentNumberStatus()}`;
}

function currentNumberStatus() {
  return state.currentNumber ? t("activeNumber", { number: state.currentNumber }) : t("noActiveNumber");
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

function analyticsState() {
  try {
    if (!window[ANALYTICS_STATE_KEY]) {
      window[ANALYTICS_STATE_KEY] = {
        googleMeasurementId: "",
        googleScriptLoaded: false,
        loadedEvents: new Set(),
      };
    }
    return window[ANALYTICS_STATE_KEY];
  } catch {
    return {
      googleMeasurementId: "",
      googleScriptLoaded: false,
      loadedEvents: new Set(),
    };
  }
}

function analyticsConfig() {
  return window.DIVINE_GOLD_FLIP_ANALYTICS || {};
}

function configuredGoogleMeasurementId() {
  const measurementId = String(analyticsConfig().googleMeasurementId || "").trim();
  return /^G-[A-Z0-9]+$/i.test(measurementId) ? measurementId : "";
}

function initAnalytics() {
  const measurementId = configuredGoogleMeasurementId();
  if (!measurementId) return false;

  const stateRef = analyticsState();
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  if (stateRef.googleMeasurementId !== measurementId) {
    stateRef.googleMeasurementId = measurementId;
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view: false });
  }

  if (!stateRef.googleScriptLoaded) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
    stateRef.googleScriptLoaded = true;
  }

  return true;
}

function trackAnalyticsEvent(eventName, params = {}) {
  if (!initAnalytics()) return;
  try {
    window.gtag?.("event", eventName, {
      app_name: "Divine Gold Flip",
      app_language: state.language,
      page_location: window.location.href,
      ...params,
    });
  } catch {
    // Analytics should never interrupt gameplay.
  }
}

function trackAnalyticsEventOnce(eventName, params = {}) {
  if (!configuredGoogleMeasurementId()) return;
  const stateRef = analyticsState();
  if (stateRef.loadedEvents.has(eventName)) return;
  stateRef.loadedEvents.add(eventName);
  trackAnalyticsEvent(eventName, params);
}

function loadMusicPreference() {
  state.musicEnabled = true;
  try {
    localStorage.setItem(MUSIC_PREF_KEY, "on");
  } catch {
    // Music defaults to on even if storage is unavailable.
  }
}

function saveMusicPreference() {
  try {
    localStorage.setItem(MUSIC_PREF_KEY, state.musicEnabled ? "on" : "off");
  } catch {
    // The button state still works for the current page if storage is unavailable.
  }
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

function isBigJoker(card) {
  return card?.kind === "wild" && card.wildType === "joker";
}

function isBeastWild(card) {
  return card?.kind === "wild" && card.wildType !== "joker";
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
      ? t("littleJoker")
      : t("littleJoker");
  }
  return card.wildType === "joker" ? t("bigJoker") : beastName(card.wildType);
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
  const audioState = els.musicButton.dataset.audioState || (state.musicEnabled ? "idle" : "off");
  const isPlaying = state.musicEnabled && audioState === "playing";
  const isOn = state.musicEnabled;
  const isStarting = isOn && audioState === "starting";
  const label = isPlaying ? t("musicOnLabel") : isOn ? t("musicReadyLabel") : t("musicOffLabel");
  els.musicButton.classList.toggle("is-on", isOn);
  els.musicButton.classList.toggle("is-waiting", isStarting);
  els.musicButton.classList.toggle("is-off", !state.musicEnabled);
  els.musicButton.setAttribute("aria-label", label);
  els.musicButton.setAttribute("aria-pressed", String(isOn));
  els.musicButton.dataset.music = isOn ? "on" : "off";
  els.musicButton.title = label;
}

function updateVoiceButton() {
  const label = state.voiceEnabled ? t("voiceOnLabel") : t("voiceOffLabel");
  els.voiceButton.classList.toggle("is-on", state.voiceEnabled);
  els.voiceButton.classList.toggle("is-off", !state.voiceEnabled);
  els.voiceButton.setAttribute("aria-label", label);
  els.voiceButton.setAttribute("aria-pressed", String(state.voiceEnabled));
  els.voiceButton.dataset.voice = state.voiceEnabled ? "on" : "off";
  els.voiceButton.title = label;
}

function audioRegistry(key) {
  try {
    if (!window[key]) window[key] = new Set();
    return window[key];
  } catch {
    return new Set();
  }
}

function musicRegistry() {
  return audioRegistry(MUSIC_REGISTRY_KEY);
}

function sfxRegistry() {
  return audioRegistry(SFX_REGISTRY_KEY);
}

function canPlayAudioNow() {
  return state.musicEnabled && !pageAudioCleanupDone && document.visibilityState !== "hidden";
}

function canSpeakNow() {
  return state.voiceEnabled && !pageAudioCleanupDone && document.visibilityState !== "hidden";
}

function setBackgroundMusicVolume(volume) {
  const registry = musicRegistry();
  const controller = musicController();
  const knownAudios = new Set(registry);
  if (musicAudio) knownAudios.add(musicAudio);
  if (controller.audio) knownAudios.add(controller.audio);

  knownAudios.forEach((audio) => {
    if (!audio) return;
    try {
      audio.volume = volume;
    } catch {
      // Volume changes are best-effort across browser audio implementations.
    }
  });
}

function duckBackgroundMusicForSpeech() {
  const token = ++speechDuckingToken;
  setBackgroundMusicVolume(MUSIC_DUCK_VOLUME);
  return () => {
    if (speechDuckingToken === token) setBackgroundMusicVolume(MUSIC_VOLUME);
  };
}

function musicController() {
  try {
    if (!window[MUSIC_CONTROLLER_KEY]) {
      window[MUSIC_CONTROLLER_KEY] = {
        audio: null,
      };
    }
    return window[MUSIC_CONTROLLER_KEY];
  } catch {
    return { audio: null };
  }
}

function attachMusicAudio(audio) {
  if (!audio) return;
  audio.setAttribute(MUSIC_AUDIO_ATTRIBUTE, MUSIC_INSTANCE_ID);
  audio.style.display = "none";
  audio.controls = false;
  if (!audio.parentNode) {
    (document.body || document.documentElement).appendChild(audio);
  }
}

function detachMusicAudio(audio) {
  if (!audio?.parentNode || !audio.hasAttribute(MUSIC_AUDIO_ATTRIBUTE)) return;
  try {
    audio.parentNode.removeChild(audio);
  } catch {
    // The node may already be gone after navigation or browser cleanup.
  }
}

function stopAudioElement(audio) {
  if (!audio) return;
  try {
    audio.muted = true;
    audio.volume = 0;
    audio.pause();
    audio.loop = false;
    audio.currentTime = 0;
    audio.removeAttribute("src");
    audio.src = "";
    audio.load();
  } catch {
    // Some browsers throw while tearing down data-url audio. The reference is still dropped.
  }
}

function stopRegisteredMusicAudios(except = null) {
  const registry = musicRegistry();
  const controller = musicController();
  const knownAudios = new Set(registry);
  if (musicAudio) knownAudios.add(musicAudio);
  if (controller.audio) knownAudios.add(controller.audio);
  document.querySelectorAll(`audio[${MUSIC_AUDIO_ATTRIBUTE}]`).forEach((audio) => knownAudios.add(audio));

  knownAudios.forEach((audio) => {
    if (audio === except) {
      registry.add(audio);
      attachMusicAudio(audio);
      return;
    }
    stopAudioElement(audio);
    registry.delete(audio);
    detachMusicAudio(audio);
  });

  if (except) {
    musicAudio = except;
    controller.audio = except;
    registry.add(except);
    attachMusicAudio(except);
  } else {
    musicAudio = null;
    controller.audio = null;
  }
}

function stopActiveSfx() {
  const registry = sfxRegistry();
  registry.forEach((audio) => {
    stopAudioElement(audio);
    registry.delete(audio);
  });
}

function stopActiveSpeech() {
  try {
    window.speechSynthesis?.cancel();
    activeSpeechUtterances.clear();
  } catch {
    // Speech synthesis cancellation is best-effort.
  }
}

function publishMusicOwner(status) {
  try {
    localStorage.setItem(
      MUSIC_OWNER_KEY,
      JSON.stringify({
        source: MUSIC_INSTANCE_ID,
        status,
        time: Date.now(),
      }),
    );
  } catch {
    // Ownership polling is a fallback for browsers where BroadcastChannel is unreliable.
  }
}

function readMusicOwner() {
  try {
    return JSON.parse(localStorage.getItem(MUSIC_OWNER_KEY) || "null");
  } catch {
    return null;
  }
}

function shouldYieldToMusicOwner(owner) {
  return owner?.source && owner.source !== MUSIC_INSTANCE_ID && owner.status === "playing" && Date.now() - Number(owner.time || 0) < 3000;
}

function yieldToExternalMusicOwner(owner) {
  if (!shouldYieldToMusicOwner(owner)) return;
  state.musicEnabled = false;
  saveMusicPreference();
  stopMusic({ broadcast: false, publish: false });
}

function checkMusicOwnership() {
  if (!state.musicEnabled && els.musicButton.dataset.audioState === "off") return;
  yieldToExternalMusicOwner(readMusicOwner());
}

function setupMusicOwnershipMonitor() {
  if (musicOwnerTimer) return;
  musicOwnerTimer = window.setInterval(checkMusicOwnership, MUSIC_OWNER_CHECK_MS);
}

function unlockMusicPlayback() {
  if (!releaseMusicLock) return;
  try {
    releaseMusicLock();
  } catch {
    // Releasing an already-settled lock is harmless.
  }
  releaseMusicLock = null;
}

function acquireMusicPlaybackLock() {
  const locks = window.navigator?.locks || (typeof navigator !== "undefined" ? navigator.locks : null);
  if (!locks?.request) return Promise.resolve(true);

  unlockMusicPlayback();

  return new Promise((resolve) => {
    let settled = false;
    const settle = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    locks
      .request(MUSIC_LOCK_NAME, { ifAvailable: true }, async (lock) => {
        if (!lock) {
          settle(false);
          return;
        }

        await new Promise((release) => {
          releaseMusicLock = release;
          settle(true);
        });
      })
      .catch(() => settle(true));
  });
}

function initMusicEngine() {
  const controller = musicController();
  const existingAudio = musicAudio || controller.audio;
  if (existingAudio?.src) {
    musicAudio = existingAudio;
    controller.audio = existingAudio;
    existingAudio.volume = MUSIC_VOLUME;
    stopRegisteredMusicAudios(existingAudio);
    return true;
  }

  try {
    stopRegisteredMusicAudios();
    musicAudio = document.createElement("audio");
    musicAudio.src = createMusicLoopDataUrl();
    musicAudio.loop = true;
    musicAudio.preload = "auto";
    musicAudio.volume = MUSIC_VOLUME;
    controller.audio = musicAudio;
    stopRegisteredMusicAudios(musicAudio);
  } catch {
    musicAudio = null;
    controller.audio = null;
    return false;
  }
  return true;
}

function noteFrequency(note) {
  const [, name, octaveText] = note.match(/^([A-G]#?)(\d)$/) || [];
  const semitones = { C: -9, "C#": -8, D: -7, "D#": -6, E: -5, F: -4, "F#": -3, G: -2, "G#": -1, A: 0, "A#": 1, B: 2 };
  const octave = Number(octaveText);
  return 440 * 2 ** ((semitones[name] + (octave - 4) * 12) / 12);
}

function writeAscii(view, offset, text) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function createMusicLoopDataUrl() {
  const sampleRate = 22050;
  const loopSeconds = MUSIC_STEP_SECONDS * MUSIC_LOOP_STEPS;
  const sampleCount = Math.floor(sampleRate * loopSeconds);
  const bytesPerSample = 2;
  const dataSize = sampleCount * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const melody = ["E5", "G5", "B5", "E6", "D6", "B5", "G5", "B5", "A5", "C6", "E6", "C6", "B5", "G5", "E5", "G5"].map(noteFrequency);
  const counterMelody = ["B4", "E5", "G5", "E5", "C5", "E5", "A5", "E5"].map(noteFrequency);
  const bass = ["E2", "E2", "B2", "E3", "C3", "C3", "G2", "C3", "D3", "D3", "A2", "D3", "B2", "B2", "F#2", "B2"].map(noteFrequency);
  const chords = [
    ["E4", "G4", "B4"],
    ["C4", "E4", "G4"],
    ["D4", "F#4", "A4"],
    ["B3", "D4", "F#4"],
  ].map((notes) => notes.map(noteFrequency));

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  for (let sample = 0; sample < sampleCount; sample += 1) {
    const time = sample / sampleRate;
    const step = Math.floor(time / MUSIC_STEP_SECONDS) % melody.length;
    const stepPhase = (time % MUSIC_STEP_SECONDS) / MUSIC_STEP_SECONDS;
    const quarterPhase = (time % (MUSIC_STEP_SECONDS * 2)) / (MUSIC_STEP_SECONDS * 2);
    const quarterStep = Math.floor(time / (MUSIC_STEP_SECONDS * 2));
    const phrase = Math.floor(time / (MUSIC_STEP_SECONDS * 8)) % chords.length;
    const bassStep = Math.floor(time / MUSIC_STEP_SECONDS) % bass.length;
    const counterStep = Math.floor(time / (MUSIC_STEP_SECONDS * 2)) % counterMelody.length;
    const counterPhase = (time % (MUSIC_STEP_SECONDS * 2)) / (MUSIC_STEP_SECONDS * 2);
    const melodyEnvelope = Math.min(1, stepPhase / 0.028) * Math.max(0, (1 - stepPhase) ** 0.78);
    const counterEnvelope = Math.min(1, counterPhase / 0.05) * Math.max(0, (1 - counterPhase) ** 1.45);
    const bassPhase = stepPhase;
    const bassEnvelope = Math.min(1, bassPhase / 0.025) * Math.max(0, (1 - bassPhase) ** 0.62);
    const chordPhase = (time % (MUSIC_STEP_SECONDS * 8)) / (MUSIC_STEP_SECONDS * 8);
    const chordEnvelope = Math.min(1, chordPhase / 0.035) * Math.max(0, (1 - chordPhase) ** 0.7);
    const kickEnvelope = Math.max(0, (1 - quarterPhase) ** 4.3);
    const snareEnvelope = quarterStep % 4 === 1 || quarterStep % 4 === 3 ? Math.max(0, (1 - quarterPhase) ** 7) : 0;
    const hatEnvelope = Math.max(0, (1 - stepPhase) ** 10);
    const pulse = Math.sign(Math.sin(Math.PI * 2 * melody[step] * time));
    const melodyWave = (Math.sin(Math.PI * 2 * melody[step] * time) * 0.62 + pulse * 0.38) * 0.27 * melodyEnvelope;
    const counterWave = Math.sin(Math.PI * 2 * counterMelody[counterStep] * time) * 0.1 * counterEnvelope;
    const bassWave =
      (Math.sin(Math.PI * 2 * bass[bassStep] * time) * 0.7 + Math.sign(Math.sin(Math.PI * 2 * bass[bassStep] * time)) * 0.3) *
      0.19 *
      bassEnvelope;
    const chordWave =
      chords[phrase].reduce((total, frequency) => total + Math.sin(Math.PI * 2 * frequency * time), 0) *
      0.04 *
      chordEnvelope;
    const kickWave = Math.sin(Math.PI * 2 * (78 - quarterPhase * 28) * time) * 0.26 * kickEnvelope;
    const snareWave = Math.sin(Math.PI * 2 * (1800 + Math.sin(Math.PI * 2 * 113 * time) * 450) * time) * 0.08 * snareEnvelope;
    const hatWave = Math.sin(Math.PI * 2 * 5200 * time) * 0.035 * hatEnvelope;
    const value = Math.max(-1, Math.min(1, melodyWave + counterWave + bassWave + chordWave + kickWave + snareWave + hatWave));
    view.setInt16(44 + sample * bytesPerSample, value * 0x7fff, true);
  }

  return `data:audio/wav;base64,${bytesToBase64(new Uint8Array(buffer))}`;
}

function createSfxDataUrl(durationSeconds, sampleRenderer) {
  const sampleRate = 22050;
  const sampleCount = Math.floor(sampleRate * durationSeconds);
  const bytesPerSample = 2;
  const dataSize = sampleCount * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  for (let sample = 0; sample < sampleCount; sample += 1) {
    const time = sample / sampleRate;
    const value = Math.max(-1, Math.min(1, sampleRenderer(time)));
    view.setInt16(44 + sample * bytesPerSample, value * 0x7fff, true);
  }

  return `data:audio/wav;base64,${bytesToBase64(new Uint8Array(buffer))}`;
}

function burst(time, start, duration, frequency, gain) {
  if (time < start || time > start + duration) return 0;
  const phase = (time - start) / duration;
  const attack = Math.min(1, phase / 0.12);
  const decay = Math.max(0, (1 - phase) ** 0.72);
  return Math.sin(Math.PI * 2 * frequency * time) * gain * attack * decay;
}

function pseudoNoise(time) {
  const value = Math.sin(time * 17389.71 + Math.sin(time * 947.13) * 61.7) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function getDealCueDataUrl() {
  if (!dealCueDataUrl) {
    dealCueDataUrl = createSfxDataUrl(0.2, (time) => {
      const phase = time / 0.2;
      const envelope = Math.sin(Math.PI * Math.min(1, phase)) ** 0.7;
      const paperSlide = pseudoNoise(time) * 0.2 * envelope * (1 - phase * 0.35);
      const flick = Math.sin(Math.PI * 2 * (620 + 1220 * phase) * time) * 0.08 * envelope;
      const landingTap = burst(time, 0.145, 0.045, 1180, 0.14);
      return paperSlide + flick + landingTap;
    });
  }
  return dealCueDataUrl;
}

function getLastCardCueDataUrl() {
  if (!lastCardCueDataUrl) {
    lastCardCueDataUrl = createSfxDataUrl(
      0.58,
      (time) => burst(time, 0.03, 0.17, 980, 0.58) + burst(time, 0.29, 0.17, 1240, 0.54),
    );
  }
  return lastCardCueDataUrl;
}

function getVictoryCueDataUrl() {
  if (!victoryCueDataUrl) {
    victoryCueDataUrl = createSfxDataUrl(
      0.9,
      (time) =>
        burst(time, 0.02, 0.18, 660, 0.38) +
        burst(time, 0.19, 0.22, 880, 0.42) +
        burst(time, 0.42, 0.34, 1320, 0.46),
    );
  }
  return victoryCueDataUrl;
}

function playSfx(dataUrl, volume = 0.8) {
  if (!canPlayAudioNow()) return;
  try {
    const audio = new Audio(dataUrl);
    audio.volume = volume;
    const registry = sfxRegistry();
    registry.add(audio);
    audio.addEventListener?.("ended", () => registry.delete(audio), { once: true });
    const playPromise = audio.play();
    if (playPromise?.catch) playPromise.catch(() => registry.delete(audio));
  } catch {
    // Sound effects are nice-to-have and should never interrupt the game.
  }
}

function playLastCardCue() {
  playSfx(getLastCardCueDataUrl(), 0.86);
}

function playDealCue() {
  playSfx(getDealCueDataUrl(), 0.5);
}

function speechLanguage() {
  return state.language === "zh" ? "zh-CN" : "en-US";
}

function warmSpeechEngine() {
  if (speechEngineTouched || !state.voiceEnabled) return;
  try {
    window.speechSynthesis?.resume?.();
    window.speechSynthesis?.getVoices?.();
    speechEngineTouched = true;
  } catch {
    // Mobile speech engines are inconsistent; narration will try again when needed.
  }
}

function preferredSpeechVoice() {
  try {
    const synth = window.speechSynthesis;
    const voices = synth?.getVoices?.() || [];
    const lang = speechLanguage();
    const prefix = lang.split("-")[0];
    return (
      voices.find((voice) => voice.lang === lang && voice.localService) ||
      voices.find((voice) => voice.lang === lang) ||
      voices.find((voice) => voice.lang?.startsWith(prefix) && voice.localService) ||
      voices.find((voice) => voice.lang?.startsWith(prefix)) ||
      null
    );
  } catch {
    return null;
  }
}

function speakText(text, { interrupt = true, rate = 0.96, pitch = 1.03, volume = SPEECH_VOLUME } = {}) {
  if (!canSpeakNow() || !text) return;

  let restoreMusicVolume = null;
  try {
    const synth = window.speechSynthesis;
    const Utterance = window.SpeechSynthesisUtterance;
    if (!synth || !Utterance) return;

    warmSpeechEngine();
    restoreMusicVolume = duckBackgroundMusicForSpeech();
    if (interrupt) {
      synth.cancel();
      activeSpeechUtterances.clear();
    }
    synth.resume?.();
    const utterance = new Utterance(text);
    utterance.lang = speechLanguage();
    const voice = preferredSpeechVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      activeSpeechUtterances.delete(utterance);
      restoreMusicVolume?.();
    };
    utterance.onend = release;
    utterance.onerror = release;
    activeSpeechUtterances.add(utterance);
    synth.speak(utterance);
    window.setTimeout(() => synth.resume?.(), 0);
  } catch {
    restoreMusicVolume?.();
    // Voice narration is optional and should never interrupt gameplay.
  }
}

function announceVoiceReady() {
  speakText(t("voiceOnConfirm"), {
    interrupt: true,
    rate: state.language === "zh" ? 1 : 0.92,
    volume: VOICE_CONFIRM_VOLUME,
  });
}

function buildPlayNarration(action) {
  if (!action?.card) return "";

  const narration = [
    t("voicePlayed", {
      player: playerName(action.playerIndex),
      card: cardName(action.card),
    }),
  ];

  if (action.effectType === "wild") {
    const suit = SUIT_BY_ID[action.chosenSuit];
    if (suit) {
      narration.push(
        t("voiceSuitChanged", {
          symbol: suit.symbol,
          suit: suitName(action.chosenSuit),
        }),
      );
    }
  } else if (action.effectType === "reverse") {
    narration.push(
      t("voiceDirectionChanged", {
        icon: directionIcon(),
        direction: directionText(),
      }),
    );
  }

  return narration.join(" ");
}

function speakPlayNarration(action) {
  speakText(buildPlayNarration(action), {
    rate: state.language === "zh" ? 0.98 : 0.92,
  });
}

function winnerVoiceName(winnerIndex) {
  if (state.language === "en" && winnerIndex === HUMAN_INDEX) return "YOU";
  return playerName(winnerIndex);
}

function speakWinnerNarration(winnerIndex) {
  speakText(t("voiceWinner", { winner: winnerVoiceName(winnerIndex) }), {
    interrupt: false,
    rate: state.language === "zh" ? 0.96 : 0.88,
    pitch: 1.08,
  });
}

function humanMustDrawVoiceKey() {
  if (
    state.phase !== "playing" ||
    state.isRulesOpen ||
    state.isAnimating ||
    state.currentPlayer !== HUMAN_INDEX ||
    state.drawnThisTurn ||
    playableCardsFor(HUMAN_INDEX).length
  ) {
    return "";
  }

  const handKey = players[HUMAN_INDEX].hand.map((card) => card.id).join("-");
  return `${state.language}:${state.round}:${state.discard.length}:${handKey}`;
}

function announceHumanMustDrawIfNeeded() {
  const key = humanMustDrawVoiceKey();
  if (!key) {
    if (state.phase !== "playing" || state.currentPlayer !== HUMAN_INDEX || state.drawnThisTurn) {
      state.mustDrawVoiceKey = "";
    }
    return;
  }

  if (state.mustDrawVoiceKey === key || !canSpeakNow()) return;
  state.mustDrawVoiceKey = key;
  speakText(t("voiceMustDraw"), {
    interrupt: false,
    rate: state.language === "zh" ? 0.98 : 0.9,
    volume: VOICE_CONFIRM_VOLUME,
  });
}

function playRoundWinnerCue(winnerIndex) {
  playSfx(getVictoryCueDataUrl(), winnerIndex === HUMAN_INDEX ? 0.86 : 0.66);
  speakWinnerNarration(winnerIndex);
}

function broadcastMusicStop(type = "stop") {
  const payload = { source: MUSIC_INSTANCE_ID, time: Date.now(), type };
  try {
    localStorage.setItem(MUSIC_STOP_CHANNEL, JSON.stringify(payload));
  } catch {
    // Storage can be unavailable in private or restricted browser modes.
  }
  try {
    musicChannel?.postMessage({ type: "stop", ...payload });
  } catch {
    // BroadcastChannel is a best-effort helper for other open game tabs.
  }
}

function handleExternalMusicStop(source, { persistPreference = true } = {}) {
  if (source === MUSIC_INSTANCE_ID) return;
  if (persistPreference) {
    state.musicEnabled = false;
    saveMusicPreference();
  }
  stopMusic({ broadcast: false, publish: false });
  updateMusicButton();
}

function handleMusicStopPayload(payload) {
  if (!payload?.source) return;
  if (payload.type === "shutdown") {
    handleExternalMusicStop(payload.source, { persistPreference: false });
    return;
  }
  if (!payload.type || payload.type === "stop") {
    handleExternalMusicStop(payload.source, { persistPreference: true });
  }
}

async function startMusic({ claim = true } = {}) {
  if (!canPlayAudioNow()) return;
  if (musicStartPromise) return musicStartPromise;
  const activeAudio = musicAudio || musicController().audio;
  if (activeAudio && !activeAudio.paused && els.musicButton.dataset.audioState === "playing") {
    musicAudio = activeAudio;
    activeAudio.volume = MUSIC_VOLUME;
    return;
  }

  const sessionId = ++musicSessionId;

  els.musicButton.dataset.audioState = "starting";
  updateMusicButton();

  musicStartPromise = (async () => {
    const hasPlaybackLock = await acquireMusicPlaybackLock();
    if (sessionId !== musicSessionId || !canPlayAudioNow()) {
      unlockMusicPlayback();
      return;
    }
    if (!hasPlaybackLock) {
      state.musicEnabled = false;
      saveMusicPreference();
      els.musicButton.dataset.audioState = "off";
      updateMusicButton();
      return;
    }

    if (claim) {
      publishMusicOwner("playing");
      broadcastMusicStop();
    }

    if (!initMusicEngine()) {
      unlockMusicPlayback();
      return;
    }

    stopRegisteredMusicAudios(musicAudio);
    const audio = musicAudio;
    if (!audio.paused) {
      els.musicButton.dataset.audioState = "playing";
      updateMusicButton();
      return;
    }

    audio.muted = false;
    audio.volume = MUSIC_VOLUME;
    audio.loop = true;
    try {
      await audio.play();
    } catch {
      if (sessionId === musicSessionId && state.musicEnabled) {
        unlockMusicPlayback();
        els.musicButton.dataset.audioState = "blocked";
        updateMusicButton();
      }
      return;
    }

    if (sessionId !== musicSessionId || !canPlayAudioNow() || musicAudio !== audio) {
      stopAudioElement(audio);
      musicRegistry().delete(audio);
      detachMusicAudio(audio);
      if (musicAudio === audio) {
        musicAudio = null;
        musicController().audio = null;
        els.musicButton.dataset.audioState = state.musicEnabled ? "idle" : "off";
        updateMusicButton();
      }
      return;
    }

    els.musicButton.dataset.audioState = "playing";
    updateMusicButton();
  })();

  try {
    await musicStartPromise;
  } finally {
    if (sessionId === musicSessionId) {
      musicStartPromise = null;
      if (!state.musicEnabled) {
        els.musicButton.dataset.audioState = "off";
        updateMusicButton();
      }
      if (state.musicEnabled && musicAudio && !musicAudio.paused) {
        els.musicButton.dataset.audioState = "playing";
        updateMusicButton();
      } else if (state.musicEnabled && els.musicButton.dataset.audioState === "starting") {
        els.musicButton.dataset.audioState = "idle";
        unlockMusicPlayback();
        updateMusicButton();
      }
    }
  }
}

function stopMusic({ broadcast = false, publish = broadcast, broadcastType = "stop" } = {}) {
  musicSessionId += 1;
  musicStartPromise = null;
  if (publish) publishMusicOwner("stopped");
  unlockMusicPlayback();
  if (musicAudio) stopAudioElement(musicAudio);
  stopRegisteredMusicAudios();
  stopActiveSfx();
  musicAudio = null;
  els.musicButton.dataset.audioState = "off";
  updateMusicButton();
  if (broadcast) broadcastMusicStop(broadcastType);
}

function stopMusicForPageExit() {
  if (pageAudioCleanupDone) return;
  pageAudioCleanupDone = true;
  stopMusic({ broadcast: true, publish: false, broadcastType: "shutdown" });
  stopActiveSpeech();
}

function restoreMusicAfterPageShow() {
  pageAudioCleanupDone = false;
  if (state.musicEnabled && els.musicButton.dataset.audioState === "off") {
    els.musicButton.dataset.audioState = "idle";
    updateMusicButton();
  }
}

function pauseMusicForHiddenPage() {
  if (document.visibilityState === "hidden") {
    stopMusic({ broadcast: false, publish: false });
    return;
  }
  if (state.musicEnabled && els.musicButton.dataset.audioState === "off") {
    els.musicButton.dataset.audioState = "idle";
    updateMusicButton();
  }
}

function setupMusicSingleton() {
  if ("BroadcastChannel" in window) {
    try {
      musicChannel = new BroadcastChannel(MUSIC_STOP_CHANNEL);
      musicChannel.addEventListener("message", (event) => {
        handleMusicStopPayload(event.data);
      });
    } catch {
      musicChannel = null;
    }
  }

  window.addEventListener("storage", (event) => {
    if (!event.newValue) return;
    try {
      const payload = JSON.parse(event.newValue);
      if (event.key === MUSIC_STOP_CHANNEL) {
        handleMusicStopPayload(payload);
      } else if (event.key === MUSIC_OWNER_KEY) {
        yieldToExternalMusicOwner(payload);
      }
    } catch {
      // Ignore malformed cross-tab messages.
    }
  });

  document.addEventListener("visibilitychange", pauseMusicForHiddenPage);
  window.addEventListener("pagehide", stopMusicForPageExit);
  window.addEventListener("pageshow", restoreMusicAfterPageShow);
  window.addEventListener("beforeunload", stopMusicForPageExit);
  window.addEventListener("unload", stopMusicForPageExit);
  document.addEventListener("freeze", stopMusicForPageExit);
  document.addEventListener("resume", restoreMusicAfterPageShow);
  setupMusicOwnershipMonitor();
  broadcastMusicStop();
}

function shouldIgnoreMusicUnlock(event) {
  const target = event.target;
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "#musicButton, #voiceButton, #languageButton, #rulesButton, #rulesCloseButton, #logToggleButton, #modalNextRound, #suitModal, #rulesModal, #roundModal",
    ),
  );
}

function setupMusicAutoplay() {
  const unlock = (event) => {
    if (shouldIgnoreMusicUnlock(event)) return;
    if (state.musicEnabled && els.musicButton.dataset.audioState !== "playing") startMusic();
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
  };
  document.addEventListener("pointerdown", unlock);
  document.addEventListener("keydown", unlock);
  els.musicButton.dataset.audioState = state.musicEnabled ? "idle" : "off";
  updateMusicButton();
  if (state.musicEnabled) startMusic();
}

function setupVoiceUnlock() {
  const unlock = () => {
    warmSpeechEngine();
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
  };
  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock);
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

  if (action.effectType === "beast") {
    const suit = SUIT_BY_ID[action.activeSuit];
    return t("effectBeast", {
      card: cardName(action.card),
      symbol: suit.symbol,
      suit: suitName(action.activeSuit),
      number: action.activeNumber ? t("activeNumber", { number: action.activeNumber }) : t("noActiveNumber"),
    });
  }

  if (action.effectType === "reverse") {
    const suit = SUIT_BY_ID[action.activeSuit];
    return t("effectReverse", {
      card: cardName(action.card),
      symbol: suit.symbol,
      suit: suitName(action.activeSuit),
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
  if (effectType === "beast") {
    return t("logEffectBeast");
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
  if (isBigJoker(card) || isBeastWild(card)) return true;

  if (card.kind === "number") {
    return card.suit === state.currentSuit || (state.currentNumber !== null && card.number === state.currentNumber);
  }

  if (card.kind === "reverse") {
    return true;
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

function dealOrder() {
  const order = [];
  let playerIndex = state.dealerIndex;
  for (let index = 0; index < PLAYER_COUNT; index += 1) {
    order.push(playerIndex);
    playerIndex = nextPlayerIndex(playerIndex);
  }
  return order;
}

async function dealInitialHands() {
  const order = dealOrder();
  for (let cardNumber = 1; cardNumber <= 5; cardNumber += 1) {
    for (const playerIndex of order) {
      const card = drawFromDeck();
      if (!card) continue;
      state.dealingTarget = playerIndex;
      state.dealingCardNumber = cardNumber;
      render();
      await animateDealtCard(playerIndex);
      players[playerIndex].hand.push(card);
      render();
      await wait(90);
    }
  }
  state.dealingTarget = null;
  state.dealingCardNumber = 0;
}

async function startRound() {
  if (state.phase === "dealing") return;
  closeWelcomeScreen();
  if (state.musicEnabled && els.musicButton.dataset.audioState !== "playing") startMusic();
  speakText(t("voiceRoundStart"), {
    interrupt: true,
    rate: state.language === "zh" ? 1 : 0.9,
    volume: VOICE_CONFIRM_VOLUME,
  });
  clearTurnTimer();
  state.round += 1;
  state.dealerIndex = mod(state.round - 1, PLAYER_COUNT);
  state.deck = createDeck();
  state.discard = [];
  state.direction = 1;
  state.phase = "dealing";
  state.drawnThisTurn = false;
  state.drawnCardId = null;
  state.pendingSuitCardId = null;
  state.winnerIndex = null;
  state.aiThinkingIndex = null;
  state.isAnimating = true;
  state.isRulesOpen = false;
  state.animatingCard = null;
  state.lastAction = null;
  state.directionNotice = null;
  state.dealingTarget = null;
  state.dealingCardNumber = 0;
  state.currentNumber = null;
  state.log = [];
  els.rulesModal.classList.remove("is-open");
  els.rulesModal.setAttribute("aria-hidden", "true");

  players.forEach((player) => {
    player.hand = [];
  });

  render();
  await wait(180);
  await dealInitialHands();

  const opening = pickOpeningCard();
  state.discard = [opening];
  state.currentSuit = opening.suit;
  state.currentNumber = opening.kind === "number" ? opening.number : null;
  state.isAnimating = false;
  state.phase = "playing";

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

  if (isBigJoker(card) && !chosenSuit) {
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
  if (isBigJoker(card)) {
    state.currentSuit = chosenSuit;
    state.currentNumber = null;
    effectType = "wild";
    effectSuit = chosenSuit;
  } else if (isBeastWild(card)) {
    effectType = "beast";
  } else if (card.kind === "reverse") {
    state.direction *= -1;
    directionChanged = true;
    effectType = "reverse";
  } else {
    state.currentSuit = card.suit;
    state.currentNumber = card.number;
  }

  state.lastAction = {
    card,
    playerIndex,
    previousTopCard,
    effectType: effectType || "played",
    chosenSuit,
    activeSuit: state.currentSuit,
    activeNumber: state.currentNumber,
    isSpecial: isSpecialCard(card),
  };

  addLog("playedCard", { playerIndex, card, effectType, suitId: effectSuit });
  if (directionChanged) {
    showDirectionNotice(playerIndex);
  }
  speakPlayNarration(state.lastAction);
  state.drawnThisTurn = false;
  state.drawnCardId = null;
  state.pendingSuitCardId = null;

  if (hand.length === 0) {
    endRound(playerIndex);
    return true;
  }

  if (hand.length === 1) {
    playLastCardCue();
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
  playRoundWinnerCue(winnerIndex);
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
    const suit = isBigJoker(freshCard) ? chooseBestSuit(playerIndex) : null;
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
  const suit = isBigJoker(card) ? chooseBestSuit(playerIndex) : null;
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
  renderLogToggle();
  updateArenaOverlayFrame();
  renderWelcome();
  renderHeader();
  renderSeats();
  renderCenter();
  renderDirectionFlow();
  renderDealBanner();
  renderHand();
  renderLog();
  renderDirectionNotice();
  renderSuitModal();
  renderRoundModal();
  announceHumanMustDrawIfNeeded();
}

function updateArenaOverlayFrame() {
  const rect = els.arena.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--arena-left", `${rect.left}px`);
  rootStyle.setProperty("--arena-top", `${rect.top}px`);
  rootStyle.setProperty("--arena-width", `${rect.width}px`);
  rootStyle.setProperty("--arena-height", `${rect.height}px`);
  rootStyle.setProperty("--arena-center-x", `${rect.left + rect.width / 2}px`);
  rootStyle.setProperty("--arena-center-y", `${rect.top + rect.height / 2}px`);
}

function renderStaticText() {
  const text = copy();
  document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
  document.title = text.brandTitle;
  els.brandMark.textContent = text.brandMark;
  els.brandTitle.textContent = text.brandTitle;
  els.languageButton.textContent = text.languageButton;
  els.languageButton.setAttribute("aria-label", text.switchLanguageLabel);
  els.welcomeKicker.textContent = text.welcomeKicker;
  els.welcomeTitle.textContent = text.welcomeTitle;
  els.welcomeSubtitle.textContent = text.welcomeSubtitle;
  els.startGameButton.textContent = text.startGame;
  updateMusicButton();
  updateVoiceButton();
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

function renderWelcome() {
  const isOpen = state.phase === "idle";
  els.welcomeScreen.classList.toggle("is-open", isOpen);
  els.welcomeScreen.setAttribute("aria-hidden", String(!isOpen));
}

function closeWelcomeScreen() {
  els.welcomeScreen.classList.remove("is-open");
  els.welcomeScreen.setAttribute("aria-hidden", "true");
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

  if (state.phase === "idle") {
    els.statusLine.textContent = t("statusWelcome");
  } else if (state.phase === "dealing") {
    els.statusLine.textContent = t("statusDealing", {
      player: state.dealingTarget !== null ? playerName(state.dealingTarget) : playerName(state.dealerIndex),
      card: state.dealingCardNumber || 1,
    });
  } else if (state.isRulesOpen && state.phase === "playing") {
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
    const isDealing = state.phase === "dealing" && state.dealingTarget === index;
    const isHuman = index === HUMAN_INDEX;
    const hiddenCount = Math.min(player.hand.length, 6);
    const callout = player.hand.length === 1 ? `<span class="callout">${t("calling")}</span>` : "";
    const turnChip = isActive ? `<span class="turn-chip">${t("turnChip")}</span>` : "";

    seat.innerHTML = `
      <article class="player-panel ${isActive ? "is-active" : ""} ${isThinking ? "is-thinking" : ""} ${isDealing ? "is-dealing" : ""} ${isHuman ? "is-human" : ""}">
        <div class="score-badge">${t("score", { score: player.score })}</div>
        ${turnChip}
        ${renderPlayerAvatar(index)}
        <div class="player-name">${playerName(index)}</div>
        <div class="player-meta">
          <span>${t("handCount", { count: player.hand.length })}</span>
          ${index === state.dealerIndex ? `<span>${t("dealerChip")}</span>` : ""}
          ${callout}
          ${isThinking ? `<span class="thinking-chip">${t("thinkingChip")}</span>` : ""}
          ${isDealing ? `<span>${t("dealingChip")}</span>` : ""}
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
  const curve = Math.max(30, Math.min(96, Math.min(flowRect.width, flowRect.height) * 0.16));
  const c = (start, controlStart, controlEnd, end) =>
    `M${Math.round(start.x)} ${Math.round(start.y)} C${Math.round(controlStart.x)} ${Math.round(controlStart.y)} ${Math.round(
      controlEnd.x,
    )} ${Math.round(controlEnd.y)} ${Math.round(end.x)} ${Math.round(end.y)}`;
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
  const paths =
    state.direction === 1
      ? [
          c(p.southLeft, { x: p.southLeft.x - curve, y: p.southLeft.y }, { x: p.westBottom.x, y: p.westBottom.y + curve }, p.westBottom),
          c(p.westTop, { x: p.westTop.x, y: p.westTop.y - curve }, { x: p.northLeft.x - curve, y: p.northLeft.y }, p.northLeft),
          c(p.northRight, { x: p.northRight.x + curve, y: p.northRight.y }, { x: p.eastTop.x, y: p.eastTop.y - curve }, p.eastTop),
          c(p.eastBottom, { x: p.eastBottom.x, y: p.eastBottom.y + curve }, { x: p.southRight.x + curve, y: p.southRight.y }, p.southRight),
        ]
      : [
          c(p.southRight, { x: p.southRight.x + curve, y: p.southRight.y }, { x: p.eastBottom.x, y: p.eastBottom.y + curve }, p.eastBottom),
          c(p.eastTop, { x: p.eastTop.x, y: p.eastTop.y - curve }, { x: p.northRight.x + curve, y: p.northRight.y }, p.northRight),
          c(p.northLeft, { x: p.northLeft.x - curve, y: p.northLeft.y }, { x: p.westTop.x, y: p.westTop.y - curve }, p.westTop),
          c(p.westBottom, { x: p.westBottom.x, y: p.westBottom.y + curve }, { x: p.southLeft.x - curve, y: p.southLeft.y }, p.southLeft),
        ];

  paths.forEach((path, index) => {
    els.flowPaths[index].setAttribute("d", path);
  });
}

function renderDealBanner() {
  const isVisible = state.phase === "dealing";
  els.dealBanner.classList.toggle("is-visible", isVisible);
  if (!isVisible) {
    els.dealBanner.innerHTML = "";
    return;
  }

  const order = dealOrder();
  const current = state.dealingTarget;
  els.dealBanner.innerHTML = `
    <div class="deal-title">${escapeHtml(t("dealOrderTitle"))}</div>
    <div class="deal-status">${escapeHtml(
      t("dealingTo", {
        player: current !== null ? playerName(current) : playerName(order[0]),
        card: state.dealingCardNumber || 1,
      }),
    )}</div>
    <div class="deal-order">
      ${order
        .map(
          (playerIndex, index) => `
            <span class="deal-chip ${playerIndex === current ? "is-current" : ""}">${escapeHtml(playerName(playerIndex))}</span>
            ${index < order.length - 1 ? '<span class="deal-arrow">→</span>' : ""}
          `,
        )
        .join("")}
    </div>
  `;
}

function renderCenter() {
  const top = topCard();
  const suit = SUIT_BY_ID[state.currentSuit] || SUIT_BY_ID.spade;
  const specialCard = state.animatingCard && isSpecialCard(state.animatingCard) ? state.animatingCard : null;
  const visibleSpecialAction = state.lastAction?.isSpecial ? state.lastAction : null;
  const shouldShowSpecial = Boolean(specialCard || visibleSpecialAction);
  const baseCard = shouldShowSpecial ? visibleSpecialAction?.previousTopCard || top : top;
  const specialEffectText =
    state.phase === "idle"
      ? t("tableWaiting")
      : state.phase === "dealing"
        ? t("dealingTo", {
            player: state.dealingTarget !== null ? playerName(state.dealingTarget) : playerName(state.dealerIndex),
            card: state.dealingCardNumber || 1,
          })
        : specialCard
          ? t("specialPlaying", { card: cardName(specialCard) })
          : visibleSpecialAction
            ? describeCardEffect(visibleSpecialAction)
            : t("waitingSpecial");

  if (state.phase === "idle" || state.phase === "dealing") {
    els.activeSuit.textContent = `${t("activeSuit")} · ${state.phase === "idle" ? t("tableWaiting") : t("dealingChip")}`;
  } else {
    els.activeSuit.innerHTML = `${t("activeSuit")} <span class="suit-symbol ${suit.tone}">${suit.symbol}</span> ${suitName(state.currentSuit)} · ${escapeHtml(currentNumberStatus())}`;
  }
  els.drawCount.textContent = cardCount(state.deck.length);
  els.discardCount.textContent = cardCount(state.discard.length);
  els.discardSlotLabel.textContent = shouldShowSpecial ? t("previousTopCard") : t("topCard");
  els.discardCard.setAttribute("aria-label", t("tableTopCardLabel"));
  els.cardStage.classList.toggle("has-special", shouldShowSpecial);
  els.discardCard.innerHTML = "";
  els.discardCard.appendChild(baseCard ? renderCard(baseCard, { interactive: false }) : renderCardBack("55"));
  els.specialPlayPanel.classList.toggle("is-visible", shouldShowSpecial);
  els.playedSpecialCard.innerHTML = "";
  if (visibleSpecialAction?.card && !specialCard) {
    els.playedSpecialCard.appendChild(renderCard(visibleSpecialAction.card, { interactive: false }));
  }
  els.specialEffectText.textContent = specialEffectText;
  els.turnRibbon.textContent =
    state.phase === "idle"
      ? t("statusWelcome")
      : state.phase === "dealing"
        ? t("statusDealing", {
            player: state.dealingTarget !== null ? playerName(state.dealingTarget) : playerName(state.dealerIndex),
            card: state.dealingCardNumber || 1,
          })
        : state.isRulesOpen && state.phase === "playing"
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

  if (state.phase === "idle") {
    els.handHint.textContent = t("hintWelcome");
  } else if (state.phase === "dealing") {
    els.handHint.textContent = t("hintDealing");
  } else if (state.isRulesOpen && state.phase === "playing") {
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

function renderLogToggle() {
  const label = state.isLogOpen ? t("logCloseButton") : t("logOpenButton");
  const ariaLabel = state.isLogOpen ? t("logCloseLabel") : t("logOpenLabel");
  els.app.classList.toggle("is-log-open", state.isLogOpen);
  els.logPanel.setAttribute("aria-hidden", String(!state.isLogOpen));
  els.logToggleButton.textContent = label;
  els.logToggleButton.title = ariaLabel;
  els.logToggleButton.setAttribute("aria-label", ariaLabel);
  els.logToggleButton.setAttribute("aria-expanded", String(state.isLogOpen));
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

function renderCardBack(label = "55") {
  const el = document.createElement("div");
  el.className = "card card-back";
  el.innerHTML = `<span class="back-sigil">${escapeHtml(label)}</span>`;
  return el;
}

function getDealTargetRect(playerIndex) {
  if (playerIndex === HUMAN_INDEX) {
    return els.humanHand.getBoundingClientRect() || els.handZone.getBoundingClientRect();
  }

  return (
    document.querySelector(`#seat-${playerIndex} .mini-hand`)?.getBoundingClientRect() ||
    document.querySelector(`#seat-${playerIndex} .player-panel`)?.getBoundingClientRect()
  );
}

async function animateDealtCard(playerIndex) {
  const sourceRect = els.drawPileCard.getBoundingClientRect();
  const targetRect = getDealTargetRect(playerIndex);

  if (!sourceRect || !targetRect) {
    await wait(120);
    return;
  }

  const flyingCard = renderCardBack("55");
  const width = Math.min(sourceRect.width, 78);
  const height = Math.min(sourceRect.height, 112);
  const startLeft = sourceRect.left + sourceRect.width / 2 - width / 2;
  const startTop = sourceRect.top + sourceRect.height / 2 - height / 2;
  const endLeft = targetRect.left + targetRect.width / 2 - width / 2;
  const endTop = targetRect.top + targetRect.height / 2 - height / 2;

  flyingCard.classList.add("dealing-card-flight");
  flyingCard.dataset.player = t("dealingTo", { player: playerName(playerIndex), card: state.dealingCardNumber });
  Object.assign(flyingCard.style, {
    left: `${startLeft}px`,
    top: `${startTop}px`,
    width: `${width}px`,
    height: `${height}px`,
  });
  document.body.appendChild(flyingCard);
  playDealCue();

  const deltaX = endLeft - startLeft;
  const deltaY = endTop - startTop;
  const curveY = playerIndex === HUMAN_INDEX ? -36 : 30;

  try {
    const animation = flyingCard.animate(
      [
        {
          opacity: 0.4,
          transform: "translate(0, 0) scale(0.86) rotate(-8deg)",
        },
        {
          opacity: 1,
          transform: `translate(${deltaX * 0.55}px, ${deltaY * 0.45 + curveY}px) scale(1.04) rotate(5deg)`,
        },
        {
          opacity: 1,
          transform: `translate(${deltaX}px, ${deltaY}px) scale(0.72) rotate(0deg)`,
        },
      ],
      {
        duration: 360,
        easing: "cubic-bezier(.2,.78,.2,1)",
      },
    );
    await animation.finished;
  } catch {
    await wait(360);
  } finally {
    flyingCard.remove();
  }
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
    el.innerHTML = `
      ${renderJokerArt("small", t("littleJoker"), t("reverse"))}
    `;
    return el;
  }

  el.innerHTML = card.wildType === "joker" ? renderJokerArt("big", t("bigJoker"), t("wildSuit")) : renderBeastArt(card);
  return el;
}

function renderBeastArt(card) {
  const art = {
    dragon: `
      <ellipse class="beast-aura" cx="55" cy="55" rx="42" ry="39" />
      <path class="beast-cloud" d="M14 83c9-9 20-10 29-4 9-9 30-8 40 3-12 10-57 12-69 1Z" />
      <path class="dragon-body" d="M18 67C28 35 60 29 75 48c12 15 1 39-22 34-17-4-18-25-1-27 12-1 20 6 18 16" />
      <path class="dragon-belly" d="M22 67C32 43 57 38 69 51c9 10 2 26-15 24-9-1-11-12-2-15" />
      <path class="dragon-head" d="M70 23l13-9-1 13 11 5-13 5-7 11-8-9-13 2 8-11-4-12Z" />
      <path class="dragon-frill" d="M61 42l-13 11 16-1 4 14 7-14 15 1-12-10" />
      <path class="dragon-horn" d="M70 23l-7-12M80 21l7-12" />
      <circle class="beast-eye" cx="75" cy="31" r="2.5" />
      <path class="dragon-whisker" d="M82 34c9-2 14 2 18 7M69 38c-10 3-15 8-19 16" />
      <path class="dragon-scale" d="M29 60c5 3 10 3 15 0M41 49c6 2 12 2 17-1M55 43c5 1 9 1 13-1" />
    `,
    tiger: `
      <ellipse class="beast-aura" cx="55" cy="57" rx="42" ry="38" />
      <path class="tiger-body" d="M16 82c4-23 18-38 39-38s35 15 39 38c-13 12-65 12-78 0Z" />
      <path class="tiger-ear left" d="M31 39L20 15l27 12" />
      <path class="tiger-ear right" d="M79 39l11-24-27 12" />
      <path class="tiger-face" d="M24 52c6-18 18-28 31-28s25 10 31 28c6 19-7 39-31 39S18 71 24 52Z" />
      <path class="tiger-cheek" d="M34 68c8 10 34 10 42 0-2 16-40 19-42 0Z" />
      <path class="tiger-stripe" d="M55 25v19M43 31l8 13M67 31l-8 13M30 52l15 4M80 52l-15 4M31 65l14-6M79 65l-14-6M40 78l8-8M70 78l-8-8" />
      <circle class="beast-eye" cx="44" cy="57" r="3.2" />
      <circle class="beast-eye" cx="66" cy="57" r="3.2" />
      <path class="tiger-nose" d="M50 66h10l-5 6Z" />
      <path class="tiger-mouth" d="M55 72c-4 5-10 6-17 3M55 72c4 5 10 6 17 3" />
      <path class="tiger-tail" d="M84 70c15-5 17-21 8-31" />
    `,
    phoenix: `
      <ellipse class="beast-aura" cx="55" cy="57" rx="42" ry="40" />
      <path class="phoenix-tail" d="M55 62c-24 9-34 24-36 43 16-12 28-18 36-21 8 3 20 9 36 21-2-19-12-34-36-43Z" />
      <path class="phoenix-wing left" d="M51 51C28 28 14 25 4 33c14 7 21 17 27 34 8-7 15-11 20-16Z" />
      <path class="phoenix-wing right" d="M59 51c23-23 37-26 47-18-14 7-21 17-27 34-8-7-15-11-20-16Z" />
      <path class="phoenix-body" d="M42 85c2-32 7-58 13-58s11 26 13 58c-7 9-19 9-26 0Z" />
      <path class="phoenix-neck" d="M54 30c-2-12 5-22 16-27-3 15 2 22 14 28-12 4-22 2-30-1Z" />
      <path class="phoenix-crest" d="M70 9l8-7 3 12 12-4-8 11" />
      <circle class="beast-eye" cx="69" cy="22" r="2.3" />
      <path class="phoenix-feather" d="M39 68c-9 7-18 17-25 31M71 68c9 7 18 17 25 31M55 66v38M28 51c-12 8-18 16-22 29M82 51c12 8 18 16 22 29" />
    `,
  };

  return `
    <span class="card-main beast-main beast-${card.wildType}">
      <svg class="beast-illustration" viewBox="0 0 110 112" aria-hidden="true" focusable="false">
        <rect class="beast-frame" x="8" y="6" width="94" height="100" rx="16" />
        ${art[card.wildType]}
      </svg>
      <span class="beast-title">${beastName(card.wildType)}</span>
      <span class="beast-sub">${t("beastPass")}</span>
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
els.startGameButton.addEventListener("click", () => {
  trackAnalyticsEvent("game_start_clicked", {
    round_number: state.round + 1,
  });
  startRound();
});
els.rulesButton.addEventListener("click", openRulesModal);
els.rulesCloseButton.addEventListener("click", closeRulesModal);
els.logToggleButton.addEventListener("click", () => {
  state.isLogOpen = !state.isLogOpen;
  render();
});
els.musicButton.addEventListener("click", () => {
  if (!state.musicEnabled) {
    state.musicEnabled = true;
    saveMusicPreference();
    els.musicButton.dataset.audioState = "idle";
    updateMusicButton();
    startMusic();
    return;
  }

  state.musicEnabled = false;
  saveMusicPreference();
  stopMusic({ broadcast: true });
});
els.voiceButton.addEventListener("click", () => {
  state.voiceEnabled = !state.voiceEnabled;
  if (!state.voiceEnabled) {
    stopActiveSpeech();
    setBackgroundMusicVolume(MUSIC_VOLUME);
  }
  updateVoiceButton();
  if (state.voiceEnabled) {
    announceVoiceReady();
    window.setTimeout(announceHumanMustDrawIfNeeded, 260);
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

window.addEventListener("resize", updateArenaOverlayFrame);
window.addEventListener("orientationchange", () => window.setTimeout(updateArenaOverlayFrame, 120));

loadScores();
loadMusicPreference();
updateMusicButton();
setupMusicSingleton();
setupMusicAutoplay();
setupVoiceUnlock();
render();
trackAnalyticsEventOnce("game_loaded");
