# Divine Gold Flip

Divine Gold Flip is a single-player browser card game inspired by matching-card and direction-changing party games. One human player plays against three AI opponents, and round scores are saved locally in the browser.

The project is implemented as a pure front-end static website, so it can run directly from `index.html` or be published through GitLab Pages without a backend service.

## Play Online

Playable link: [Divine Gold Flip](http://allen-lian-divine-gold-flip-57d623.pages.git.ringcentral.com)

## Game Description

Players take turns playing cards that match the active suit or active number. Big Jokers can be played anytime and choose the next active suit. Little Jokers reverse the turn direction. The divine beast cards, Azure Dragon, White Tiger, and Vermilion Bird, act as pass-style substitutes for normal 1-9 cards: they do not change the active suit, active number, or direction.

The first player to empty their hand wins the round and gains 1 point. The game continues across rounds, and scores persist in browser local storage.

## Screenshots

No static screenshots are stored in this repository. The live GitLab Pages build is the recommended way to review the current UI.

Key UI elements include:

- Four-player table layout with one human player and three AI opponents.
- Animated card plays that show which seat played the card.
- Play direction indicators and active player highlighting.
- Special card display for Jokers and divine beast cards.
- Collapsible game log and rules modal.

## Run

Open `index.html` directly in a browser, or start a static server from the project directory:

```sh
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Setup

No package installation is required. The game uses plain HTML, CSS, and JavaScript.

Required local tools:

- A modern browser.
- Optional: Python 3, only if you want to run a local static server.

## GitLab Pages

This repository publishes the static game through GitLab Pages. The pipeline copies `index.html`, `game.js`, and `styles.css` into the `public/` artifact.

After the `pages` job succeeds, make sure project Pages access is set to Everyone in GitLab: Settings -> General -> Visibility, project features, permissions -> Pages.

## Project Documents

- [SPEC.md](SPEC.md): rules, scope, requirements, and acceptance criteria.
- [ARCHITECTURE.md](ARCHITECTURE.md): technology stack, architecture, major decisions, and AI workflow.
- [RETROSPECTIVE.md](RETROSPECTIVE.md): development reflection, lessons learned, and future improvements.

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
