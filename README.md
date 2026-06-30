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
- Number cards can be played when they match the active suit or the active number.
- Big Jokers can be played at any time, then choose the next active suit.
- Azure Dragon, White Tiger, and Vermilion Bird can be played as 1-9 number-card substitutes only. They do not change the active suit, active number, or direction; the next player still follows the previous active suit and number.
- Little Jokers can be played on your turn as reverse cards. They immediately reverse the play direction and keep the active suit and active number unchanged.
- If a player has no legal card, they must draw 1 card. If the drawn card is playable, it can be played immediately.
- The first player to empty their hand wins the round and gains 1 point. Scores accumulate and are stored in local storage.
- The UI uses playing-card styling: number cards show ranks 1-9, and Big/Little Jokers use illustrated Joker card faces.
- AI players pause before acting, and played cards animate from their seat to the discard area so the source is clear.
- Big Jokers, Little Jokers, and divine beast cards are displayed in a separate special-card area with clear effect feedback.
- Azure Dragon, White Tiger, and Vermilion Bird use distinct beast illustrations.

Little Jokers are reverse-only cards; any printed suit variation is visual and does not affect whether they can be played.
