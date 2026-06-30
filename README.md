# Divine Gold Flip

Divine Gold Flip is a single-player browser card game. One human player plays against three AI opponents, and round scores are saved locally in the browser.

## Run

Open `index.html` directly in a browser, or start a static server from the project directory:

```sh
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Implemented Rules

- The deck has 55 cards: 36 number cards, 4 Big Jokers, 6 Little Jokers, and 9 divine beast wild cards.
- Each player starts with 5 cards. The remaining cards form the draw pile, and one card is revealed as the first discard pile card.
- If the opening card is a Big Joker or divine beast wild card, it is returned and redrawn. If the opening card is a Little Joker, direction reverses immediately and the first player changes accordingly.
- Number cards can be played when they match the active suit or the top card number.
- Big Jokers and divine beast cards can be played at any time, then choose the next active suit.
- Little Jokers must match the active suit, or can follow a wild card, and immediately reverse the play direction.
- If a player has no legal card, they must draw 1 card. If the drawn card is playable, it can be played immediately.
- The first player to empty their hand wins the round and gains 1 point. Scores accumulate and are stored in local storage.
- The UI uses playing-card styling: number cards show ranks 1-9, and Big/Little Jokers use illustrated Joker card faces.
- AI players pause before acting, and played cards animate from their seat to the discard area so the source is clear.
- Wild cards and Little Jokers are displayed in a separate special-card area with clear suit and direction-change feedback.
- Azure Dragon, White Tiger, and Vermilion Bird use distinct beast illustrations.

To make the Little Joker suit-matching rule playable, the 6 Little Jokers are implemented as suited Little Jokers: 2 Spades, 2 Hearts, 1 Club, and 1 Diamond.
