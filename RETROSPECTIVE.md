# Divine Gold Flip Retrospective

## What Went Well

- The game reached a complete playable state as a pure static website.
- The core rules are implemented without a backend or external package dependencies.
- AI turn delays and card animations make the flow easier to follow.
- Special cards have distinct visual treatments and rule feedback.
- GitLab Pages deployment keeps the hosted version simple to run and review.

## Challenges

- Music behavior needed several iterations to avoid duplicate background tracks after toggling or reloading.
- The divine beast card rules changed during development, so rule validation and player feedback had to be adjusted carefully.
- Several GitLab project paths were created while finding the correct challenge repository location.
- GitLab Pages required runner setup and public Pages permissions before the hosted playable link could be verified.

## Lessons Learned

- Static games benefit from keeping state transitions explicit and centralized.
- Rules should be documented separately from implementation because card behavior can change during design review.
- Browser audio should be treated as a lifecycle problem, not just a play/pause button.
- GitLab Pages projects need both a successful Pages pipeline and public Pages access to satisfy hosted-playable checks.

## Future Improvements

- Add automated unit tests for legal move validation and turn order.
- Add screenshots or a short gameplay GIF to the README.
- Add difficulty settings for AI behavior.
- Add keyboard accessibility for card selection and modal controls.
- Add a small deterministic debug mode for reproducing rule edge cases.
- Consider extracting rendering helpers if the UI grows further.

## Final Notes

The current implementation prioritizes playability, clear feedback, and easy static hosting. It is suitable for challenge review because the repository includes source code, GitLab Pages configuration, documentation, and a public playable link.
