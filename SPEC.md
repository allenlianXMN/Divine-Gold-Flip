# Divine Gold Flip Specification

## Game Rules

### Players

- The game supports 4 players.
- One player is human.
- Three players are AI opponents.
- The human player sits at the bottom of the table. AI players sit east, north, and west.

### Deck

The deck contains 55 cards:

- 36 number cards: suits are Spade, Heart, Club, and Diamond; ranks are 1 through 9.
- 4 Big Jokers.
- 6 Little Jokers.
- 9 divine beast cards: 3 Azure Dragon, 3 White Tiger, and 3 Vermilion Bird.

### Setup

- Each player is dealt 5 cards.
- The remaining cards become the draw pile.
- One valid opening card is revealed to start the discard pile.
- If the opening card is a Big Joker or divine beast card, it is returned and a new opening card is drawn.
- If the opening card is a Little Joker, direction reverses immediately and the first player is adjusted accordingly.

### Turn Flow

- On a player's turn, the player may play exactly one legal card.
- If no legal card is available, the player must draw 1 card.
- If the drawn card is legal, it may be played immediately.
- If the drawn card is not legal, the turn ends.
- The turn then advances according to the current direction.

### Card Rules

- Number cards are legal when they match the active suit or active number.
- Big Jokers are legal at any time and allow the player to choose the next active suit.
- Little Jokers are legal on the player's turn and reverse the play direction. They do not change the active suit or active number.
- Azure Dragon, White Tiger, and Vermilion Bird are legal at any time as pass-style substitutes for 1-9 normal cards. They do not change suit, number, or direction.

### Draw Pile

- If the draw pile is empty, the discard pile is recycled into a new draw pile while preserving the current top card.
- The recycled draw pile is shuffled.

### Scoring

- The first player to empty their hand wins the round.
- The winner gains 1 point.
- Scores accumulate across rounds and are stored in local storage.

## Scope Definition

### In Scope

- Single-player browser gameplay.
- One human player versus three AI players.
- Complete deck, turn, draw, discard, scoring, and round-reset logic.
- Legal move validation.
- AI card choice and delayed AI turns.
- Card play animations.
- Rules modal.
- Collapsible game log.
- Music and sound effect controls.
- GitLab Pages static deployment.

### Out of Scope

- Online multiplayer.
- User accounts.
- Server-side persistence.
- Matchmaking.
- Custom deck editing.
- Real-money or betting features.
- Mobile app packaging.

## Functional Requirements

- The app must load in a modern browser without a backend.
- The player must be able to play legal cards by clicking cards in hand.
- Illegal cards must not be playable.
- The draw button must be available only when the human player has no legal card.
- AI turns must be delayed enough for players to follow the action.
- Played cards must animate from the playing seat to the table.
- Special cards must show clear feedback for their effects.
- The current player and direction must be visible.
- Scores must remain available after a page refresh.
- The rules panel must pause gameplay while open.
- The music button must start and stop background music without stacking duplicate tracks.
- The game must publish as a static GitLab Pages site.

## Acceptance Criteria

- A new round deals 5 cards to each of 4 players.
- The deck contains exactly 55 cards before dealing.
- Number cards can only be played when matching the active suit or active number.
- Big Jokers can always be played and prompt for a new suit.
- Little Jokers reverse the direction and preserve active suit and number.
- Divine beast cards can always be played and preserve active suit, active number, and direction.
- If the human player has at least one legal card, the draw button is disabled.
- If the human player has no legal card, drawing is required before turn end.
- A player wins immediately when their hand reaches 0 cards.
- The UI shows the playable GitLab Pages link in README.md.
- GitLab Pages pipeline produces a playable static site.
