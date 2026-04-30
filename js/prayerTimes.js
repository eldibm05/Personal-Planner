// ─────────────────────────────────────────────────────────────────────────────
// prayerTimes.js — Aladhan API fetcher, localStorage cache, Islamic block builder
// Loaded as plain <script> before scheduler.js so autoSchedule() can call
// buildIslamicBlocks() synchronously from the already-populated cache.
// ─────────────────────────────────────────────────────────────────────────────

// Fetch prayer times for a single YYYY-MM-DD from Aladhan (ISNA method=2, Calgary).
// Returns { Fajr, Dhuhr, Asr, Maghrib, Isha } as "HH:MM" strings, or null on error.
async function fetchPrayerTimes(dateStr) {
  const [y, m, d] = dateStr.split("-");
  const apiDate = `${d}-${m}-${y}`;
  try {
    const resp = await fetch(
      `https://api.aladhan.com/v1/timingsByCity/${apiDate}?city=Calgary&country=Canada&method=2`
    );
    const json = await resp.json();
    if (json.code === 200 && json.data?.timings) {
      const t = json.data.timings;
      return {
        Fajr:    t.Fajr.slice(0, 5),
        Dhuhr:   t.Dhuhr.slice(0, 5),
        Asr:     t.Asr.slice(0, 5),
        Maghrib: t.Maghrib.slice(0, 5),
        Isha:    t.Isha.slice(0, 5),
      };
    }
  } catch {}
  return null;
}

// Fetch prayer times for every day in `days` that is missing from `cachedTimes`,
// then push the new entries into React state and trigger a reschedule.
// setState is the App-level React setState function.
async function prefetchWeekPrayerTimes(days, cachedTimes, setState) {
  const missing = days.filter(d => !cachedTimes[d]);
  if (!missing.length) return;
  const pairs = await Promise.all(missing.map(d => fetchPrayerTimes(d).then(t => [d, t])));
  const updates = {};
  pairs.forEach(([d, t]) => { if (t) updates[d] = t; });
  if (!Object.keys(updates).length) return;
  setState(prev => {
    const next = { ...prev, prayerTimesCache: { ...prev.prayerTimesCache, ...updates } };
    next.schedule = autoSchedule(next);
    return next;
  });
}

// Build the ordered list of Islamic time blocks for one day, given the prayer times
// object { Fajr, Dhuhr, Asr, Maghrib, Isha }.  Returns [] if times is falsy.
// Each block: { id, date, title, startMin, duration, type:"islamic" }
function buildIslamicBlocks(dateStr, times) {
  if (!times) return [];

  const dow = new Date(dateStr + "T12:00:00").getDay(); // 0=Sun … 5=Fri
  const isFriday = dow === 5;

  const fajrMin    = t24Min(times.Fajr);
  const dhuhrMin   = t24Min(times.Dhuhr);
  const asrMin     = t24Min(times.Asr);
  const maghribMin = t24Min(times.Maghrib);
  const ishaMin    = t24Min(times.Isha);

  const SLEEP_END    = 5 * 60;  // 5:00 AM — regular tasks never placed before this
  const DUA_SLEEP    = 22 * 60; // 10:00 PM

  const blocks = [];

  if (fajrMin < 7 * 60) {
    // Fajr is before 7 AM → wake up just before it, then Gym + Quran immediately after
    blocks.push({ id: `isl_dua_wake_${dateStr}`,    date: dateStr, title: "Dua on Waking",     startMin: fajrMin - 10,      duration: 10 });
    blocks.push({ id: `isl_fajr_${dateStr}`,         date: dateStr, title: "Fajr Prayer",        startMin: fajrMin,           duration: 20 });
    blocks.push({ id: `isl_athkar_fajr_${dateStr}`,  date: dateStr, title: "Athkar after Fajr",  startMin: fajrMin + 20,      duration: 15 });
    blocks.push({ id: `isl_gym_${dateStr}`,           date: dateStr, title: "Gym",                startMin: fajrMin + 35,      duration: 60 });
    blocks.push({ id: `isl_quran_${dateStr}`,         date: dateStr, title: "Quran Reading",      startMin: fajrMin + 95,      duration: 60 });
  } else {
    // Fajr is at or after 7 AM → Dua, Gym, Quran all starting at 5:00 AM, then Fajr
    blocks.push({ id: `isl_dua_wake_${dateStr}`,    date: dateStr, title: "Dua on Waking",     startMin: SLEEP_END,         duration: 10 });
    blocks.push({ id: `isl_gym_${dateStr}`,           date: dateStr, title: "Gym",                startMin: SLEEP_END + 10,    duration: 60 });
    blocks.push({ id: `isl_quran_${dateStr}`,         date: dateStr, title: "Quran Reading",      startMin: SLEEP_END + 70,    duration: 60 });
    blocks.push({ id: `isl_fajr_${dateStr}`,         date: dateStr, title: "Fajr Prayer",        startMin: fajrMin,           duration: 20 });
    blocks.push({ id: `isl_athkar_fajr_${dateStr}`,  date: dateStr, title: "Athkar after Fajr",  startMin: fajrMin + 20,      duration: 15 });
  }

  // Mid-day prayers
  blocks.push({ id: `isl_dhuhr_${dateStr}`, date: dateStr, title: isFriday ? "Jumuah Prayer" : "Dhuhr Prayer", startMin: dhuhrMin,      duration: 20 });
  blocks.push({ id: `isl_asr_${dateStr}`,   date: dateStr, title: "Asr Prayer",        startMin: asrMin,        duration: 20 });
  blocks.push({ id: `isl_athkar_asr_${dateStr}`, date: dateStr, title: "Athkar after Asr", startMin: asrMin + 20, duration: 15 });

  // Evening prayers
  blocks.push({ id: `isl_maghrib_${dateStr}`, date: dateStr, title: "Maghrib Prayer",  startMin: maghribMin,    duration: 20 });
  blocks.push({ id: `isl_isha_${dateStr}`,    date: dateStr, title: "Isha Prayer",     startMin: ishaMin,       duration: 20 });

  // Bedtime dua fixed at 10 PM
  blocks.push({ id: `isl_dua_sleep_${dateStr}`, date: dateStr, title: "Dua before Sleep", startMin: DUA_SLEEP, duration: 10 });

  return blocks.sort((a, b) => a.startMin - b.startMin);
}
