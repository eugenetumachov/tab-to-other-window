# tab-to-other-window

Chrome extension that moves the current tab to your other Chrome window. With more than 2 windows, clicking the icon (or `Alt+Shift+M`) shows a list of windows to pick from.

## Setup

```sh
npm install
npm run build   # compiles src/*.ts to *.js in the project root
```

Then open `chrome://extensions`, enable **Developer mode**, click **Load unpacked** and select this folder.

## Development

| Command | What it does |
|-|-|
| `npm run watch` | Recompiles on change (reload the extension in `chrome://extensions` afterwards) |
| `npm test` | Runs unit tests |
| `npm run test:coverage` | Runs unit tests with coverage |
| `npm run typecheck` | Type-checks sources and tests |
