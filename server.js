const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs/promises");
const path = require("node:path");
const { HttpProxyAgent } = require("http-proxy-agent");
const { HttpsProxyAgent } = require("https-proxy-agent");
const { SocksProxyAgent } = require("socks-proxy-agent");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;
const PROXY_CONFIG_HEADER = "x-proxy-config";
const FAKE_ADDRESS_API_URL = "https://fakeaddressgenerator.click/api/generate";
const NOMINATIM_REVERSE_API_URL = "https://nominatim.openstreetmap.org/reverse";
const REAL_ADDRESS_API_URL =
  "https://www.zhenshidizhi.com/api/addresses/random?country=US&count=1";
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
  ],
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};
const PROXY_AGENT_CACHE = new Map();

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { "content-type": "text/plain; charset=utf-8" });
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
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          text += chunk;
        });
        response.on("end", () => {
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
  const zip = normalizeZip5(address.postcode, point?.zip || "97204");

  if (!road || !houseNumber || !city) {
    throw new Error("本地源缺少详细地址字段");
  }

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

    for (let attempt = 1; attempt <= 3; attempt++) {
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
        sendJson(res, 200, normalizeLocalIdentity(data, stateCode, point));
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
  const filePath = path.resolve(ROOT, `.${decodeURIComponent(safePath)}`);
  if (!filePath.startsWith(ROOT)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
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
  if (url.pathname === "/api/nominatim-reverse") {
    await handleNominatim(req, res, url);
    return;
  }
  await serveStatic(res, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`随机地址生成器已启动：http://${HOST}:${PORT}`);
});
