# tab-to-other-window

Chrome extension that moves the current tab to your other Chrome window. With more than 2 windows, clicking the icon shows a list of windows to pick from.

## Setup

```sh
npm install
npm run build   # outputs the extension to dist/
```

Then open `chrome://extensions`, enable **Developer mode**, click **Load unpacked** and select the `dist` folder.

## Development

- `src/` — TypeScript sources
- `public/` — static files copied as is (`manifest.json`, `popup.html`, icons)
- `test/` — unit tests

| Command | What it does |
|-|-|
| `npm run watch` | Builds, then recompiles `src/` on change (reload the extension in `chrome://extensions` afterwards; changes in `public/` need `npm run build`) |
| `npm test` | Runs unit tests |
| `npm run test:coverage` | Runs unit tests with coverage |
| `npm run typecheck` | Type-checks sources and tests |
