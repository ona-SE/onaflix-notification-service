## Migration Report

**From:** Node 14
**To:** Node 20

### Breaking changes fixed

| File | Change |
|---|---|
| `src/routes/notifications.js` | `new Buffer(...)` → `Buffer.from(...)` |
| `src/routes/notifications.js` | `url.parse(...)` → `new URL(...)` |
| `src/routes/notifications.js` | `require('punycode')` → `require('punycode/')` (userland package) |
| `src/routes/templates.js` | `fs.exists(dir, cb)` → `fs.existsSync(dir)` |
| `src/index.js` | Removed unused `url` import |

### Dependencies updated

| Package | From | To | Reason |
|---|---|---|---|
| `punycode` | `^1.4.1` | `^2.3.1` | v1 is unmaintained; v2 required for `punycode/` import |
| `jest` | `^27.5.1` | `^29.7.0` | Better Node 20 support |

### Configuration updated

| File | Change |
|---|---|
| `.nvmrc` | `14` → `20` |
| `package.json` | `engines.node` `>=14.0.0` → `>=20.0.0` |
| `README.md` | Runtime and setup instructions updated to Node 20 |
| `.devcontainer/devcontainer.json` | Created with `javascript-node:20` image |
| `.ona/automations.yaml` | Created with install + dev server tasks |

### Pre-existing audit findings (not caused by migration)

- `nodemailer <=7.0.10` — 2 high severity (requires breaking upgrade to v8)
- `semver 7.0.0-7.5.1` via `nodemon` — 1 high severity (requires nodemon v3)

### Tests

**PASS** — 8/8 tests passing
