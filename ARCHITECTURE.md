# Divine Gold Flip Architecture

## Technology Stack

- HTML: document structure and modal containers.
- CSS: responsive table layout, card art, animations, and UI states.
- JavaScript: game state, rules engine, AI turns, rendering, audio, and event handling.
- GitLab Pages: static site hosting.
- GitLab CI: copies static assets into the Pages `public/` artifact.

No front-end framework, package manager, build system, or backend service is required.

## Architecture Overview

The game is a single-page static web application.

Core files:

- `index.html`: page shell, player areas, table areas, modals, and controls.
- `styles.css`: visual design, card rendering, layout, animations, responsive behavior, and modal styling.
- `game.js`: all game state, deck generation, turn logic, AI behavior, rendering, sound, and event handlers.
- `.gitlab-ci.yml`: GitLab Pages deployment job.

The JavaScript file owns a single in-memory state object. Rendering functions read from state and update the DOM. User actions and AI turns mutate state through rule-aware functions, then trigger a render.

## Major Design Decisions

### Static-only Deployment

The game is built without a backend so it can be hosted by GitLab Pages with minimal CI configuration. This also keeps setup simple for reviewers and players.

### Central State Object

Game state is stored in one central object. This makes it easier to keep turn order, deck state, active suit, active number, modal state, and animation state consistent.

### Rule-specific Card Types

Cards use structured JavaScript objects instead of plain strings. This keeps number cards, Big Jokers, Little Jokers, and divine beast cards easy to distinguish in validation and rendering.

### Full Re-rendering

Most UI updates are handled by render functions that rebuild relevant sections from state. This avoids subtle DOM drift during fast turns, AI actions, and round resets.

### AI Delay and Animation

AI turns include deliberate delays so the human player can understand which opponent acted. Card animations originate near the player seat and move toward the discard area.

### Audio Singleton

Background music is managed as a single page-level audio instance. The stop flow clears known music nodes to avoid duplicate background tracks after repeated toggles or reloads.

## AI Tooling Used

Codex was used as the AI coding assistant for:

- Implementing and iterating on game logic.
- Refining the UI layout and playing-card visuals.
- Updating GitLab Pages deployment configuration.
- Creating and maintaining project documentation.
- Running local validation commands.

## Agent Workflow

The development workflow used an AI-agent assisted loop:

1. Read the current source and project state.
2. Apply focused code or documentation changes.
3. Run local checks such as `node --check game.js` and `git diff --check`.
4. Use browser verification for visual and interaction-heavy changes.
5. Commit and push changes to the requested GitLab project when asked.

## Deployment Architecture

GitLab CI uses a lightweight Alpine image and publishes the static assets:

```yaml
image: alpine:latest

create-pages:
  pages:
    publish: public
  before_script:
    - ":"
  script:
    - mkdir -p public
    - cp index.html game.js styles.css public/
  rules:
    - if: $CI_COMMIT_REF_NAME == $CI_DEFAULT_BRANCH
```

The Pages site must be configured with public access so external monitors can verify the playable link.
