# Chimp Hood ($CHIMP)

Meme landing page for **$CHIMP** — built around the real WallStreetBets term
"chimp" (years of use, tens of thousands of upvotes, never minted) and a
Robin Hood-flavored ape mascot.

Static site, no build step: `index.html` + `style.css` + `script.js` + `assets/`.

## Deploy

Upload the four files/folders (`index.html`, `style.css`, `script.js`,
`assets/`) to a GitHub repo, then import that repo into Vercel — preset
"Other", no build command needed.

## Before going live

Open `script.js` and fill in `CONFIG`:
- `CA` — the token's contract address (leave `""` until minted; live market
  data and the copy buttons activate automatically once it's set)
- `BUY_URL` — swap link (pump.fun / Jupiter / Raydium / etc.)
- `CHART_URL` — direct DexScreener pair link (auto-fills once `CA` is set and
  indexed, but set a fallback anyway)
- `X_URL` — the project's X/Twitter account
- `TELEGRAM_URL` — leave empty to keep the Telegram button auto-disabled
