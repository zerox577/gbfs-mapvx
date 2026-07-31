# AI Usage Log — GBFS MapVX

## How AI was used

I'm a backend developer transitioning into frontend and this is my first time using MapLibre. AI was used as a coding assistant and research accelerator throughout this challenge.

### Areas where AI contributed

| Area | What AI did | How it was reviewed |
|---|---|---|
| **MapLibre setup** | Suggested CartoDB Voyager as a tile provider, SDF icon approach, and the web worker config in `angular.json` | Verified against MapLibre docs; tested that map renders correctly |
| **Custom SVGs** | Generated the 3 SVG paths for bike, ebike, and scooter icons | Reviewed visually on the map |
| **Lottie animation** | Provided the `animation.json` file for the splash screen | Colors were modified manually for dark theme visibility |
| **Tailwind CSS** | Helped with utility classes for responsive layout, dark mode, skeleton loader, and status badges | Manually adjusted spacing and colors for visual consistency |
| **Testing patterns** | Generated repetitive test boilerplate for coverage | All test assertions were reviewed; edge cases added manually |
| **README** | Structured the architecture, trade-offs, and limitations sections | Content was verified against actual code; opinions (e.g., `@lottiefiles/dotlottie`) are my own |
| **Performance decisions** | Suggested GeoJSON `setData()` over recreating sources each tick | Implemented and verified with Chrome DevTools |

### Areas where AI was NOT used

- Architecture decisions (signal-based store, feature folder structure, map decomposition)
- Component design and state flow
- Code review and debugging
- Commit strategy

## Why AI for this project

This was a tight-scope project (4-6 hours recommended). AI helped move faster on research-heavy tasks (MapLibre APIs, icon generation, animation integration) so I could focus on architecture and code quality where I add the most value.
