// Shared helpers for the home page vehicle sections (Featured, SUVs, ...)

export const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

// Exactly this many vehicles are shown in each home page section
export const DAILY_COUNT = 6;

export const getImageUrl = (path) => {
  try {
    return new URL(path, `${API_URL}/`).toString();
  } catch {
    return null;
  }
};

// Same cars all day, a new set at midnight (Nairobi time)
const todayKey = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });

export const todayLabel = () =>
  new Date().toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    timeZone: "Africa/Nairobi",
    weekday: "long",
  });

// cyrb53: a small string hash that mixes well, so each day gives a fresh set
const hashString = (text) => {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

// Safety net: if the server sends more than `count` cars, pick today's here
export const pickDaily = (cars, count = DAILY_COUNT) => {
  if (cars.length <= count) return cars;
  const day = todayKey();
  return [...cars]
    .sort(
      (a, b) =>
        hashString(`${day}:${a.id}`) - hashString(`${day}:${b.id}`)
    )
    .slice(0, count);
};