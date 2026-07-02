const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs/promises");
const path = require("node:path");
const { HttpProxyAgent } = require("http-proxy-agent");
const { HttpsProxyAgent } = require("https-proxy-agent");
const { SocksProxyAgent } = require("socks-proxy-agent");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;
const PROXY_CONFIG_HEADER = "x-proxy-config";
const ALLOW_REMOTE_PROXY = process.env.ALLOW_REMOTE_PROXY === "1";
const MAX_JSON_RESPONSE_BYTES = 1024 * 1024;
const FAKE_ADDRESS_API_URL = "https://fakeaddressgenerator.click/api/generate";
const NOMINATIM_REVERSE_API_URL = "https://nominatim.openstreetmap.org/reverse";
const REAL_ADDRESS_API_URL =
  "https://www.zhenshidizhi.com/api/addresses/random?country=US&count=1";
const GLOBAL_RANDOM_RADIUS_SCALES = [0.2, 0.35, 0.55, 0.8];
const GLOBAL_ATTEMPTS_PER_RADIUS = 3;
const MIN_STREET_LEVEL_PLACE_RANK = 26;
const MAX_REVERSE_MATCH_DISTANCE_METERS = 350;
const MAX_COORD_SNAP_DISTANCE_METERS = 1800;
const GLOBAL_COUNTRIES = {
  US: {
    name: "United States",
    language: "en",
    phone: { dial: "1", groups: [3, 3, 4] },
    centers: [
      { name: "New York", lat: 40.7128, lng: -74.006, radiusKm: 12 },
      { name: "Los Angeles", lat: 34.0522, lng: -118.2437, radiusKm: 14 },
      { name: "Chicago", lat: 41.8781, lng: -87.6298, radiusKm: 10 },
      { name: "Portland", lat: 45.5152, lng: -122.6784, radiusKm: 9 },
    ],
  },
  CA: {
    name: "Canada",
    language: "en",
    phone: { dial: "1", groups: [3, 3, 4] },
    centers: [
      { name: "Toronto", lat: 43.6532, lng: -79.3832, radiusKm: 12 },
      { name: "Vancouver", lat: 49.2827, lng: -123.1207, radiusKm: 10 },
      { name: "Montreal", lat: 45.5017, lng: -73.5673, radiusKm: 10 },
    ],
  },
  GB: {
    name: "United Kingdom",
    language: "en",
    phone: { dial: "44", groups: [4, 6] },
    centers: [
      { name: "London", lat: 51.5074, lng: -0.1278, radiusKm: 12 },
      { name: "Manchester", lat: 53.4808, lng: -2.2426, radiusKm: 9 },
      { name: "Birmingham", lat: 52.4862, lng: -1.8904, radiusKm: 9 },
    ],
  },
  AU: {
    name: "Australia",
    language: "en",
    phone: { dial: "61", groups: [4, 3, 3] },
    centers: [
      { name: "Sydney", lat: -33.8688, lng: 151.2093, radiusKm: 12 },
      { name: "Melbourne", lat: -37.8136, lng: 144.9631, radiusKm: 12 },
      { name: "Brisbane", lat: -27.4698, lng: 153.0251, radiusKm: 10 },
    ],
  },
  DE: {
    name: "Germany",
    language: "de",
    phone: { dial: "49", groups: [3, 3, 4] },
    centers: [
      { name: "Berlin", lat: 52.52, lng: 13.405, radiusKm: 10 },
      { name: "Munich", lat: 48.1351, lng: 11.582, radiusKm: 9 },
      { name: "Hamburg", lat: 53.5511, lng: 9.9937, radiusKm: 9 },
    ],
  },
  FR: {
    name: "France",
    language: "fr",
    phone: { dial: "33", groups: [1, 2, 2, 2, 2] },
    centers: [
      { name: "Paris", lat: 48.8566, lng: 2.3522, radiusKm: 10 },
      { name: "Lyon", lat: 45.764, lng: 4.8357, radiusKm: 8 },
      { name: "Marseille", lat: 43.2965, lng: 5.3698, radiusKm: 8 },
    ],
  },
  JP: {
    name: "Japan",
    language: "ja",
    phone: { dial: "81", groups: [2, 4, 4] },
    centers: [
      { name: "Tokyo", lat: 35.6762, lng: 139.6503, radiusKm: 10 },
      { name: "Osaka", lat: 34.6937, lng: 135.5023, radiusKm: 8 },
      { name: "Nagoya", lat: 35.1815, lng: 136.9066, radiusKm: 8 },
    ],
  },
  KR: {
    name: "South Korea",
    language: "ko",
    phone: { dial: "82", groups: [2, 4, 4] },
    centers: [
      { name: "Seoul", lat: 37.5665, lng: 126.978, radiusKm: 9 },
      { name: "Busan", lat: 35.1796, lng: 129.0756, radiusKm: 8 },
    ],
  },
  SG: {
    name: "Singapore",
    language: "en",
    phone: { dial: "65", groups: [4, 4] },
    centers: [{ name: "Singapore", lat: 1.3521, lng: 103.8198, radiusKm: 8 }],
  },
  CN: {
    name: "China",
    language: "zh-CN",
    phone: { dial: "86", groups: [3, 4, 4] },
    centers: [
      { name: "Shanghai", lat: 31.2304, lng: 121.4737, radiusKm: 12 },
      { name: "Beijing", lat: 39.9042, lng: 116.4074, radiusKm: 12 },
      { name: "Guangzhou", lat: 23.1291, lng: 113.2644, radiusKm: 10 },
    ],
  },
};
const GLOBAL_NAME_DB = {
  first: ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Chris", "Jamie"],
  last: ["Smith", "Johnson", "Brown", "Lee", "Martin", "Garcia", "Wilson"],
};
const FAKER_LOCALE_BY_COUNTRY = {
  US: "fakerEN_US",
  CA: "fakerEN_CA",
  GB: "fakerEN_GB",
  AU: "fakerEN_AU",
  DE: "fakerDE",
  FR: "fakerFR",
  JP: "fakerJA",
  KR: "fakerKO",
  SG: "fakerEN",
  CN: "fakerZH_CN",
};
const NAME_WITHOUT_SPACE_COUNTRIES = new Set(["CN", "JP", "KR"]);
const EAST_ASIAN_COUNTRIES = new Set(["CN", "JP", "KR"]);
const EMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
];
const PASSWORD_WORDS = [
  "amber",
  "atlas",
  "beacon",
  "cedar",
  "coral",
  "cosmo",
  "ember",
  "fable",
  "forest",
  "harbor",
  "lunar",
  "mango",
  "maple",
  "meadow",
  "nova",
  "olive",
  "pearl",
  "river",
  "solar",
  "willow",
];
let fakerModulePromise = null;
const WATER_CATEGORIES = new Set(["waterway", "natural"]);
const WATER_TYPES = new Set([
  "bay",
  "coastline",
  "harbour",
  "lake",
  "ocean",
  "river",
  "sea",
  "strait",
  "water",
  "wetland",
]);
const COARSE_TYPES = new Set([
  "administrative",
  "city",
  "continent",
  "country",
  "county",
  "district",
  "hamlet",
  "island",
  "locality",
  "municipality",
  "neighbourhood",
  "postcode",
  "province",
  "quarter",
  "region",
  "state",
  "suburb",
  "town",
  "village",
]);
const LOCALITY_FIELDS = [
  "borough",
  "city",
  "city_district",
  "county",
  "hamlet",
  "municipality",
  "neighbourhood",
  "quarter",
  "suburb",
  "town",
  "village",
];
const LOCAL_SOURCE_NAME_DB = {
  first: [
    "John",
    "Jane",
    "Alex",
    "Emily",
    "Chris",
    "Katie",
    "Mike",
    "Laura",
    "David",
    "Sarah",
  ],
  last: [
    "Smith",
    "Johnson",
    "Brown",
    "Williams",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
  ],
};
const LOCAL_STATE_NAMES = {
  OR: "Oregon",
  DE: "Delaware",
  NH: "New Hampshire",
  MT: "Montana",
  AK: "Alaska",
  CA: "California",
  NY: "New York",
  TX: "Texas",
  FL: "Florida",
  WA: "Washington",
  IL: "Illinois",
  PA: "Pennsylvania",
};
const LOCAL_STATE_MAP = Object.fromEntries(
  Object.entries(LOCAL_STATE_NAMES).map(([code, name]) => [
    name.toLowerCase(),
    code,
  ]),
);
const USPS_ZIP_PREFIX_RANGES = {
  OR: [[970, 979]],
  DE: [[197, 199]],
  NH: [[30, 38]],
  MT: [[590, 599]],
  AK: [[995, 999]],
  CA: [[900, 961]],
  NY: [[100, 149]],
  TX: [
    [733, 733],
    [750, 799],
    [885, 885],
  ],
  FL: [[320, 349]],
  WA: [[980, 994]],
  IL: [[600, 629]],
  PA: [[150, 196]],
};
const LOCAL_SOURCE_BOUNDS = {
  OR: [
    {
      name: "Portland",
      lat: [45.45, 45.58],
      lng: [-122.75, -122.55],
      area: "503",
      zip: "97204",
    },
    {
      name: "Salem",
      lat: [44.88, 45.02],
      lng: [-123.1, -122.93],
      area: "503",
      zip: "97301",
    },
    {
      name: "Bend",
      lat: [44.0, 44.12],
      lng: [-121.38, -121.23],
      area: "541",
      zip: "97701",
    },
    {
      name: "Eugene",
      lat: [44.02, 44.1],
      lng: [-123.16, -123.02],
      area: "541",
      zip: "97401",
    },
    {
      name: "Medford",
      lat: [42.29, 42.36],
      lng: [-122.92, -122.82],
      area: "541",
      zip: "97501",
    },
  ],
  DE: [
    {
      name: "Wilmington",
      lat: [39.7, 39.78],
      lng: [-75.6, -75.48],
      area: "302",
      zip: "19801",
    },
    {
      name: "Newark",
      lat: [39.63, 39.72],
      lng: [-75.82, -75.68],
      area: "302",
      zip: "19702",
    },
    {
      name: "Dover",
      lat: [39.1, 39.2],
      lng: [-75.6, -75.45],
      area: "302",
      zip: "19901",
    },
    {
      name: "Middletown",
      lat: [39.42, 39.48],
      lng: [-75.75, -75.66],
      area: "302",
      zip: "19709",
    },
    {
      name: "Rehoboth Beach",
      lat: [38.69, 38.74],
      lng: [-75.12, -75.06],
      area: "302",
      zip: "19971",
    },
  ],
  NH: [
    {
      name: "Manchester",
      lat: [42.94, 43.04],
      lng: [-71.51, -71.39],
      area: "603",
      zip: "03101",
    },
    {
      name: "Nashua",
      lat: [42.71, 42.8],
      lng: [-71.55, -71.4],
      area: "603",
      zip: "03060",
    },
    {
      name: "Concord",
      lat: [43.18, 43.25],
      lng: [-71.6, -71.48],
      area: "603",
      zip: "03301",
    },
    {
      name: "Portsmouth",
      lat: [43.04, 43.1],
      lng: [-70.82, -70.72],
      area: "603",
      zip: "03801",
    },
    {
      name: "Keene",
      lat: [42.91, 42.96],
      lng: [-72.34, -72.25],
      area: "603",
      zip: "03431",
    },
  ],
  MT: [
    {
      name: "Billings",
      lat: [45.73, 45.84],
      lng: [-108.65, -108.42],
      area: "406",
      zip: "59101",
    },
    {
      name: "Missoula",
      lat: [46.82, 46.92],
      lng: [-114.1, -113.92],
      area: "406",
      zip: "59801",
    },
    {
      name: "Helena",
      lat: [46.55, 46.63],
      lng: [-112.08, -111.96],
      area: "406",
      zip: "59601",
    },
    {
      name: "Bozeman",
      lat: [45.65, 45.72],
      lng: [-111.12, -111.0],
      area: "406",
      zip: "59715",
    },
    {
      name: "Great Falls",
      lat: [47.47, 47.54],
      lng: [-111.38, -111.24],
      area: "406",
      zip: "59401",
    },
  ],
  AK: [
    {
      name: "Anchorage",
      lat: [61.12, 61.23],
      lng: [-150.05, -149.75],
      area: "907",
      zip: "99501",
    },
    {
      name: "Juneau",
      lat: [58.28, 58.36],
      lng: [-134.5, -134.35],
      area: "907",
      zip: "99801",
    },
    {
      name: "Fairbanks",
      lat: [64.8, 64.88],
      lng: [-147.85, -147.6],
      area: "907",
      zip: "99701",
    },
    {
      name: "Wasilla",
      lat: [61.55, 61.61],
      lng: [-149.55, -149.35],
      area: "907",
      zip: "99654",
    },
    {
      name: "Ketchikan",
      lat: [55.32, 55.37],
      lng: [-131.7, -131.62],
      area: "907",
      zip: "99901",
    },
  ],
  CA: [
    {
      name: "Los Angeles",
      lat: [34.0, 34.12],
      lng: [-118.35, -118.2],
      area: "323",
      zip: "90012",
    },
    {
      name: "San Francisco",
      lat: [37.73, 37.8],
      lng: [-122.48, -122.38],
      area: "415",
      zip: "94102",
    },
    {
      name: "San Diego",
      lat: [32.7, 32.78],
      lng: [-117.2, -117.08],
      area: "619",
      zip: "92101",
    },
    {
      name: "Sacramento",
      lat: [38.54, 38.62],
      lng: [-121.55, -121.43],
      area: "916",
      zip: "95814",
    },
    {
      name: "San Jose",
      lat: [37.3, 37.38],
      lng: [-121.95, -121.82],
      area: "408",
      zip: "95112",
    },
  ],
  NY: [
    {
      name: "New York",
      lat: [40.7, 40.82],
      lng: [-74.03, -73.93],
      area: "212",
      zip: "10001",
    },
    {
      name: "Brooklyn",
      lat: [40.63, 40.72],
      lng: [-74.02, -73.9],
      area: "718",
      zip: "11201",
    },
    {
      name: "Buffalo",
      lat: [42.86, 42.93],
      lng: [-78.92, -78.8],
      area: "716",
      zip: "14202",
    },
    {
      name: "Albany",
      lat: [42.63, 42.69],
      lng: [-73.82, -73.72],
      area: "518",
      zip: "12207",
    },
  ],
  TX: [
    {
      name: "Houston",
      lat: [29.7, 29.82],
      lng: [-95.48, -95.3],
      area: "713",
      zip: "77002",
    },
    {
      name: "Dallas",
      lat: [32.74, 32.84],
      lng: [-96.88, -96.7],
      area: "214",
      zip: "75201",
    },
    {
      name: "Austin",
      lat: [30.24, 30.34],
      lng: [-97.8, -97.68],
      area: "512",
      zip: "78701",
    },
    {
      name: "San Antonio",
      lat: [29.39, 29.47],
      lng: [-98.55, -98.43],
      area: "210",
      zip: "78205",
    },
    {
      name: "Fort Worth",
      lat: [32.72, 32.79],
      lng: [-97.38, -97.28],
      area: "817",
      zip: "76102",
    },
  ],
  FL: [
    {
      name: "Miami",
      lat: [25.74, 25.82],
      lng: [-80.25, -80.15],
      area: "305",
      zip: "33130",
    },
    {
      name: "Orlando",
      lat: [28.5, 28.58],
      lng: [-81.43, -81.33],
      area: "407",
      zip: "32801",
    },
    {
      name: "Tampa",
      lat: [27.92, 28.0],
      lng: [-82.52, -82.4],
      area: "813",
      zip: "33602",
    },
    {
      name: "Jacksonville",
      lat: [30.29, 30.36],
      lng: [-81.72, -81.6],
      area: "904",
      zip: "32202",
    },
    {
      name: "Fort Lauderdale",
      lat: [26.1, 26.16],
      lng: [-80.18, -80.1],
      area: "954",
      zip: "33301",
    },
  ],
  WA: [
    {
      name: "Seattle",
      lat: [47.58, 47.68],
      lng: [-122.4, -122.28],
      area: "206",
      zip: "98101",
    },
    {
      name: "Bellevue",
      lat: [47.58, 47.65],
      lng: [-122.23, -122.15],
      area: "425",
      zip: "98004",
    },
    {
      name: "Spokane",
      lat: [47.63, 47.7],
      lng: [-117.48, -117.35],
      area: "509",
      zip: "99201",
    },
    {
      name: "Tacoma",
      lat: [47.22, 47.28],
      lng: [-122.5, -122.38],
      area: "253",
      zip: "98402",
    },
  ],
  IL: [
    {
      name: "Chicago",
      lat: [41.84, 41.92],
      lng: [-87.72, -87.6],
      area: "312",
      zip: "60601",
    },
    {
      name: "Schaumburg",
      lat: [42.0, 42.08],
      lng: [-88.12, -88.02],
      area: "847",
      zip: "60173",
    },
    {
      name: "Springfield",
      lat: [39.76, 39.83],
      lng: [-89.72, -89.6],
      area: "217",
      zip: "62701",
    },
    {
      name: "Naperville",
      lat: [41.73, 41.79],
      lng: [-88.2, -88.1],
      area: "630",
      zip: "60540",
    },
  ],
  PA: [
    {
      name: "Philadelphia",
      lat: [39.92, 40.02],
      lng: [-75.22, -75.1],
      area: "215",
      zip: "19107",
    },
    {
      name: "Pittsburgh",
      lat: [40.4, 40.48],
      lng: [-80.05, -79.9],
      area: "412",
      zip: "15222",
    },
    {
      name: "Allentown",
      lat: [40.57, 40.63],
      lng: [-75.52, -75.42],
      area: "610",
      zip: "18101",
    },
    {
      name: "Harrisburg",
      lat: [40.24, 40.3],
      lng: [-76.93, -76.82],
      area: "717",
      zip: "17101",
    },
  ],
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};
const PROXY_AGENT_CACHE = new Map();

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer-when-downgrade",
  "cross-origin-opener-policy": "same-origin",
};

const API_RATE_LIMIT_WINDOW_MS = Math.max(
  Number(process.env.API_RATE_LIMIT_WINDOW_MS || 60_000),
  1_000,
);
const API_RATE_LIMIT_MAX = Math.max(
  Number(process.env.API_RATE_LIMIT_MAX || 90),
  1,
);
const API_RATE_LIMIT_BUCKETS = new Map();

function getClientKey(req) {
  return req.socket?.remoteAddress || "unknown";
}

function cleanupRateLimitBuckets(now) {
  if (API_RATE_LIMIT_BUCKETS.size < 1024) return;
  for (const [key, bucket] of API_RATE_LIMIT_BUCKETS) {
    if (bucket.resetAt <= now) API_RATE_LIMIT_BUCKETS.delete(key);
  }
}

function consumeApiRateLimit(req) {
  const now = Date.now();
  const key = getClientKey(req);
  const bucket = API_RATE_LIMIT_BUCKETS.get(key);

  if (!bucket || bucket.resetAt <= now) {
    API_RATE_LIMIT_BUCKETS.set(key, {
      count: 1,
      resetAt: now + API_RATE_LIMIT_WINDOW_MS,
    });
    cleanupRateLimitBuckets(now);
    return { allowed: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count <= API_RATE_LIMIT_MAX) {
    return { allowed: true, retryAfter: 0 };
  }

  return {
    allowed: false,
    retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

function enforceApiRateLimit(req, res) {
  const result = consumeApiRateLimit(req);
  if (result.allowed) return true;
  sendJson(res, 429, {
    error: "请求过于频繁，请稍后再试",
    retryAfter: result.retryAfter,
  });
  return false;
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    "content-type": "text/plain; charset=utf-8",
  });
  res.end(text);
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > limit) {
        reject(new Error("请求体过大"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function normalizeRequestError(error, proxyConfig = null) {
  if (error?.message === "请求超时") return error;

  const message = String(error?.message || error || "");
  const code = String(error?.code || "").toUpperCase();

  if (
    code === "ETIMEDOUT" ||
    code === "ESOCKETTIMEDOUT" ||
    message.toLowerCase().includes("timeout")
  ) {
    return new Error("请求超时");
  }

  if (
    proxyConfig &&
    (["ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH", "ECONNRESET"].includes(
      code,
    ) ||
      ["ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH", "ECONNRESET"].some(
        (item) => message.toUpperCase().includes(item),
      ))
  ) {
    return new Error("代理连接失败");
  }

  if (proxyConfig && message) {
    return new Error(`代理请求失败：${message}`);
  }

  return error instanceof Error ? error : new Error(message || "请求失败");
}

function getProxyConfigFromRequest(req) {
  const rawHeader = req.headers[PROXY_CONFIG_HEADER];
  if (!rawHeader) return null;

  const encoded = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  let parsed = null;
  try {
    parsed = JSON.parse(decodeURIComponent(String(encoded || "")));
  } catch (error) {
    throw new Error("代理配置格式无效");
  }

  const type = String(parsed?.type || "direct")
    .trim()
    .toLowerCase();
  if (!type || type === "direct") return null;
  if (type !== "http" && type !== "socks5") {
    throw new Error("仅支持 HTTP 和 SOCKS5 代理");
  }

  const host = String(parsed?.host || "").trim();
  const port = Number(parsed?.port);
  if (!host) throw new Error("代理主机不能为空");
  if (!ALLOW_REMOTE_PROXY && !isLoopbackProxyHost(host)) {
    throw new Error(
      "默认仅允许本机代理；如需远程代理，请设置 ALLOW_REMOTE_PROXY=1",
    );
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("代理端口无效");
  }

  return {
    type,
    host,
    port,
    username: String(parsed?.username || ""),
    password: String(parsed?.password || ""),
  };
}

function isLoopbackProxyHost(host) {
  const value = String(host || "")
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "");
  return (
    value === "localhost" ||
    value === "::1" ||
    value === "0:0:0:0:0:0:0:1" ||
    /^127(?:\.\d{1,3}){3}$/.test(value)
  );
}

function buildProxyUrl(proxyConfig) {
  const protocol = proxyConfig.type === "http" ? "http" : "socks5";
  const proxyUrl = new URL(
    `${protocol}://${proxyConfig.host}:${proxyConfig.port}`,
  );
  if (proxyConfig.username) proxyUrl.username = proxyConfig.username;
  if (proxyConfig.password) proxyUrl.password = proxyConfig.password;
  return proxyUrl;
}

function getProxyAgent(targetUrl, proxyConfig) {
  if (!proxyConfig) return undefined;

  const proxyUrl = buildProxyUrl(proxyConfig);
  const cacheKey = `${proxyUrl.toString()}|${targetUrl.protocol}`;
  if (PROXY_AGENT_CACHE.has(cacheKey)) {
    return PROXY_AGENT_CACHE.get(cacheKey);
  }

  let agent = null;
  if (proxyConfig.type === "http") {
    agent =
      targetUrl.protocol === "https:"
        ? new HttpsProxyAgent(proxyUrl)
        : new HttpProxyAgent(proxyUrl);
  } else {
    agent = new SocksProxyAgent(proxyUrl);
  }

  PROXY_AGENT_CACHE.set(cacheKey, agent);
  return agent;
}

function fetchJson(url, options = {}, timeoutMs = 9000, proxyConfig = null) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(url);
    const client = targetUrl.protocol === "https:" ? https : http;
    const body = options.body || "";
    const headers = { ...(options.headers || {}) };
    if (body && !headers["content-length"] && !headers["Content-Length"]) {
      headers["content-length"] = Buffer.byteLength(body);
    }

    const request = client.request(
      targetUrl,
      {
        method: options.method || "GET",
        headers,
        agent: getProxyAgent(targetUrl, proxyConfig),
      },
      (response) => {
        let text = "";
        let responseTooLarge = false;
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          if (responseTooLarge) return;
          text += chunk;
          if (Buffer.byteLength(text, "utf8") > MAX_JSON_RESPONSE_BYTES) {
            responseTooLarge = true;
            request.destroy(new Error("接口响应过大"));
          }
        });
        response.on("end", () => {
          if (responseTooLarge) return;
          let data = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch (error) {
            reject(new Error(`接口返回不是 JSON：${text.slice(0, 120)}`));
            return;
          }

          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(
              new Error(
                data?.error ||
                  data?.message ||
                  `HTTP ${response.statusCode || 500}`,
              ),
            );
            return;
          }

          resolve(data);
        });
      },
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error("请求超时"));
    });
    request.on("error", (error) => {
      reject(normalizeRequestError(error, proxyConfig));
    });

    if (body) request.write(body);
    request.end();
  });
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function normalizeCountryCode(value) {
  const code = String(value || "")
    .trim()
    .toUpperCase();
  if (code === "UK") return "GB";
  return GLOBAL_COUNTRIES[code] ? code : "US";
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceMeters(start, end) {
  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(end.lat - start.lat);
  const deltaLng = toRadians(end.lng - start.lng);
  const startLat = toRadians(start.lat);
  const endLat = toRadians(end.lat);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;
  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pickGlobalPoint(countryCode, radiusScale = 0.35) {
  const country = GLOBAL_COUNTRIES[countryCode] || GLOBAL_COUNTRIES.US;
  const center = getRandom(country.centers);
  const distanceKm = Math.sqrt(Math.random()) * center.radiusKm * radiusScale;
  const bearing = Math.random() * Math.PI * 2;
  const latDelta = (distanceKm * Math.cos(bearing)) / 111.32;
  const lngDelta =
    (distanceKm * Math.sin(bearing)) /
    (111.32 * Math.max(Math.cos(toRadians(center.lat)), 0.2));
  return {
    countryCode,
    countryName: country.name,
    language: country.language,
    cityHint: center.name,
    lat: Number((center.lat + latDelta).toFixed(7)),
    lng: Number((center.lng + lngDelta).toFixed(7)),
  };
}

function isWaterLike(result) {
  const category = String(result?.category || "").toLowerCase();
  const type = String(result?.type || result?.addresstype || "").toLowerCase();
  return WATER_CATEGORIES.has(category) && WATER_TYPES.has(type);
}

function isCoarseAreaResult(result) {
  const type = String(result?.type || "").toLowerCase();
  const addressType = String(result?.addresstype || "").toLowerCase();
  return COARSE_TYPES.has(type) || COARSE_TYPES.has(addressType);
}

function hasLocalityContext(address) {
  return (
    LOCALITY_FIELDS.some((field) => String(address?.[field] || "").trim()) ||
    String(address?.postcode || "").trim()
  );
}

function hasStreetLevelAddress(address) {
  return (
    Boolean(getNominatimAddressPart(address, ["road"])) &&
    hasLocalityContext(address)
  );
}

function resolveValidatedGlobalPoint(requestedPoint, raw, expectedCountryCode) {
  const address = raw?.address || {};
  const responseCountryCode = String(address.country_code || "")
    .trim()
    .toUpperCase();
  if (!responseCountryCode || responseCountryCode !== expectedCountryCode)
    return null;
  if (isWaterLike(raw) || isCoarseAreaResult(raw)) return null;
  if (Number(raw.place_rank || 0) < MIN_STREET_LEVEL_PLACE_RANK) return null;
  if (!hasStreetLevelAddress(address)) return null;

  const reversePoint = { lat: Number(raw.lat), lng: Number(raw.lon) };
  if (
    !Number.isFinite(reversePoint.lat) ||
    !Number.isFinite(reversePoint.lng)
  ) {
    return null;
  }

  const distanceMeters = getDistanceMeters(requestedPoint, reversePoint);
  if (distanceMeters <= MAX_REVERSE_MATCH_DISTANCE_METERS) {
    return {
      ...requestedPoint,
      mapVerification: {
        streetLevel: true,
        waterFiltered: true,
        coarseFiltered: true,
        distanceMeters: Math.round(distanceMeters),
        snapped: false,
      },
    };
  }
  if (distanceMeters <= MAX_COORD_SNAP_DISTANCE_METERS) {
    return {
      ...requestedPoint,
      lat: reversePoint.lat,
      lng: reversePoint.lng,
      mapVerification: {
        streetLevel: true,
        waterFiltered: true,
        coarseFiltered: true,
        distanceMeters: Math.round(distanceMeters),
        snapped: true,
      },
    };
  }
  return null;
}

function buildGlobalReverseUrl(point) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(point.lat),
    lon: String(point.lng),
    zoom: "18",
    addressdetails: "1",
    "accept-language": point.language || "en",
  });
  return `${NOMINATIM_REVERSE_API_URL}?${params.toString()}`;
}

function makeGlobalPhone(countryCode) {
  const phone =
    GLOBAL_COUNTRIES[countryCode]?.phone || GLOBAL_COUNTRIES.US.phone;
  const digits = phone.groups.map((length) =>
    Array.from({ length }, () => Math.floor(Math.random() * 10)).join(""),
  );
  return `+${phone.dial} ${digits.join(" ")}`;
}

async function getFakerModule() {
  if (!fakerModulePromise) {
    fakerModulePromise = import("@faker-js/faker");
  }
  return fakerModulePromise;
}

async function getLocalizedFaker(countryCode) {
  const fakerModule = await getFakerModule();
  const localeName = FAKER_LOCALE_BY_COUNTRY[countryCode] || "fakerEN_US";
  return fakerModule[localeName] || fakerModule.fakerEN_US || fakerModule.faker;
}

function normalizeProfileCountryCode(value) {
  const code = String(value || "US")
    .trim()
    .toUpperCase();
  if (code === "UK") return "GB";
  return GLOBAL_COUNTRIES[code] ? code : "US";
}

function formatDateIso(date) {
  const safeDate =
    date instanceof Date && !Number.isNaN(date.getTime())
      ? date
      : new Date(1988, 0, 1);
  return safeDate.toISOString().slice(0, 10);
}

function getBirthYear(value) {
  const year = Number(String(value || "").slice(0, 4));
  return Number.isInteger(year) && year > 1900 ? String(year).slice(2) : "";
}

function sanitizeEmailPart(value, fallback = "user") {
  const normalized = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, ".")
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase();
  return normalized || fallback;
}

function buildDisplayName(countryCode, firstName, lastName) {
  if (NAME_WITHOUT_SPACE_COUNTRIES.has(countryCode))
    return `${lastName}${firstName}`;
  return `${firstName} ${lastName}`.trim();
}

function generatePreferredEmail({
  firstName,
  lastName,
  fallbackFirst,
  fallbackLast,
  birthday,
}) {
  const first = sanitizeEmailPart(
    firstName,
    sanitizeEmailPart(fallbackFirst, "user"),
  );
  const last = sanitizeEmailPart(
    lastName,
    sanitizeEmailPart(fallbackLast, "mail"),
  );
  const fallbackFirstPart = sanitizeEmailPart(fallbackFirst, first);
  const fallbackLastPart = sanitizeEmailPart(fallbackLast, last);
  const year = getBirthYear(birthday);
  const shortNumber = String(Math.floor(Math.random() * 90) + 10);
  const patterns = [
    `${first}.${last}`,
    `${first}_${last}`,
    `${first}${last}${year || shortNumber}`,
    `${first.charAt(0)}${last}${shortNumber}`,
    `${fallbackFirstPart}.${fallbackLastPart}${year || shortNumber}`,
  ];
  const localPart = getRandom(patterns)
    .replace(/\.+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${localPart}@${getRandom(EMAIL_DOMAINS)}`;
}

function generateMemorableStrongPassword() {
  const wordA = getRandom(PASSWORD_WORDS);
  const wordB = getRandom(PASSWORD_WORDS);
  const number = Math.floor(Math.random() * 900) + 100;
  const symbol = getRandom(["!", "#", "$", "%", "&"]);
  return `${toTitleCaseWord(wordA)}${toTitleCaseWord(wordB)}${number}${symbol}`;
}

function generateReadablePhoneNumber(countryCode, areaCode = "") {
  if (countryCode === "US" || countryCode === "CA")
    return makeUsPhone(areaCode);
  return makeGlobalPhone(countryCode);
}

async function generateLocalizedProfile(countryCode, areaCode = "") {
  const safeCountryCode = normalizeProfileCountryCode(countryCode);
  const localFaker = await getLocalizedFaker(safeCountryCode);
  const fallbackFaker = await getLocalizedFaker("US");
  const gender = Math.random() < 0.5 ? "male" : "female";
  const firstName = localFaker.person.firstName(gender);
  const lastName = localFaker.person.lastName(gender);
  const fallbackFirst = fallbackFaker.person.firstName(gender);
  const fallbackLast = fallbackFaker.person.lastName(gender);
  const birthday = formatDateIso(
    localFaker.date.birthdate({ min: 21, max: 58, mode: "age" }),
  );
  const name = buildDisplayName(safeCountryCode, firstName, lastName);

  return {
    name,
    firstName,
    lastName,
    gender,
    birthday,
    email: generatePreferredEmail({
      firstName: EAST_ASIAN_COUNTRIES.has(safeCountryCode)
        ? fallbackFirst
        : firstName,
      lastName: EAST_ASIAN_COUNTRIES.has(safeCountryCode)
        ? fallbackLast
        : lastName,
      fallbackFirst,
      fallbackLast,
      birthday,
    }),
    phone: generateReadablePhoneNumber(safeCountryCode, areaCode),
    password: generateMemorableStrongPassword(),
  };
}

async function handleProfile(req, res, url) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  try {
    const countryCode = normalizeProfileCountryCode(
      url.searchParams.get("country"),
    );
    const areaCode = String(url.searchParams.get("area") || "")
      .replace(/\D/g, "")
      .slice(0, 3);
    sendJson(res, 200, await generateLocalizedProfile(countryCode, areaCode));
  } catch (error) {
    sendJson(res, 502, { error: error.message || String(error) });
  }
}

function normalizeGlobalIdentity(raw, countryCode, point) {
  if (!raw || typeof raw !== "object") throw new Error("全球地图源返回为空");
  if (raw.error) throw new Error(raw.error);

  const address = raw.address || {};
  const road = getNominatimAddressPart(address, [
    "road",
    "pedestrian",
    "residential",
    "footway",
    "cycleway",
    "path",
  ]);
  const houseNumber = getNominatimAddressPart(address, ["house_number"]);
  const city = toTitleCaseText(
    getNominatimAddressPart(address, LOCALITY_FIELDS) || point.cityHint,
  );
  const state = toTitleCaseText(
    getNominatimAddressPart(address, ["state", "region", "province", "county"]),
  );
  const zip = String(address.postcode || "").trim();
  const countryName =
    toTitleCaseText(address.country) ||
    GLOBAL_COUNTRIES[countryCode]?.name ||
    countryCode;

  if (!road || !city) throw new Error("全球地图源缺少街道或城市字段");

  const firstName = getRandom(GLOBAL_NAME_DB.first);
  const lastName = getRandom(GLOBAL_NAME_DB.last);
  const fullName = `${firstName} ${lastName}`;
  const emailName = fullName
    .replace(/[^a-z0-9]+/gi, ".")
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase();
  const line1 = [houseNumber, toTitleCaseText(road)].filter(Boolean).join(" ");
  const confidence = houseNumber && zip ? "high" : "medium";

  return {
    name: fullName,
    email: `${emailName}.${Math.floor(Math.random() * 9999)}@gmail.com`,
    phone: makeGlobalPhone(countryCode),
    line1,
    line2: "",
    city,
    state,
    zip,
    country: countryName,
    countryCode,
    lat: point.lat,
    lng: point.lng,
    stateName: state,
    zipStateVerified: Boolean(zip),
    confidence,
    confidenceLabel: confidence === "high" ? "高" : "中",
    confidenceReason:
      confidence === "high"
        ? "全球地图源反查为街道级地址，含门牌、城市和邮编，并通过水域/粗粒度/距离校验"
        : "全球地图源反查为街道级地址，并通过水域/粗粒度/距离校验，部分字段可能缺少门牌或邮编",
    mapVerification: point.mapVerification || null,
    source: "global",
  };
}

function normalizeStateCode(value) {
  const code = String(value || "")
    .trim()
    .toUpperCase();
  return LOCAL_SOURCE_BOUNDS[code] ? code : "";
}

function toTitleCaseWord(word) {
  const raw = String(word || "").trim();
  if (!raw) return "";
  if (/^[NSEW]{1,2}$/i.test(raw)) return raw.toUpperCase();
  if (/^\d+[A-Z]?$/i.test(raw)) return raw.toUpperCase();
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function toTitleCaseText(value) {
  return String(value || "")
    .trim()
    .split(/(\s+|-)/)
    .map((part) => {
      if (!part || /^\s+$/.test(part) || part === "-") return part;
      if (part.includes("'")) {
        return part
          .split("'")
          .map((segment) => toTitleCaseWord(segment))
          .join("'");
      }
      return toTitleCaseWord(part);
    })
    .join("");
}

function normalizeZip5(zip, fallback = "97204") {
  const match = String(zip || "").match(/\d{5}/);
  return match ? match[0] : fallback;
}

function isZipInState(zip, stateCode) {
  const match = String(zip || "").match(/\d{5}/);
  if (!match) return false;

  const ranges = USPS_ZIP_PREFIX_RANGES[String(stateCode || "").toUpperCase()];
  if (!ranges) return false;

  const prefix = Number(match[0].slice(0, 3));
  return ranges.some(([min, max]) => prefix >= min && prefix <= max);
}

function makeUsPhone(areaCode = "503") {
  const safeArea = /^[2-9]\d{2}$/.test(String(areaCode || ""))
    ? String(areaCode)
    : "503";
  const prefix = Math.floor(Math.random() * 800) + 200;
  const line = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0");
  return `(${safeArea}) ${prefix}-${line}`;
}

function getNominatimAddressPart(address, keys) {
  for (const key of keys) {
    const value = address?.[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
}

function normalizeNominatimStateCode(address) {
  const rawState = getNominatimAddressPart(address, [
    "state",
    "region",
    "province",
  ]);
  const rawCode = getNominatimAddressPart(address, [
    "state_code",
    "ISO3166-2-lvl4",
  ]);
  if (rawCode) {
    const match = rawCode.toUpperCase().match(/(?:US-)?([A-Z]{2})$/);
    if (match) return match[1];
  }
  return LOCAL_STATE_MAP[rawState.toLowerCase()] || "";
}

function pickLocalPoint(stateCode) {
  const boxes = LOCAL_SOURCE_BOUNDS[stateCode] || LOCAL_SOURCE_BOUNDS.OR;
  const box = getRandom(boxes);
  return {
    state: stateCode,
    cityHint: box.name,
    areaCode: box.area,
    zip: box.zip,
    lat: Number(randomBetween(box.lat[0], box.lat[1]).toFixed(7)),
    lng: Number(randomBetween(box.lng[0], box.lng[1]).toFixed(7)),
  };
}

function buildNominatimReverseUrl(point) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(point.lat),
    lon: String(point.lng),
    zoom: "18",
    addressdetails: "1",
    "accept-language": "en",
  });
  return `${NOMINATIM_REVERSE_API_URL}?${params.toString()}`;
}

function normalizeLocalIdentity(raw, expectedStateCode = "", point = null) {
  if (!raw || typeof raw !== "object") throw new Error("本地源返回为空");
  if (raw.error) throw new Error(raw.error);

  const address = raw.address || {};
  const countryCode = String(address.country_code || "")
    .trim()
    .toUpperCase();
  if (countryCode && countryCode !== "US") {
    throw new Error(`本地源返回非美国地址: ${countryCode}`);
  }

  const resultState = normalizeNominatimStateCode(address);
  const expectedState = String(expectedStateCode || "")
    .trim()
    .toUpperCase();
  if (expectedState && resultState && resultState !== expectedState) {
    throw new Error(
      `本地源返回州不匹配: expected ${expectedState}, got ${resultState}`,
    );
  }

  const finalState = resultState || expectedState || "OR";
  const road = getNominatimAddressPart(address, [
    "road",
    "pedestrian",
    "residential",
    "footway",
    "cycleway",
    "path",
  ]);
  const houseNumber = getNominatimAddressPart(address, ["house_number"]);
  const city = toTitleCaseText(
    getNominatimAddressPart(address, [
      "city",
      "town",
      "village",
      "municipality",
      "hamlet",
      "suburb",
      "county",
    ]),
  );
  const rawZip = normalizeZip5(address.postcode, "");
  if (rawZip && !isZipInState(rawZip, finalState)) {
    throw new Error(`本地源返回 ZIP 与州不匹配: ${rawZip} / ${finalState}`);
  }
  const zip = rawZip || point?.zip || "97204";
  const zipStateVerified = isZipInState(zip, finalState);

  if (!road || !houseNumber || !city) {
    throw new Error("本地源缺少详细地址字段");
  }

  if (!zipStateVerified) {
    throw new Error(`本地源 ZIP 无法通过州一致性校验: ${zip} / ${finalState}`);
  }

  const confidence = rawZip ? "high" : "medium";
  const confidenceLabel = rawZip ? "高" : "中";
  const confidenceReason = rawZip
    ? "地图反查含门牌、街道、城市，且通过水域/粗粒度/距离和 ZIP/州一致性校验"
    : "地图反查含门牌、街道、城市，且通过水域/粗粒度/距离校验；ZIP 使用同城备用值且与州一致";

  const firstName = getRandom(LOCAL_SOURCE_NAME_DB.first);
  const lastName = getRandom(LOCAL_SOURCE_NAME_DB.last);
  const fullName = `${firstName} ${lastName}`;
  const emailName = fullName
    .replace(/[^a-z0-9]+/gi, ".")
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase();

  return {
    name: fullName,
    email: `${emailName}.${Math.floor(Math.random() * 9999)}@gmail.com`,
    phone: makeUsPhone(point?.areaCode || "503"),
    line1: `${houseNumber} ${toTitleCaseText(road)}`,
    line2: "",
    city,
    state: finalState,
    zip,
    country: "US",
    lat: point?.lat ?? raw.lat,
    lng: point?.lng ?? raw.lon,
    areaCode: point?.areaCode || "503",
    stateName: LOCAL_STATE_NAMES[finalState] || finalState,
    zipStateVerified,
    zipSource: rawZip ? "nominatim" : "fallback",
    confidence,
    confidenceLabel,
    confidenceReason,
    mapVerification: point?.mapVerification || null,
    source: "local",
  };
}

async function handleFakeAddress(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  try {
    const proxyConfig = getProxyConfigFromRequest(req);
    const body = await readBody(req);
    const parsed = JSON.parse(body || "{}");
    const state = String(parsed.state || "oregon")
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, 32);
    const data = await fetchJson(
      FAKE_ADDRESS_API_URL,
      {
        method: "POST",
        headers: {
          accept: "application/json,text/plain,*/*",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          "content-type": "application/json",
          pragma: "no-cache",
          referer: "https://fakeaddressgenerator.click/zh",
        },
        body: JSON.stringify({ state }),
      },
      9000,
      proxyConfig,
    );
    sendJson(res, 200, data);
  } catch (error) {
    sendJson(res, 502, { error: error.message || String(error) });
  }
}

async function handleRealAddress(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  try {
    const proxyConfig = getProxyConfigFromRequest(req);
    const requestUrl = new URL(
      req.url,
      `http://${req.headers.host || `${HOST}:${PORT}`}`,
    );
    const stateName = String(requestUrl.searchParams.get("state") || "")
      .trim()
      .replace(/[^a-zA-Z\s]/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 40);
    const targetUrl = new URL(REAL_ADDRESS_API_URL);
    if (stateName) targetUrl.searchParams.set("state", stateName);

    const data = await fetchJson(
      targetUrl.toString(),
      {
        method: "GET",
        headers: {
          accept: "application/json,text/plain,*/*",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
          "cache-control": "no-cache",
          "content-type": "application/json",
          pragma: "no-cache",
          referer: "https://www.zhenshidizhi.com/",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0",
        },
      },
      9000,
      proxyConfig,
    );
    sendJson(res, 200, data);
  } catch (error) {
    sendJson(res, 502, { error: error.message || String(error) });
  }
}

async function handleLocalAddress(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  try {
    const proxyConfig = getProxyConfigFromRequest(req);
    const requestUrl = new URL(
      req.url,
      `http://${req.headers.host || `${HOST}:${PORT}`}`,
    );
    const requestedStateCode = normalizeStateCode(
      requestUrl.searchParams.get("state"),
    );
    const stateCode =
      requestedStateCode || getRandom(Object.keys(LOCAL_SOURCE_BOUNDS));
    let lastError = null;

    for (let attempt = 1; attempt <= 6; attempt++) {
      const point = pickLocalPoint(stateCode);
      try {
        const data = await fetchJson(
          buildNominatimReverseUrl(point),
          {
            method: "GET",
            headers: {
              accept: "application/json,text/plain,*/*",
              "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
              "cache-control": "no-cache",
              pragma: "no-cache",
              referer: "https://nominatim.openstreetmap.org/ui/reverse.html",
              "user-agent": "random-address-generator-local/1.0",
            },
          },
          7500,
          proxyConfig,
        );
        const resolvedPoint = resolveValidatedGlobalPoint(point, data, "US");
        if (!resolvedPoint) {
          lastError = new Error("本地源未通过街道级、水域/粗粒度或距离校验");
          continue;
        }

        sendJson(
          res,
          200,
          normalizeLocalIdentity(data, stateCode, resolvedPoint),
        );
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("本地源未返回可用地址");
  } catch (error) {
    sendJson(res, 502, { error: error.message || String(error) });
  }
}

async function handleGlobalAddress(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  try {
    const proxyConfig = getProxyConfigFromRequest(req);
    const requestUrl = new URL(
      req.url,
      `http://${req.headers.host || `${HOST}:${PORT}`}`,
    );
    const countryCode = normalizeCountryCode(
      requestUrl.searchParams.get("country"),
    );
    let lastError = null;

    for (const radiusScale of GLOBAL_RANDOM_RADIUS_SCALES) {
      for (let attempt = 1; attempt <= GLOBAL_ATTEMPTS_PER_RADIUS; attempt++) {
        const requestedPoint = pickGlobalPoint(countryCode, radiusScale);
        try {
          const data = await fetchJson(
            buildGlobalReverseUrl(requestedPoint),
            {
              method: "GET",
              headers: {
                accept: "application/json,text/plain,*/*",
                "accept-language": `${requestedPoint.language},en;q=0.8`,
                "cache-control": "no-cache",
                pragma: "no-cache",
                referer: "https://nominatim.openstreetmap.org/ui/reverse.html",
                "user-agent": "random-address-generator-global/1.0",
              },
            },
            8500,
            proxyConfig,
          );
          const resolvedPoint = resolveValidatedGlobalPoint(
            requestedPoint,
            data,
            countryCode,
          );
          if (!resolvedPoint) {
            lastError = new Error("全球地图源未命中街道级地址");
            continue;
          }

          sendJson(
            res,
            200,
            normalizeGlobalIdentity(data, countryCode, resolvedPoint),
          );
          return;
        } catch (error) {
          lastError = error;
        }
      }
    }

    throw lastError || new Error("全球地图源未返回可用地址");
  } catch (error) {
    sendJson(res, 502, { error: error.message || String(error) });
  }
}

async function handleNominatim(req, res, url) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  try {
    const proxyConfig = getProxyConfigFromRequest(req);
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: url.searchParams.get("lat") || "",
      lon: url.searchParams.get("lon") || "",
      zoom: "18",
      addressdetails: "1",
      "accept-language": "en",
    });
    const lat = Number(params.get("lat"));
    const lon = Number(params.get("lon"));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error("lat/lon 参数无效");
    }

    const data = await fetchJson(
      `${NOMINATIM_REVERSE_API_URL}?${params}`,
      {
        method: "GET",
        headers: {
          accept: "application/json,text/plain,*/*",
          "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
          "cache-control": "no-cache",
          pragma: "no-cache",
          referer: "https://nominatim.openstreetmap.org/ui/reverse.html",
          "user-agent": "random-address-generator-local/1.0",
        },
      },
      9000,
      proxyConfig,
    );
    sendJson(res, 200, data);
  } catch (error) {
    sendJson(res, 502, { error: error.message || String(error) });
  }
}

async function serveStatic(res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  let decodedPath = "";
  try {
    decodedPath = decodeURIComponent(safePath);
  } catch (error) {
    sendText(res, 400, "Bad Request");
    return;
  }
  const filePath = path.resolve(ROOT, `.${decodedPath}`);
  const relativePath = path.relative(ROOT, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      "content-type":
        MIME[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(content);
  } catch (error) {
    sendText(res, 404, "Not Found");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(
    req.url,
    `http://${req.headers.host || `${HOST}:${PORT}`}`,
  );

  if (url.pathname.startsWith("/api/") && !enforceApiRateLimit(req, res)) {
    return;
  }

  if (url.pathname === "/api/fake-address") {
    await handleFakeAddress(req, res);
    return;
  }
  if (url.pathname === "/api/local-address") {
    await handleLocalAddress(req, res);
    return;
  }
  if (url.pathname === "/api/real-address") {
    await handleRealAddress(req, res);
    return;
  }
  if (url.pathname === "/api/global-address") {
    await handleGlobalAddress(req, res);
    return;
  }
  if (url.pathname === "/api/nominatim-reverse") {
    await handleNominatim(req, res, url);
    return;
  }
  if (url.pathname === "/api/profile") {
    await handleProfile(req, res, url);
    return;
  }
  await serveStatic(res, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`随机地址生成器已启动：http://${HOST}:${PORT}`);
});
