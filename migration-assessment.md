## Migration Assessment: Node 14 → Node 20

### Current State
- **Runtime:** Node.js 14 (`.nvmrc: 14`, `engines.node: >=14.0.0`)
- **Module system:** CommonJS (`require()`) — no migration to ESM needed
- **Framework:** Express 4.17.1
- **Test framework:** Jest 27.5.1

### Deprecated APIs Found

| Location | API | Replacement |
|---|---|---|
| `src/routes/notifications.js:5` | `require('punycode')` (Node built-in) | Use userland `punycode/` package or `URL` API |
| `src/routes/notifications.js:88` | `url.parse(webhookUrl)` | `new URL(webhookUrl)` |
| `src/routes/notifications.js:101` | `new Buffer(JSON.stringify(...))` | `Buffer.from(JSON.stringify(...))` |
| `src/routes/templates.js:55` | `fs.exists(exportDir, cb)` | `fs.existsSync()` or `fs.access()` |
| `package.json` | `punycode: ^1.4.1` dependency | Update to `^2.3.1` or remove if using URL API |

### Dependencies to Review
- `jest@^27.5.1` — works on Node 20 but v29 is current
- `node-fetch@^2.6.1` — works on Node 20 (v2 is CJS-compatible)
- `punycode@^1.4.1` — update to v2 or remove
- All other deps are compatible with Node 20

### No Dockerfile or CI workflow found — no infra changes needed.
