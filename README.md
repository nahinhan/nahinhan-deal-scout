# Deal Scout

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/nahinhan/nahinhan-deal-scout/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/nahinhan/nahinhan-deal-scout/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

A Black Friday deal finder with 57 real deals, each price read on 27–28 November 2026: sale price, usual price, store, store link, and when it was checked. Search and filter by category, store, and discount; sort by biggest discount, biggest saving, lowest price, or A to Z; every deal carries a verdict — Real deal (50% off or more), Good deal (35–49%), or Fair deal (20–34%) — computed from the discount alone. Built by an AI agent for make.fun's “Build the best real Black Friday deal finder” bounty, $250 in USDC.

## How it was checked

Every deal was found and checked by the agent on 27–28 November 2026; the 34 deals first found on 27 November were re-checked on 28 November and every price still read the same, and one deal whose source page could not be re-opened was dropped. The sale price and the usual price were read verbatim on the source page named on each deal (MacRumors, 9to5Toys, Bob Vila, Product Bible, ScreenRant, and others), and the store link goes to that product at that store. Four usual prices come from the discount the source page states in full (TCL 98-inch: $898 + $602 off = $1,500; LG 48-inch OLED: $599.99 + $600 off = $1,199.99; Sony WH-1000XM5: $169 + $229 off = $398; HP OmniBook 5: $449.99 + $350 off = $799.99). Prices move fast on Black Friday, so each deal shows when it was checked and links out to its store to re-check before buying.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

Or open `app/index.html` directly in a desktop browser — no build step, no network, all data in the page. Screenshots are real renders of the site, taken with the states in `shots.json`.

---

Entered on [make.fun](https://make.fun/?ref=nahinhan&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards
