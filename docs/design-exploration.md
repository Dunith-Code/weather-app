# Design Exploration

## Comfort Index

**What this document is:** a record of the formula designs I considered during development, in the order I actually worked through them. **Only Formula C is implemented in the current codebase** (`server/src/services/comfortIndexService.ts`). Formulas A and B are kept as a record of my design process and reasoning, not as descriptions of current behavior.

---

## Background: Why Temperature and Humidity Interact

**What I started from:** the idea that comfort is largely driven by how effectively the body can cool itself via evaporative cooling (sweat evaporating removes heat). Evaporation rate depends on how much more moisture the surrounding air can absorb.

- High humidity → air is already near-saturated → sweat evaporates poorly → body cools less effectively → heat feels worse
- Low humidity → sweat evaporates easily → body cools effectively → feels more comfortable

**Why this matters:** this effect is temperature-dependent, humidity barely matters when it's cold, but matters a lot when it's hot. This is why real-world indices (NWS Heat Index, Canadian Humidex, Thom's Discomfort Index) include a temperature × humidity interaction term rather than two separate additive terms. I wanted my formula to capture that same interaction rather than treating the two factors independently.

---

## Formula A: My First, Hand-Tuned Piecewise Model (not in current code)

**What it was:** ideal ranges per factor (e.g. 20–26°C for temperature), linear penalty for deviation, with a hand-picked ×1.8 humidity penalty multiplier when temperature exceeded 28°C.

```
Temperature score: ideal 20–26°C → 100; else 100 − 4 × (°C outside range), floored at 0
Humidity score:    ideal 30–60% → 100; else 100 − 1.5 × (% outside range)
                   penalty × 1.8 if temp > 28°C (interaction effect)
Wind score:        ideal 2–5 m/s → 100; else 100 − 8 × (m/s outside range), floored at 0
Cloud score:       ideal 20–60% → 100; else 100 − 1.2 × (% outside range), floored at 0
```

```
ComfortIndex = 0.40 × tempScore
             + 0.30 × humidityScore(adjusted for temp)
             + 0.15 × windScore
             + 0.15 × cloudScore
```

**Why I replaced it:** the ×1.8 interaction multiplier was an arbitrary, hand-picked constant with no citation behind it, defensible as a first pass, but weaker than grounding the same idea in a published formula (see Formula C).

---

## Formula B: Gaussian / Interaction-First Model (alternative considered, never implemented)

**What it was:** a more physically continuous design, fold temperature and humidity into one "apparent temperature" via a multiplicative interaction term, score it with a Gaussian peak rather than a flat ideal range, and layer wind/cloud in as smaller conditional corrections.

```
apparentTemp = temp + 0.05 × (humidity − 50) × (temp − 14) / 10
baseScore = 100 × exp( −(apparentTemp − 21)² / (2 × 8²) )
windPenalty = windSpeed × 3        (if temp < 10°C)
            = (windSpeed − 6) × 4  (if windSpeed > 6 m/s and temp ≥ 10°C)
            = 0                    (otherwise)
cloudAdjustment = −(cloudCover / 100) × 5
ComfortIndex = clamp(baseScore − windPenalty + cloudAdjustment, 0, 100)
```

**Why I set it aside:** Mathematically elegant and closer to real Heat Index construction, but the exponential scoring function makes unit testing less predictable, boundary values are continuous rather than sharp. It also introduces multiple tuning constants (Gaussian spread, interaction coefficient, wind thresholds) that would be difficult to justify live, without a clear improvement in accuracy over Formula C.

---

## Formula C: Thom's Discomfort Index (implemented, this is the current code)

**What it is:** my final design, adopted after deciding the temperature-humidity interaction should rest on a published formula rather than a hand-picked constant. combined with three secondary factors wind, cloud cover, and pressure each scored using the same ideal-range, linear-penalty structure.

**Temperature + humidity**, via Thom's Discomfort Index (1959):

```
Id = T − 0.0055 × (100 − RH) × (T − 14.5)
```

```
Discomfort Index Score: ideal 15–21 → 100; else 100 − 5 × (units outside range), floored at 0
Wind score:             ideal 2–5 m/s → 100; else 100 − 8 × (m/s outside range), floored at 0
Cloud score:            ideal 20–60% → 100; else 100 − 0.5 × (% outside range), floored at 0
Pressure score:         ideal 1010–1020 hPa → 100; else 100 − 0.5 × (hPa outside range), floored at 0
Visibility score:       ideal ≥ 8,000 m → 100; else 100 − (8,000 - visibility) × (100 / 8,000)
```

```
ComfortIndex = 0.65 × discomfortIndexScore(Id)
             + 0.10 × windScore
             + 0.10 × cloudScore
             + 0.10 × pressureScore
             + 0.05 × visibilityScore
```

**Why this is the strongest version:** the temperature-humidity interaction is no longer an invented multiplier, it comes from a real, citable 1959 formula used in heat-discomfort research, while retaining the testable piecewise structure that made Formula A practical in the first place. Wind, cloud, and pressure round out the formula as reasonable secondary factors, each with its own stated justification (see below), rather than being treated as equally rigorous to the cited temperature-humidity term.

---
## Why These Specific Factors and Weights
 
I didn't pick wind, cloud, and pressure at random, each has a stated reason for being included, even though none of them carry a citation as strong as Thom's formula:
 
- **Wind** is included because ANSI/ASHRAE Standard 55, the actual engineering standard for human thermal comfort — names air speed as a core environmental factor alongside temperature and humidity. I don't have a published formula for scoring outdoor wind comfort the way I do for temperature/humidity, so I built my own ideal-range scoring for it, but its *inclusion* is citation-backed.
- **Cloud cover** is not part of ASHRAE 55, which is an indoor-focused standard. I added it myself as a reasonable extension accounting for outdoor solar exposure, moderate cloud cover (some shade, not fully overcast) plausibly affects how comfortable direct sun or a fully grey sky feels, even without a cited source for the exact relationship.
- **Pressure** is my own extension too, based on the general association between low pressure and storm systems, and stable/high pressure with fair weather.
- **Visibility**, added live during the screen recording. I chose a threshold of 8,000 meters because that's the meteorological definition of "good visibility." I gave it 5% weight because it's a secondary indicator of comfort, not a primary driver like temperature or humidity.

---

## Why I Chose Formula C

Formula A's structure (ideal range + linear penalty, easy to test and explain) was worth keeping, the problem was specifically the uncited interaction multiplier. Formula C keeps that same testable structure for wind, cloud, and pressure, while replacing the weakest part (the humidity-temperature interaction) with a real cited formula. Formula B was more physically elegant but sacrificed exactly the two properties that mattered most given my constraints, live explainability and clean test boundaries.

---

## Live Recording

During the live recording, I added Visibility as a new factor to the formula, live and unscripted.
 
I added a `visibility` field to the `WeatherData` interface, wrote a scoring function using an ideal threshold of 8,000 meters (meteorologically "good visibility"), and rebalanced the weights to make room for it (65% temp+humidity, 5% visibility). After saving and refreshing the dashboard, the ranking recalculated correctly, confirming the new parameter is wired in properly.

---

## References

[1]	E. C. Thom, “The Discomfort Index,” Weatherwise, vol. 12, no. 2, pp. 57–61, Apr. 1959, doi: 10.1080/00431672.1959.9926960. <br/>
[2]	ASHRAE, “Standard 55 – Thermal Environmental Conditions for Human Occupancy,” Ashrae.org. Accessed: Aug. 31, 2026. [Online]. Available: https://www.ashrae.org/technical-resources/bookstore/standard-55-thermal-environmental-conditions-for-human-occupancy <br/>
[3]	N. US Department of Commerce, “What Is the Heat Index?,” www.weather.gov. Accessed: Aug. 31, 2026. [Online]. Available: https://www.weather.gov/ama/heatindex

---

**Dunith Desitha Athukorala**