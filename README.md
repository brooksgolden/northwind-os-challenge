# Northwind OS Challenge — Starter

This repo is the starting point for the Northwind OS Challenge. Read **[CHALLENGE.md](./CHALLENGE.md)** for the brief.

There is **no backend**. The files in `data/` are your data source — treat them as a read-only "database" and build your app on top of them, in whatever stack you prefer.

## Data

All data is fictional. Northwind Coffee is a made-up specialty roaster selling wholesale to cafés.

### `data/inquiries.json` — inbound wholesale leads

```jsonc
{
  "id": "inq_01",
  "cafe_name": "Union & Co.",
  "contact_name": "Marcus Kruse",
  "email": "marcus@unionco.com",
  "region": "Southwest",
  "channel": "referral",                  // website | referral | trade show | cold inbound | instagram
  "requested_volume_lbs_month": 145,
  "message": "Small cafe, low volume to start...",
  "received_date": "2026-05-30",          // YYYY-MM-DD
  "status": "qualified"                    // new | contacted | qualified | closed
}
```

### `data/sales.json` — daily wholesale sales (last ~90 days)

```jsonc
{
  "date": "2026-03-20",                    // YYYY-MM-DD
  "region": "Pacific Northwest",
  "sku": "NW-DECAF-SWP",
  "product": "Swiss Water Decaf",
  "units_lbs": 34,
  "revenue": 523.86
}
```

### `data/accounts.json` — existing wholesale customers

```jsonc
{
  "id": "acct_01",
  "name": "Blue Roasters",
  "region": "Bay Area",
  "monthly_volume_lbs": 220,
  "customer_since": "2024-11-02",          // YYYY-MM-DD
  "status": "active"                        // active | paused
}
```

Regions in the data: **Pacific Northwest, Bay Area, Mountain West, Southwest.**

## Getting started

1. Clone or download this repo.
2. Scaffold your app however you like (`data/` can be copied or imported directly).
3. Build the core described in [CHALLENGE.md](./CHALLENGE.md).
4. Submit a link to **your own** repo by Monday 9:00 AM.

Good luck — and have fun with it.
