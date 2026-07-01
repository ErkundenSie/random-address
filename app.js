const ADDRESS_SOURCE = {
  LOCAL: "local",
  REAL: "real",
  ORIGINAL: "original",
  FAKE: "fake",
  NOMINATIM: "nominatim",
  GLOBAL: "global",
};

const SETTINGS_KEY = "random_address_generator_settings_v2";
const HISTORY_KEY = "random_address_generator_history_v1";
const PROXY_CONFIG_HEADER = "x-proxy-config";
const FAKE_ADDRESS_API_URL = "https://fakeaddressgenerator.click/api/generate";
const NOMINATIM_REVERSE_API_URL = "https://nominatim.openstreetmap.org/reverse";
const SOURCE_SITE_URLS = {
  local: "https://github.com/chatgptuk/Real-US-Address-Generator",
  real: "https://www.zhenshidizhi.com/",
  zhenshidizhi: "https://www.zhenshidizhi.com/",
  fake: "https://fakeaddressgenerator.click/zh",
  fakeaddressgenerator: "https://fakeaddressgenerator.click/zh",
  nominatim: "https://nominatim.openstreetmap.org/ui/reverse.html",
  global: "https://github.com/YeShengDe/AddressGeneratorFe",
};
const LOCAL_SERVER_HINT =
  "接口源需要通过本地服务打开：运行 start-local.bat，或在此目录执行 node server.js 后访问 http://127.0.0.1:8787";
const TAX_FREE_STATES = ["OR", "DE", "NH", "MT", "AK"];
const GLOBAL_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "CN", name: "China" },
];
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

const RESIDENTIAL_DB = {
  OR: [
    {
      base: "1050 SW 6th Ave",
      city: "Portland",
      zip: "97204",
      area: "503",
      state: "OR",
    },
    {
      base: "400 NW 23rd Ave",
      city: "Portland",
      zip: "97210",
      area: "971",
      state: "OR",
    },
    {
      base: "1200 NW Naito Pkwy",
      city: "Portland",
      zip: "97209",
      area: "503",
      state: "OR",
    },
    {
      base: "1551 SW Broadway",
      city: "Portland",
      zip: "97201",
      area: "503",
      state: "OR",
    },
  ],
  DE: [
    {
      base: "1000 Christiana Mall",
      city: "Newark",
      zip: "19702",
      area: "302",
      state: "DE",
    },
    {
      base: "2000 Rambleton Dr",
      city: "New Castle",
      zip: "19720",
      area: "302",
      state: "DE",
    },
    {
      base: "820 N French St",
      city: "Wilmington",
      zip: "19801",
      area: "302",
      state: "DE",
    },
    {
      base: "1100 N Market St",
      city: "Wilmington",
      zip: "19890",
      area: "302",
      state: "DE",
    },
  ],
  NH: [
    {
      base: "1500 S Willow St",
      city: "Manchester",
      zip: "03103",
      area: "603",
      state: "NH",
    },
    {
      base: "75 Canal St",
      city: "Manchester",
      zip: "03101",
      area: "603",
      state: "NH",
    },
    {
      base: "310 Daniel Webster Hwy",
      city: "Nashua",
      zip: "03060",
      area: "603",
      state: "NH",
    },
  ],
  MT: [
    {
      base: "1301 E 6th Ave",
      city: "Helena",
      zip: "59601",
      area: "406",
      state: "MT",
    },
    {
      base: "222 N 32nd St",
      city: "Billings",
      zip: "59101",
      area: "406",
      state: "MT",
    },
  ],
  AK: [
    {
      base: "3901 Old Seward Hwy",
      city: "Anchorage",
      zip: "99503",
      area: "907",
      state: "AK",
    },
    {
      base: "800 Glacier Ave",
      city: "Juneau",
      zip: "99801",
      area: "907",
      state: "AK",
    },
  ],
  CA: [
    {
      base: "5600 Wilshire Blvd",
      city: "Los Angeles",
      zip: "90036",
      area: "323",
      state: "CA",
    },
    {
      base: "555 4th St",
      city: "San Francisco",
      zip: "94107",
      area: "415",
      state: "CA",
    },
    {
      base: "100 Universal City Plaza",
      city: "Universal City",
      zip: "91608",
      area: "818",
      state: "CA",
    },
  ],
  NY: [
    {
      base: "606 W 57th St",
      city: "New York",
      zip: "10019",
      area: "212",
      state: "NY",
    },
    {
      base: "125 Park Ave",
      city: "New York",
      zip: "10017",
      area: "212",
      state: "NY",
    },
    {
      base: "1 Empire State Bldg",
      city: "New York",
      zip: "10118",
      area: "212",
      state: "NY",
    },
  ],
  TX: [
    {
      base: "5085 Westheimer Rd",
      city: "Houston",
      zip: "77056",
      area: "713",
      state: "TX",
    },
    {
      base: "13331 Preston Rd",
      city: "Dallas",
      zip: "75240",
      area: "214",
      state: "TX",
    },
    {
      base: "1100 Congress Ave",
      city: "Austin",
      zip: "78701",
      area: "512",
      state: "TX",
    },
  ],
  FL: [
    {
      base: "400 Ocean Dr",
      city: "Miami Beach",
      zip: "33139",
      area: "305",
      state: "FL",
    },
    {
      base: "8001 S Orange Blossom Trl",
      city: "Orlando",
      zip: "32809",
      area: "407",
      state: "FL",
    },
    {
      base: "100 S Biscayne Blvd",
      city: "Miami",
      zip: "33131",
      area: "305",
      state: "FL",
    },
  ],
  WA: [
    {
      base: "601 4th Ave",
      city: "Seattle",
      zip: "98104",
      area: "206",
      state: "WA",
    },
    {
      base: "700 Bellevue Way NE",
      city: "Bellevue",
      zip: "98004",
      area: "425",
      state: "WA",
    },
    {
      base: "400 Broad St",
      city: "Seattle",
      zip: "98109",
      area: "206",
      state: "WA",
    },
  ],
  IL: [
    {
      base: "233 S Wacker Dr",
      city: "Chicago",
      zip: "60606",
      area: "312",
      state: "IL",
    },
    {
      base: "1000 E Golf Rd",
      city: "Schaumburg",
      zip: "60173",
      area: "847",
      state: "IL",
    },
  ],
  PA: [
    {
      base: "100 S Broad St",
      city: "Philadelphia",
      zip: "19110",
      area: "215",
      state: "PA",
    },
    {
      base: "500 Grant St",
      city: "Pittsburgh",
      zip: "15219",
      area: "412",
      state: "PA",
    },
  ],
};

const NAMES_DB = {
  first: [
    "James",
    "John",
    "Robert",
    "Michael",
    "William",
    "David",
    "Richard",
    "Joseph",
    "Thomas",
    "Charles",
    "Mary",
    "Patricia",
    "Jennifer",
    "Linda",
    "Elizabeth",
    "Barbara",
    "Susan",
    "Jessica",
    "Sarah",
    "Karen",
  ],
  last: [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
  ],
};

const STATE_MAP = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

const TAX_FREE_STATE_API_MAP = {
  OR: "oregon",
  DE: "delaware",
  NH: "newhampshire",
  MT: "montana",
  AK: "alaska",
};

const NOMINATIM_STATE_BOUNDS = {
  OR: [
    {
      name: "Portland",
      lat: [45.45, 45.58],
      lng: [-122.75, -122.55],
      area: "503",
    },
    { name: "Salem", lat: [44.88, 45.02], lng: [-123.1, -122.93], area: "503" },
    { name: "Bend", lat: [44.0, 44.12], lng: [-121.38, -121.23], area: "541" },
  ],
  DE: [
    {
      name: "Wilmington",
      lat: [39.7, 39.78],
      lng: [-75.6, -75.48],
      area: "302",
    },
    { name: "Newark", lat: [39.63, 39.72], lng: [-75.82, -75.68], area: "302" },
    { name: "Dover", lat: [39.1, 39.2], lng: [-75.6, -75.45], area: "302" },
  ],
  NH: [
    {
      name: "Manchester",
      lat: [42.94, 43.04],
      lng: [-71.51, -71.39],
      area: "603",
    },
    { name: "Nashua", lat: [42.71, 42.8], lng: [-71.55, -71.4], area: "603" },
    { name: "Concord", lat: [43.18, 43.25], lng: [-71.6, -71.48], area: "603" },
  ],
  MT: [
    {
      name: "Billings",
      lat: [45.73, 45.84],
      lng: [-108.65, -108.42],
      area: "406",
    },
    {
      name: "Missoula",
      lat: [46.82, 46.92],
      lng: [-114.1, -113.92],
      area: "406",
    },
    {
      name: "Helena",
      lat: [46.55, 46.63],
      lng: [-112.08, -111.96],
      area: "406",
    },
  ],
  AK: [
    {
      name: "Anchorage",
      lat: [61.12, 61.23],
      lng: [-150.05, -149.75],
      area: "907",
    },
    {
      name: "Juneau",
      lat: [58.28, 58.36],
      lng: [-134.5, -134.35],
      area: "907",
    },
    {
      name: "Fairbanks",
      lat: [64.8, 64.88],
      lng: [-147.85, -147.6],
      area: "907",
    },
  ],
  CA: [
    {
      name: "Los Angeles",
      lat: [34.0, 34.12],
      lng: [-118.35, -118.2],
      area: "323",
    },
    {
      name: "San Francisco",
      lat: [37.73, 37.8],
      lng: [-122.48, -122.38],
      area: "415",
    },
    {
      name: "San Diego",
      lat: [32.7, 32.78],
      lng: [-117.2, -117.08],
      area: "619",
    },
  ],
  NY: [
    {
      name: "New York",
      lat: [40.7, 40.82],
      lng: [-74.03, -73.93],
      area: "212",
    },
    {
      name: "Brooklyn",
      lat: [40.63, 40.72],
      lng: [-74.02, -73.9],
      area: "718",
    },
  ],
  TX: [
    { name: "Houston", lat: [29.7, 29.82], lng: [-95.48, -95.3], area: "713" },
    { name: "Dallas", lat: [32.74, 32.84], lng: [-96.88, -96.7], area: "214" },
    { name: "Austin", lat: [30.24, 30.34], lng: [-97.8, -97.68], area: "512" },
  ],
  FL: [
    { name: "Miami", lat: [25.74, 25.82], lng: [-80.25, -80.15], area: "305" },
    { name: "Orlando", lat: [28.5, 28.58], lng: [-81.43, -81.33], area: "407" },
    { name: "Tampa", lat: [27.92, 28.0], lng: [-82.52, -82.4], area: "813" },
  ],
  WA: [
    {
      name: "Seattle",
      lat: [47.58, 47.68],
      lng: [-122.4, -122.28],
      area: "206",
    },
    {
      name: "Bellevue",
      lat: [47.58, 47.65],
      lng: [-122.23, -122.15],
      area: "425",
    },
  ],
  IL: [
    { name: "Chicago", lat: [41.84, 41.92], lng: [-87.72, -87.6], area: "312" },
    {
      name: "Schaumburg",
      lat: [42.0, 42.08],
      lng: [-88.12, -88.02],
      area: "847",
    },
  ],
  PA: [
    {
      name: "Philadelphia",
      lat: [39.92, 40.02],
      lng: [-75.22, -75.1],
      area: "215",
    },
    {
      name: "Pittsburgh",
      lat: [40.4, 40.48],
      lng: [-80.05, -79.9],
      area: "412",
    },
  ],
};

const state = {
  currentIdentity: null,
  isBusy: false,
  history: [],
  lastFallbackNotice: "",
};

const $ = (id) => document.getElementById(id);
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch (error) {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history.slice(0, 10)));
}

function addToHistory(id) {
  state.history = [
    { ...id, generatedAt: new Date().toISOString() },
    ...state.history,
  ].slice(0, 10);
  saveHistory();
  renderHistory();
}

function formatHistoryTime(value) {
  if (!value) return "刚刚";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderHistory() {
  const list = $("historyList");
  if (!list) return;
  list.replaceChildren();

  if (!state.history.length) {
    const empty = document.createElement("p");
    empty.className = "empty-text";
    empty.textContent = "暂无历史记录";
    list.appendChild(empty);
    return;
  }

  state.history.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    button.dataset.index = String(index);

    const top = document.createElement("span");
    top.className = "history-item-top";

    const title = document.createElement("strong");
    title.textContent =
      `${item.city || "-"}, ${item.state || "-"} ${item.zip || ""}`.trim();

    const time = document.createElement("small");
    time.textContent = formatHistoryTime(item.generatedAt);

    const address = document.createElement("span");
    address.className = "history-address";
    address.textContent = formatFullAddress(item);

    const meta = document.createElement("span");
    meta.className = "history-meta";
    meta.textContent = `${item.name || "-"} · ${getSourceLabel(item.source)}`;

    top.append(title, time);
    button.append(top, address, meta);
    button.addEventListener("click", () => renderIdentity(item));
    list.appendChild(button);
  });
}

function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      source: parsed.source || ADDRESS_SOURCE.LOCAL,
      stateMode: parsed.stateMode || "tax-free",
      stateCode: parsed.stateCode || "OR",
      countryCode: parsed.countryCode || "US",
      fallback: parsed.fallback !== false,
      proxyType: parsed.proxyType || "direct",
      proxyHost: parsed.proxyHost || "127.0.0.1",
      proxyPort: parsed.proxyPort || "7890",
      proxyUsername: parsed.proxyUsername || "",
      proxyPassword: "",
    };
  } catch (error) {
    return {
      source: ADDRESS_SOURCE.LOCAL,
      stateMode: "tax-free",
      stateCode: "OR",
      countryCode: "US",
      fallback: true,
      proxyType: "direct",
      proxyHost: "127.0.0.1",
      proxyPort: "7890",
      proxyUsername: "",
      proxyPassword: "",
    };
  }
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

function normalizeRealAddressIdentity(data, expectedStateCode = "") {
  const raw = Array.isArray(data?.addresses) ? data.addresses[0] : null;
  if (!raw || typeof raw !== "object") throw new Error("真实地址接口返回为空");

  const fullName = String(raw.fullName || "John Smith").trim();
  const emailName = fullName
    .replace(/[^a-z0-9]+/gi, ".")
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase();
  const stateName = toTitleCaseText(raw.state);
  const stateCode = STATE_MAP[stateName.toLowerCase()] || stateName;
  const expected = String(expectedStateCode || "")
    .trim()
    .toUpperCase();
  const line1 = [raw.number, raw.street]
    .map((part, index) =>
      index === 0 ? String(part || "").trim() : toTitleCaseText(part),
    )
    .filter(Boolean)
    .join(" ");

  if (!line1 || !raw.city || !raw.zip) {
    throw new Error("真实地址接口返回字段不完整");
  }

  if (expected && stateCode !== expected) {
    throw new Error(
      `真实地址接口返回州不匹配: expected ${expected}, got ${stateCode}`,
    );
  }

  const zip = normalizeZip5(raw.zip);
  const zipStateVerified = isZipInState(zip, stateCode);

  return {
    name: fullName,
    email: `${emailName || "user"}.${Math.floor(Math.random() * 9999)}@gmail.com`,
    phone: normalizePhone(raw.phone),
    line1,
    line2: "",
    city: toTitleCaseText(raw.city),
    state: stateCode,
    zip,
    country: raw.countryCode || raw.country || "US",
    stateName,
    zipStateVerified,
    confidence: zipStateVerified ? "medium" : "low",
    confidenceLabel: zipStateVerified ? "中" : "低",
    confidenceReason: zipStateVerified
      ? "第三方接口返回字段完整，且 ZIP 与州一致"
      : "第三方接口返回字段完整，但 ZIP/州一致性未通过本地校验",
    source: "zhenshidizhi",
  };
}

function normalizeLocalSourceIdentity(raw, expectedStateCode = "") {
  if (!raw || typeof raw !== "object") throw new Error("本地源返回为空");
  if (raw.error) throw new Error(raw.error);
  if (!raw.name || !raw.line1 || !raw.city || !raw.state || !raw.zip) {
    throw new Error("本地源返回字段不完整");
  }

  const resultState = String(raw.state).trim().toUpperCase();
  const expectedState = String(expectedStateCode || "")
    .trim()
    .toUpperCase();
  if (expectedState && resultState !== expectedState) {
    throw new Error(
      `本地源返回州不匹配: expected ${expectedState}, got ${resultState}`,
    );
  }

  const safeName = String(raw.name).trim();
  const emailName = safeName
    .replace(/[^a-z0-9]+/gi, ".")
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase();
  const zip = normalizeZip5(raw.zip);
  const zipStateVerified =
    raw.zipStateVerified === true || isZipInState(zip, resultState);

  return {
    name: safeName,
    email:
      raw.email ||
      `${emailName || "user"}.${Math.floor(Math.random() * 9999)}@gmail.com`,
    phone: normalizePhone(raw.phone, raw.areaCode),
    line1: toTitleCaseText(raw.line1),
    line2: String(raw.line2 || ""),
    city: toTitleCaseText(raw.city),
    state: resultState,
    zip,
    country: String(raw.country || "US").toUpperCase(),
    areaCode: raw.areaCode,
    lat: raw.lat,
    lng: raw.lng,
    stateName: raw.stateName || getStateNameByCode(resultState),
    zipStateVerified,
    zipSource: raw.zipSource || "unknown",
    confidence: raw.confidence || (zipStateVerified ? "high" : "medium"),
    confidenceLabel: raw.confidenceLabel || (zipStateVerified ? "高" : "中"),
    confidenceReason:
      raw.confidenceReason ||
      (zipStateVerified
        ? "本地源返回字段完整，且 ZIP 与州一致"
        : "本地源返回字段完整，但 ZIP/州一致性未通过本地校验"),
    mapVerification: raw.mapVerification || null,
    source: ADDRESS_SOURCE.LOCAL,
  };
}

function normalizeGlobalSourceIdentity(raw, expectedCountryCode = "") {
  if (!raw || typeof raw !== "object") throw new Error("全球地图源返回为空");
  if (raw.error) throw new Error(raw.error);
  if (!raw.name || !raw.line1 || !raw.city || !raw.country) {
    throw new Error("全球地图源返回字段不完整");
  }

  const resultCountryCode = String(raw.countryCode || "")
    .trim()
    .toUpperCase();
  const expected = String(expectedCountryCode || "")
    .trim()
    .toUpperCase();
  if (expected && resultCountryCode && resultCountryCode !== expected) {
    throw new Error(
      `全球地图源返回国家不匹配: expected ${expected}, got ${resultCountryCode}`,
    );
  }

  return {
    name: String(raw.name).trim(),
    email: String(raw.email || "").trim(),
    phone: String(raw.phone || "").trim(),
    line1: toTitleCaseText(raw.line1),
    line2: String(raw.line2 || ""),
    city: toTitleCaseText(raw.city),
    state: toTitleCaseText(raw.state),
    zip: String(raw.zip || "").trim(),
    country: raw.country || getGlobalCountryName(resultCountryCode || expected),
    countryCode: resultCountryCode || expected,
    lat: raw.lat,
    lng: raw.lng,
    stateName: raw.stateName || raw.state || "",
    zipStateVerified: raw.zipStateVerified === true,
    confidence: raw.confidence || "medium",
    confidenceLabel: raw.confidenceLabel || "中",
    confidenceReason:
      raw.confidenceReason || "全球地图源返回街道级地址，并通过基础地图校验",
    mapVerification: raw.mapVerification || null,
    source: ADDRESS_SOURCE.GLOBAL,
  };
}

function saveSettings() {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      source: $("sourceSelect").value,
      stateMode: $("stateModeSelect").value,
      stateCode: $("stateSelect").value,
      countryCode: $("countrySelect").value,
      fallback: $("fallbackCheck").checked,
      proxyType: $("proxyTypeSelect").value,
      proxyHost: $("proxyHostInput").value,
      proxyPort: $("proxyPortInput").value,
      proxyUsername: $("proxyUsernameInput").value,
    }),
  );
}

function getProxyConfigFromUi() {
  const type = String($("proxyTypeSelect").value || "direct")
    .trim()
    .toLowerCase();
  if (!type || type === "direct") return null;

  const host = String($("proxyHostInput").value || "").trim();
  const portText = String($("proxyPortInput").value || "").trim();
  const port = Number(portText);

  if (!host) throw new Error("请先填写代理主机");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("代理端口无效");
  }

  return {
    type,
    host,
    port,
    username: String($("proxyUsernameInput").value || "").trim(),
    password: String($("proxyPasswordInput").value || ""),
  };
}

function buildLocalApiOptions(options = {}) {
  const headers = { ...(options.headers || {}) };
  const proxyConfig = getProxyConfigFromUi();
  if (proxyConfig) {
    headers[PROXY_CONFIG_HEADER] = encodeURIComponent(
      JSON.stringify(proxyConfig),
    );
  }
  return { ...options, headers };
}

function updateProxyVisibility() {
  const type = $("proxyTypeSelect").value;
  const disabled = type === "direct";
  const host = String($("proxyHostInput").value || "").trim();
  const port = String($("proxyPortInput").value || "").trim();
  [
    "proxyHostInput",
    "proxyPortInput",
    "proxyUsernameInput",
    "proxyPasswordInput",
  ].forEach((id) => {
    $(id).disabled = disabled;
  });

  const badge = $("proxyStatusBadge");
  if (disabled) {
    badge.textContent = "直连";
    badge.classList.remove("is-active");
    return;
  }

  const modeLabel = type === "http" ? "HTTP" : "SOCKS5";
  badge.textContent =
    host && port ? `${modeLabel} · ${host}:${port}` : modeLabel;
  badge.classList.add("is-active");
}

function getStateModeLabel() {
  if ($("sourceSelect").value === ADDRESS_SOURCE.GLOBAL) {
    return getGlobalCountryName($("countrySelect").value);
  }
  const mode = $("stateModeSelect").value;
  if (mode === "specific") return `指定州 · ${$("stateSelect").value || "OR"}`;
  if (mode === "mixed") return "混合州";
  return "免税州";
}

function updateSettingsSummary() {
  $("settingsSourceBadge").textContent = getSourceLabel(
    $("sourceSelect").value,
  );
  $("settingsStateBadge").textContent = getStateModeLabel();

  const proxyType = $("proxyTypeSelect").value;
  if (proxyType === "direct") {
    $("settingsProxyBadge").textContent = $("fallbackCheck").checked
      ? "直连 · 自动回退"
      : "直连";
    return;
  }

  const modeLabel = proxyType === "http" ? "HTTP 代理" : "SOCKS5 代理";
  $("settingsProxyBadge").textContent = $("fallbackCheck").checked
    ? `${modeLabel} · 自动回退`
    : modeLabel;
}

function getStateNameByCode(stateCode) {
  const code = String(stateCode || "").toUpperCase();
  const stateName = Object.keys(STATE_MAP).find(
    (name) => STATE_MAP[name] === code,
  );
  return stateName
    ? stateName
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : code;
}

function getGlobalCountryName(countryCode) {
  const code = String(countryCode || "US").toUpperCase();
  return (
    GLOBAL_COUNTRIES.find((country) => country.code === code)?.name || code
  );
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

function normalizeAreaCode(areaCode, fallback = "503") {
  const digits = String(areaCode || "")
    .replace(/\D/g, "")
    .slice(0, 3);
  return /^[2-9]\d{2}$/.test(digits) ? digits : fallback;
}

function makeUsPhone(areaCode) {
  const area = normalizeAreaCode(areaCode);
  const prefix = Math.floor(Math.random() * 800) + 200;
  const line = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0");
  return `(${area}) ${prefix}-${line}`;
}

function normalizePhone(phone, areaCode) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return makeUsPhone(areaCode);
}

function generateDynamicAddress(base) {
  const types = ["Apt", "Unit", "Bldg", "Ste", "Floor", "Suite", "Rm"];
  if (Math.random() > 0.5) {
    return {
      ...base,
      line1: `${base.base}, ${getRandom(types)} ${Math.floor(Math.random() * 900) + 10}`,
    };
  }

  const match = base.base.match(/^(\d+)\s+(.*)/);
  if (match) {
    const newNum = parseInt(match[1], 10) + Math.floor(Math.random() * 50);
    return { ...base, line1: `${newNum} ${match[2]}` };
  }
  return { ...base, line1: base.base };
}

function getCandidateStates() {
  const mode = $("stateModeSelect").value;
  if (mode === "specific") return [$("stateSelect").value || "OR"];
  if (mode === "tax-free") return TAX_FREE_STATES;
  return Object.keys(RESIDENTIAL_DB);
}

function pickStateCode() {
  return getRandom(getCandidateStates());
}

function getFallbackAddressPoint(stateCode, city) {
  const boxes = NOMINATIM_STATE_BOUNDS[stateCode] || NOMINATIM_STATE_BOUNDS.OR;
  const cityName = String(city || "").toLowerCase();
  const box =
    boxes.find((item) => String(item.name || "").toLowerCase() === cityName) ||
    boxes[0];
  return {
    lat: Number(randomBetween(box.lat[0], box.lat[1]).toFixed(7)),
    lng: Number(randomBetween(box.lng[0], box.lng[1]).toFixed(7)),
  };
}

function generateFallbackIdentity(forcedStateCode = "") {
  const stateCode = forcedStateCode || pickStateCode();
  const list = RESIDENTIAL_DB[stateCode] || RESIDENTIAL_DB.OR;
  const targetAddress = getRandom(list);
  const firstName = getRandom(NAMES_DB.first);
  const lastName = getRandom(NAMES_DB.last);
  const point = getFallbackAddressPoint(stateCode, targetAddress.city);

  return {
    name: `${firstName} ${lastName}`,
    email:
      `${firstName}.${lastName}.${Math.floor(Math.random() * 9999)}@gmail.com`.toLowerCase(),
    phone: makeUsPhone(targetAddress.area),
    ...generateDynamicAddress(targetAddress),
    line2: "",
    country: "US",
    stateName: getStateNameByCode(stateCode),
    areaCode: targetAddress.area,
    lat: point.lat,
    lng: point.lng,
    zipStateVerified: isZipInState(targetAddress.zip, stateCode),
    confidence: "low",
    confidenceLabel: "低",
    confidenceReason: "备用本地生成，地址字段来自内置样本和随机拼接",
    source: "original",
  };
}

function getApiStateName(stateCode) {
  const code = String(stateCode || "OR").toUpperCase();
  if (TAX_FREE_STATE_API_MAP[code]) return TAX_FREE_STATE_API_MAP[code];
  const stateName = Object.keys(STATE_MAP).find(
    (name) => STATE_MAP[name] === code,
  );
  return stateName ? stateName.replace(/\s+/g, "") : "oregon";
}

function normalizeApiIdentity(raw, expectedStateCode = "") {
  if (!raw || typeof raw !== "object") throw new Error("地址接口返回为空");
  if (raw.error) throw new Error(raw.error);
  if (!raw.name || !raw.street || !raw.city || !raw.state || !raw.zip) {
    throw new Error("地址接口返回字段不完整");
  }

  const resultState = String(raw.state).trim().toUpperCase();
  const expectedState = String(expectedStateCode || "")
    .trim()
    .toUpperCase();
  if (expectedState && resultState !== expectedState) {
    throw new Error(
      `地址接口返回州不匹配: expected ${expectedState}, got ${resultState}`,
    );
  }

  const safeName = String(raw.name).trim();
  const emailName = safeName
    .replace(/[^a-z0-9]+/gi, ".")
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase();
  const zip = normalizeZip5(
    raw.zip,
    getRandom(RESIDENTIAL_DB[resultState] || RESIDENTIAL_DB.OR).zip,
  );
  const zipStateVerified = isZipInState(zip, resultState);

  return {
    name: safeName,
    email: `${emailName || "user"}.${Math.floor(Math.random() * 9999)}@gmail.com`,
    phone: normalizePhone(raw.phone, raw.areaCode),
    line1: toTitleCaseText(raw.street),
    line2: "",
    city: toTitleCaseText(raw.city),
    state: resultState,
    zip,
    country: "US",
    area: raw.area,
    areaCode: raw.areaCode,
    stateName: raw.stateName || getStateNameByCode(resultState),
    zipStateVerified,
    confidence: zipStateVerified ? "medium" : "low",
    confidenceLabel: zipStateVerified ? "中" : "低",
    confidenceReason: zipStateVerified
      ? "第三方地址源返回字段完整，且 ZIP 与州一致"
      : "第三方地址源返回字段完整，但 ZIP/州一致性未通过本地校验",
    source: "fakeaddressgenerator",
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.clone().json();
      } catch (error) {}
      throw new Error(
        errorData?.error || errorData?.message || `HTTP ${response.status}`,
      );
    }
    return await response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("请求超时");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function getLocalApiUrl(path) {
  if (location.protocol === "file:") throw new Error(LOCAL_SERVER_HINT);
  return path;
}

async function fetchIdentityFromFakeAddressApi() {
  const stateCode = pickStateCode();
  const apiState = getApiStateName(stateCode);
  const data = await fetchWithTimeout(
    getLocalApiUrl("/api/fake-address"),
    buildLocalApiOptions({
      method: "POST",
      headers: {
        accept: "application/json,text/plain,*/*",
        "content-type": "application/json",
      },
      body: JSON.stringify({ state: apiState }),
    }),
    7000,
  );
  return normalizeApiIdentity(data, stateCode);
}

async function fetchIdentityFromRealAddressApi() {
  const stateCode = pickStateCode();
  const stateName = getStateNameByCode(stateCode);
  const params = new URLSearchParams({ state: stateName });
  const data = await fetchWithTimeout(
    getLocalApiUrl(`/api/real-address?${params.toString()}`),
    buildLocalApiOptions({ headers: { accept: "application/json" } }),
    7000,
  );
  return normalizeRealAddressIdentity(data, stateCode);
}

async function fetchIdentityFromLocalSource() {
  const stateCode = pickStateCode();
  const params = new URLSearchParams({ state: stateCode });
  const data = await fetchWithTimeout(
    getLocalApiUrl(`/api/local-address?${params.toString()}`),
    buildLocalApiOptions({ headers: { accept: "application/json" } }),
    8500,
  );
  return normalizeLocalSourceIdentity(data, stateCode);
}

async function fetchIdentityFromGlobalSource() {
  const countryCode = String($("countrySelect").value || "US").toUpperCase();
  const params = new URLSearchParams({ country: countryCode });
  const data = await fetchWithTimeout(
    getLocalApiUrl(`/api/global-address?${params.toString()}`),
    buildLocalApiOptions({ headers: { accept: "application/json" } }),
    12000,
  );
  return normalizeGlobalSourceIdentity(data, countryCode);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pickNominatimStateCode() {
  const candidates = getCandidateStates().filter(
    (code) => NOMINATIM_STATE_BOUNDS[code]?.length,
  );
  return getRandom(candidates.length ? candidates : TAX_FREE_STATES);
}

function pickNominatimPoint(stateCode) {
  const boxes = NOMINATIM_STATE_BOUNDS[stateCode] || NOMINATIM_STATE_BOUNDS.OR;
  const box = getRandom(boxes);
  return {
    state: stateCode,
    cityHint: box.name,
    areaCode: box.area,
    lat: Number(randomBetween(box.lat[0], box.lat[1]).toFixed(7)),
    lng: Number(randomBetween(box.lng[0], box.lng[1]).toFixed(7)),
  };
}

function getNominatimAddressPart(address, keys) {
  for (const key of keys) {
    const value = address?.[key];
    if (value !== undefined && value !== null && String(value).trim())
      return String(value).trim();
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
  return STATE_MAP[rawState.toLowerCase()] || "";
}

function normalizeNominatimIdentity(raw, expectedStateCode = "", point = null) {
  if (!raw || typeof raw !== "object") throw new Error("Nominatim 返回为空");
  if (raw.error) throw new Error(raw.error);

  const address = raw.address || {};
  const countryCode = String(address.country_code || "")
    .trim()
    .toUpperCase();
  if (countryCode && countryCode !== "US")
    throw new Error(`Nominatim 返回非美国地址: ${countryCode}`);

  const resultState = normalizeNominatimStateCode(address);
  const expectedState = String(expectedStateCode || "")
    .trim()
    .toUpperCase();
  if (expectedState && resultState && resultState !== expectedState) {
    throw new Error(
      `Nominatim 返回州不匹配: expected ${expectedState}, got ${resultState}`,
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
  if (!road) throw new Error("Nominatim 缺少街道字段");

  const rawHouseNumber = getNominatimAddressPart(address, ["house_number"]);
  const houseNumber =
    rawHouseNumber || String(Math.floor(Math.random() * 8999) + 100);
  const city =
    toTitleCaseText(
      getNominatimAddressPart(address, [
        "city",
        "town",
        "village",
        "municipality",
        "hamlet",
        "suburb",
        "county",
      ]),
    ) ||
    point?.cityHint ||
    "Portland";
  const rawZip = normalizeZip5(address.postcode, "");
  if (rawZip && !isZipInState(rawZip, finalState)) {
    throw new Error(`Nominatim 返回 ZIP 与州不匹配: ${rawZip} / ${finalState}`);
  }
  const zip =
    rawZip || getRandom(RESIDENTIAL_DB[finalState] || RESIDENTIAL_DB.OR).zip;
  const zipStateVerified = isZipInState(zip, finalState);
  if (!zipStateVerified) {
    throw new Error(
      `Nominatim ZIP 无法通过州一致性校验: ${zip} / ${finalState}`,
    );
  }
  const confidence = rawHouseNumber && rawZip ? "high" : "medium";
  const confidenceLabel = rawHouseNumber && rawZip ? "高" : "中";
  const confidenceReason =
    rawHouseNumber && rawZip
      ? "地图反查含门牌、街道、城市，且 ZIP 与州一致"
      : "地图反查含街道和城市，部分字段使用备用值且 ZIP 与州一致";
  const firstName = getRandom(NAMES_DB.first);
  const lastName = getRandom(NAMES_DB.last);
  const areaCode =
    point?.areaCode ||
    getRandom(RESIDENTIAL_DB[finalState] || RESIDENTIAL_DB.OR).area;

  return {
    name: `${firstName} ${lastName}`,
    email:
      `${firstName}.${lastName}.${Math.floor(Math.random() * 9999)}@gmail.com`.toLowerCase(),
    phone: makeUsPhone(areaCode),
    line1: `${houseNumber} ${toTitleCaseText(road)}`,
    line2: "",
    city,
    state: finalState,
    zip,
    country: "US",
    lat: point?.lat ?? raw.lat,
    lng: point?.lng ?? raw.lon,
    stateName: getStateNameByCode(finalState),
    zipStateVerified,
    zipSource: rawZip ? "nominatim" : "fallback",
    confidence,
    confidenceLabel,
    confidenceReason,
    source: "nominatim",
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

function buildNominatimProxyUrl(point) {
  const params = new URLSearchParams({
    lat: String(point.lat),
    lon: String(point.lng),
  });
  return getLocalApiUrl(`/api/nominatim-reverse?${params.toString()}`);
}

async function fetchIdentityFromNominatim() {
  const stateCode = pickNominatimStateCode();
  let lastError = null;

  for (let attempt = 1; attempt <= 6; attempt++) {
    const point = pickNominatimPoint(stateCode);
    try {
      const data = await fetchWithTimeout(
        buildNominatimProxyUrl(point),
        buildLocalApiOptions({ headers: { accept: "application/json" } }),
        7500,
      );
      return normalizeNominatimIdentity(data, stateCode, point);
    } catch (error) {
      lastError = error;
      await sleep(220);
    }
  }

  throw lastError || new Error("Nominatim 未返回可用地址");
}

async function generateIdentity() {
  const source = $("sourceSelect").value;
  if (source === ADDRESS_SOURCE.ORIGINAL) return generateFallbackIdentity();

  try {
    if (source === ADDRESS_SOURCE.LOCAL)
      return await fetchIdentityFromLocalSource();
    if (source === ADDRESS_SOURCE.REAL)
      return await fetchIdentityFromRealAddressApi();
    if (source === ADDRESS_SOURCE.FAKE)
      return await fetchIdentityFromFakeAddressApi();
    if (source === ADDRESS_SOURCE.NOMINATIM)
      return await fetchIdentityFromNominatim();
    if (source === ADDRESS_SOURCE.GLOBAL)
      return await fetchIdentityFromGlobalSource();
    return generateFallbackIdentity();
  } catch (error) {
    if (!$("fallbackCheck").checked) throw error;
    const id = generateFallbackIdentity();
    id.fallbackSource = source;
    id.fallbackError = error.message || String(error);
    return id;
  }
}

function getSourceLabel(source) {
  const raw = String(source || "")
    .trim()
    .toLowerCase();
  if (source === ADDRESS_SOURCE.LOCAL || raw.startsWith("local"))
    return "本地源";
  if (
    source === ADDRESS_SOURCE.REAL ||
    raw.startsWith("real") ||
    raw.includes("zhenshidizhi")
  )
    return "真实地址接口";
  if (source === ADDRESS_SOURCE.ORIGINAL || raw.startsWith("original"))
    return "原始本地逻辑";
  if (
    source === ADDRESS_SOURCE.FAKE ||
    raw.startsWith("fake") ||
    raw.includes("fakeaddressgenerator")
  )
    return "fakeaddressgenerator";
  if (source === ADDRESS_SOURCE.NOMINATIM || raw.startsWith("nominatim"))
    return "Nominatim Reverse";
  if (source === ADDRESS_SOURCE.GLOBAL || raw.startsWith("global"))
    return "全球地图源";
  return String(source || "未知来源");
}

function getFallbackNotice(identity) {
  if (!identity?.fallbackSource) return "";
  const reason = String(identity.fallbackError || "").trim();
  const prefix = `${getSourceLabel(identity.fallbackSource)}不可用，已回退到原始本地逻辑`;
  return reason ? `${prefix}：${reason}` : prefix;
}

function getSourceSiteUrl(source) {
  const raw = String(source || "")
    .trim()
    .toLowerCase();
  if (!raw) return "";
  if (raw.startsWith("local")) {
    return SOURCE_SITE_URLS.local;
  }
  if (raw.startsWith("real") || raw.includes("zhenshidizhi")) {
    return SOURCE_SITE_URLS.real;
  }
  if (raw.startsWith("fake") || raw.includes("fakeaddressgenerator")) {
    return SOURCE_SITE_URLS.fake;
  }
  if (raw.startsWith("nominatim")) {
    return SOURCE_SITE_URLS.nominatim;
  }
  if (raw.startsWith("global")) {
    return SOURCE_SITE_URLS.global;
  }
  return "";
}

function getMapVerifyUrl(identity) {
  if (!identity) return "";
  const query = formatFullAddress(identity);
  if (query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }
  const lat = Number(identity.lat);
  const lng = Number(identity.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  }
  return "";
}

function getOpenStreetMapEmbedUrl(identity) {
  if (!identity) return "";
  const lat = Number(identity.lat);
  const lng = Number(identity.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
  const delta = 0.0018;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta]
    .map((value) => value.toFixed(6))
    .join(",");
  const params = new URLSearchParams({
    bbox,
    layer: "mapnik",
    marker: `${lat.toFixed(6)},${lng.toFixed(6)}`,
  });
  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

function updateSourceButton(source) {
  const button = $("openSourceBtn");
  if (!button) return;
  const url = getSourceSiteUrl(source);
  button.disabled = !url;
  button.dataset.url = url;
  button.textContent = url ? "打开源站" : "无源站";
}

function updateMapButton(identity) {
  const button = $("openMapBtn");
  if (!button) return;
  const url = getMapVerifyUrl(identity);
  button.disabled = !url;
  button.dataset.url = url;
}

function updateMapPreview(identity) {
  const frame = $("mapFrame");
  const placeholder = $("mapPlaceholder");
  const status = $("mapStatusBadge");
  const button = $("openMapPreviewBtn");
  if (!frame || !placeholder || !status || !button) return;

  const embedUrl = getOpenStreetMapEmbedUrl(identity);
  const mapUrl = getMapVerifyUrl(identity);
  const hasMap = Boolean(embedUrl);

  frame.src = hasMap ? embedUrl : "about:blank";
  frame.classList.toggle("is-ready", hasMap);
  placeholder.classList.toggle("is-hidden", hasMap);
  status.textContent = hasMap ? getMapVerificationText(identity) : "等待生成";
  button.disabled = !mapUrl;
  button.dataset.url = mapUrl;
}

function formatFullAddress(id) {
  if (isEastAsianCountry(id.countryCode)) {
    return [
      getCountryDisplayName(id.country),
      id.state,
      id.city,
      id.line1,
      id.zip,
    ]
      .filter(Boolean)
      .join(" ");
  }
  const cityStateZip = formatCityStateZip(id);
  return [id.line1, id.line2, cityStateZip, getCountryDisplayName(id.country)]
    .filter(Boolean)
    .join(", ");
}

function isEastAsianCountry(countryCode) {
  return ["CN", "JP", "KR"].includes(String(countryCode || "").toUpperCase());
}

function formatCityStateZip(id) {
  return [id.city, [id.state, id.zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

function getCountryDisplayName(country) {
  const value = String(country || "")
    .trim()
    .toUpperCase();
  return value === "US" || value === "USA" ? "United States" : country;
}

function toCopyText(id) {
  if (isEastAsianCountry(id.countryCode)) {
    return [id.name, id.email, id.phone, formatFullAddress(id)]
      .filter(Boolean)
      .join("\n");
  }
  return [
    id.name,
    id.email,
    id.phone,
    id.line1,
    id.line2,
    formatCityStateZip(id),
    getCountryDisplayName(id.country),
  ]
    .filter(Boolean)
    .join("\n");
}

function getFieldCopyValue(key, id) {
  if (!id) return "";
  const values = {
    fullAddress: formatFullAddress(id),
    name: id.name,
    email: id.email,
    phone: id.phone,
    line1: id.line1,
    city: id.city,
    state: id.state,
    zip: id.zip,
    confidence: getConfidenceText(id),
  };
  return String(values[key] || "").trim();
}

async function copyFieldValue(key) {
  const value = getFieldCopyValue(key, state.currentIdentity);
  if (!value || value === "-") return;
  await copyText(value);
}

function setText(id, value) {
  $(id).textContent = value || "-";
}

function getConfidenceText(id) {
  if (!id) return "-";
  const label = id.confidenceLabel || "未评估";
  if (id.source === ADDRESS_SOURCE.GLOBAL) {
    return `${label} · 街道级地图校验`;
  }
  const zipText = id.zipStateVerified ? "ZIP/州一致" : "ZIP/州未验证";
  return `${label} · ${zipText}`;
}

function getMapVerificationText(id) {
  if (!id) return "-";
  const verification = id.mapVerification || {};
  const checks = [];
  if (verification.streetLevel) checks.push("街道级");
  if (verification.waterFiltered) checks.push("非水域");
  if (verification.coarseFiltered) checks.push("非粗粒度");
  if (Number.isFinite(Number(verification.distanceMeters))) {
    checks.push(`偏移 ${Number(verification.distanceMeters)}m`);
  }
  if (verification.snapped) checks.push("已吸附到反查坐标");
  const lat = Number(id.lat);
  const lng = Number(id.lng);
  const location =
    Number.isFinite(lat) && Number.isFinite(lng)
      ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      : "";
  return [checks.length ? checks.join(" · ") : id.confidenceReason, location]
    .filter(Boolean)
    .join(" · ");
}

function setConfidence(id) {
  const element = $("confidenceValue");
  element.textContent = getConfidenceText(id);
  element.title = id?.confidenceReason || "";
}

function renderIdentity(id) {
  state.currentIdentity = id;
  setText("sourceBadge", getSourceLabel(id.source));
  updateSourceButton(id.source);
  updateMapButton(id);
  updateMapPreview(id);
  setText("fullAddress", formatFullAddress(id));
  setText("nameValue", id.name);
  setText("emailValue", id.email);
  setText("phoneValue", id.phone);
  setText("line1Value", id.line1);
  setText("cityValue", id.city);
  setText(
    "stateValue",
    `${id.state}${id.stateName ? ` / ${id.stateName}` : ""}`,
  );
  setText("zipValue", id.zip);
  setText("mapVerifyValue", getMapVerificationText(id));
  setConfidence(id);
  $("copyAddressBtn").disabled = false;
  $("copyJsonBtn").disabled = false;
}

function setBusy(isBusy) {
  state.isBusy = isBusy;
  $("generateBtn").disabled = isBusy;
  $("generateBtn").textContent = isBusy ? "生成中..." : "生成随机地址";
}

function showToast(message, isError = false) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
  showToast("已复制");
}

async function handleGenerate() {
  if (state.isBusy) return;
  setBusy(true);
  saveSettings();
  try {
    const id = await generateIdentity();
    renderIdentity(id);
    addToHistory(id);
    const fallbackNotice = getFallbackNotice(id);
    if (fallbackNotice && fallbackNotice !== state.lastFallbackNotice) {
      showToast(fallbackNotice, true);
    }
    state.lastFallbackNotice = fallbackNotice;
  } catch (error) {
    state.lastFallbackNotice = "";
    showToast(error.message || String(error), true);
  } finally {
    setBusy(false);
  }
}

function populateStates() {
  const select = $("stateSelect");
  Object.keys(RESIDENTIAL_DB).forEach((code) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} - ${getStateNameByCode(code)}`;
    select.appendChild(option);
  });
}

function populateCountries() {
  const select = $("countrySelect");
  GLOBAL_COUNTRIES.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.code;
    option.textContent = `${country.code} - ${country.name}`;
    select.appendChild(option);
  });
}

function updateStateVisibility() {
  const isGlobal = $("sourceSelect").value === ADDRESS_SOURCE.GLOBAL;
  $("countryWrap").classList.toggle("is-hidden", !isGlobal);
  $("stateModeWrap").classList.toggle("is-hidden", isGlobal);
  $("stateWrap").classList.toggle(
    "is-hidden",
    isGlobal || $("stateModeSelect").value !== "specific",
  );
}

function init() {
  state.history = loadHistory();
  populateStates();
  populateCountries();
  const settings = loadSettings();
  $("sourceSelect").value = settings.source;
  $("stateModeSelect").value = settings.stateMode;
  $("stateSelect").value = settings.stateCode;
  $("countrySelect").value = settings.countryCode;
  $("fallbackCheck").checked = settings.fallback;
  $("proxyTypeSelect").value = settings.proxyType;
  $("proxyHostInput").value = settings.proxyHost;
  $("proxyPortInput").value = settings.proxyPort;
  $("proxyUsernameInput").value = settings.proxyUsername;
  $("proxyPasswordInput").value = settings.proxyPassword;
  updateStateVisibility();
  updateProxyVisibility();
  updateSettingsSummary();

  $("generateBtn").addEventListener("click", handleGenerate);
  $("openMapBtn").addEventListener("click", () => {
    const url = $("openMapBtn").dataset.url;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  });
  $("openMapPreviewBtn").addEventListener("click", () => {
    const url = $("openMapPreviewBtn").dataset.url;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  });
  $("openSourceBtn").addEventListener("click", () => {
    const url = $("openSourceBtn").dataset.url;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  });
  $("clearHistoryBtn").addEventListener("click", () => {
    state.history = [];
    saveHistory();
    renderHistory();
  });
  $("copyAddressBtn").addEventListener("click", () => {
    if (state.currentIdentity) copyText(toCopyText(state.currentIdentity));
  });
  $("copyJsonBtn").addEventListener("click", () => {
    if (state.currentIdentity)
      copyText(JSON.stringify(state.currentIdentity, null, 2));
  });
  document
    .querySelectorAll(".copyable-field[data-copy-key]")
    .forEach((field) => {
      field.addEventListener("click", () =>
        copyFieldValue(field.dataset.copyKey),
      );
      field.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        copyFieldValue(field.dataset.copyKey);
      });
    });
  [
    "sourceSelect",
    "countrySelect",
    "stateModeSelect",
    "stateSelect",
    "fallbackCheck",
    "proxyTypeSelect",
    "proxyHostInput",
    "proxyPortInput",
    "proxyUsernameInput",
    "proxyPasswordInput",
  ].forEach((id) => {
    const eventName =
      id.endsWith("Select") || id === "fallbackCheck" ? "change" : "input";
    $(id).addEventListener(eventName, () => {
      state.lastFallbackNotice = "";
      updateStateVisibility();
      updateProxyVisibility();
      updateSettingsSummary();
      saveSettings();
    });
  });
  updateSourceButton("");
  updateMapButton(null);
  renderHistory();
}

init();
