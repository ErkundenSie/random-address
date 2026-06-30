const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;
const FAKE_ADDRESS_API_URL = "https://fakeaddressgenerator.click/api/generate";
const NOMINATIM_REVERSE_API_URL = "https://nominatim.openstreetmap.org/reverse";
const REAL_ADDRESS_API_URL =
  "https://www.zhenshidizhi.com/api/addresses/random?country=US&count=1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

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

async function fetchJson(url, options, timeoutMs = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      throw new Error(`接口返回不是 JSON：${text.slice(0, 120)}`);
    }
    if (!response.ok) {
      throw new Error(
        data?.error || data?.message || `HTTP ${response.status}`,
      );
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function handleFakeAddress(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  try {
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
    );
    sendJson(res, 200, data);
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

    const data = await fetchJson(`${NOMINATIM_REVERSE_API_URL}?${params}`, {
      method: "GET",
      headers: {
        accept: "application/json,text/plain,*/*",
        "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
        referer: "https://nominatim.openstreetmap.org/ui/reverse.html",
        "user-agent": "random-address-generator-local/1.0",
      },
    });
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
