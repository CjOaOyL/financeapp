# Plan: LULD (Limit Up Limit Down) Tracking & Pre-Halt Buy System

---

## 1. LULD Band Calculation Engine

The core algorithm that computes the upper/lower price bands in real-time:

- **Reference price**: Use the 5-minute rolling average price (as per the actual LULD plan)
- **Band percentages** depend on tier and price:

| Tier | Price Range | Band % |
|------|------------|--------|
| Tier 1 (S&P 500, Russell 1000, some ETPs) | > $3.00 | 5% |
| Tier 1 | $0.75 – $3.00 | 20% |
| Tier 1 | < $0.75 | $0.15 (fixed) |
| Tier 2 (all other NMS) | > $3.00 | 10% |
| Tier 2 | $0.75 – $3.00 | 20% |
| Tier 2 | < $0.75 | $0.15 (fixed) |

- **Double-wide bands** apply during open/close (9:30–9:45 and 3:35–4:00)
- Bands recalculate every **30 seconds** based on the new reference price

## 2. Real-Time Data Feed

You need **Level 1 or Level 2 market data** with sub-second latency:

| Option | Latency | Cost |
|--------|---------|------|
| Polygon.io WebSocket | ~50-200ms | $200+/mo |
| Alpaca Market Data | ~100-300ms | Free–$99/mo |
| Interactive Brokers TWS API | ~1-50ms | Commissions only |
| Direct SIP feed (UTP/CTA) | <1ms | $$$$ |

**Minimum data needed per tick**: symbol, last price, timestamp, bid, ask, volume

## 3. Proximity Detection Algorithm

The decision logic for when price is approaching the upper LULD band:

```
proximity_pct = (upper_band - current_price) / upper_band * 100

Trigger zones:
  - WATCH:    proximity < 2.0%    → Start monitoring closely
  - READY:    proximity < 1.0%    → Prepare order, check parameters
  - EXECUTE:  proximity < 0.3%    → Send buy order
```

## 4. "Certain Parameters" — The Filter Criteria

This is where you'd tune to avoid false signals. Suggested filters:

| Parameter | Purpose | Example Threshold |
|-----------|---------|-------------------|
| **Volume surge** | Confirms real demand | Current vol > 5x avg 5-min vol |
| **Price velocity** | Speed of move matters | > 2% gain in last 60 seconds |
| **Bid/Ask spread** | Liquidity check | Spread < 0.5% of price |
| **Time of day** | Avoid open/close chaos | Between 9:50 AM – 3:30 PM |
| **Prior halts today** | More halts = more volatile | ≤ 2 prior halts |
| **Float / market cap** | Low float = bigger moves | Float < 20M shares |
| **Relative volume** | Unusual activity | RVOL > 3.0 |
| **Sector/news catalyst** | Fundamental reason | Optional (news API) |

## 5. Order Execution Layer

- **Order type**: Limit order slightly above current ask (e.g., ask + 0.05) — NOT market order (slippage risk near halts is extreme)
- **Position sizing**: Fixed dollar amount or % of account, with hard max
- **Risk management**: Immediately place a stop-loss after fill (e.g., -3% to -5%)
- **Timeout**: Cancel order if not filled within 2–5 seconds (price may have reversed)

## 6. Halt Detection & Post-Halt Logic

- Subscribe to **halt/resume messages** (LULD codes `LUDP`, `LUDS` from exchange feeds, or via broker API)
- If halted before fill → cancel pending order
- If filled before halt → hold through halt, set stop for resume
- If stock resumes higher → trail stop; if it resumes lower → stop triggers

## 7. Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐
│  Market Data WS │───▶│  LULD Calculator  │───▶│  Signal      │
│  (price ticks)  │    │  (bands + prox)   │    │  Engine      │
└─────────────────┘    └──────────────────┘    └──────┬──────┘
                                                       │
                                               ┌──────▼──────┐
                                               │  Filters     │
                                               │  (vol, vel,  │
                                               │   spread...) │
                                               └──────┬──────┘
                                                       │
                                               ┌──────▼──────┐
                                               │  Order Mgr   │──▶ Broker API
                                               │  (limit buy,  │
                                               │   stop, cancel)│
                                               └──────────────┘
```

## 8. Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | **Python** (fastest to prototype) or **Node.js** (better WS handling) |
| Data feed | Polygon.io or Alpaca WebSocket |
| Broker API | Alpaca Trading API or IBKR TWS |
| Band calc | Custom module (pure math, no dependencies) |
| State mgmt | In-memory (dict/map per symbol) |
| Logging | Structured JSON logs for every signal + order |
| Backtesting | Replay historical tick data through same engine |

## 9. Key Risks to Handle in Code

1. **Stale reference price** — band calc must stay in sync with exchange
2. **Partial fills** — position sizing logic must handle
3. **Multiple rapid halts** — circuit breaker to stop trading that symbol
4. **Network latency** — if your data is 500ms behind, you're buying into a halt
5. **Resume gap down** — most important risk; stock can resume 10-20% lower

## 10. Build Sequence

| Phase | Deliverable | Time Est. |
|-------|------------|-----------|
| 1 | LULD band calculator + unit tests | 1 day |
| 2 | WebSocket data ingestion + proximity tracker | 1 day |
| 3 | Signal engine with configurable filters | 1-2 days |
| 4 | Paper trading integration (Alpaca paper) | 1 day |
| 5 | Backtesting against historical halt data | 2-3 days |
| 6 | Live trading with small size | Ongoing |

---

**Bottom line**: The core algorithm is straightforward math (band calculation + proximity percentage). The hard parts are (a) getting fast enough data, (b) tuning the filters so you're not buying into every LULD approach (most fail), and (c) managing the risk of a gap-down on resume.
