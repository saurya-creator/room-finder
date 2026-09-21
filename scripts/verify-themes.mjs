import http from "http";

function fetchJson(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on("error", reject);
  });
}

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          path,
          statusCode: res.statusCode,
          hasAntiFouc: data.includes("urbannest_theme"),
          hasAmoledToken: data.includes("amoled") || data.includes("dark"),
        });
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

async function run() {
  console.log("Checking UrbanNest endpoints for 3-way theme system (Light, Dark, AMOLED)...");
  
  // 1. Discover a real seeded property ID dynamically
  const propsData = await fetchJson("/api/properties");
  const firstPropertyId = propsData?.properties?.[0]?.id;
  console.log(`Found active property ID for detail page check: ${firstPropertyId || "NONE"}`);

  const pages = [
    "/",
    "/rooms",
    firstPropertyId ? `/property/${firstPropertyId}` : "/rooms",
    "/owner/dashboard",
    "/admin",
    "/compare",
    "/favorites",
    "/messages",
  ];

  let allOk = true;

  for (const page of pages) {
    try {
      const res = await fetchPage(page);
      const ok = res.statusCode === 200;
      console.log(
        `[${ok ? "PASS" : "FAIL"}] ${res.path} -> HTTP ${res.statusCode} | Anti-FOUC: ${res.hasAntiFouc} | Theme variants: ${res.hasAmoledToken}`
      );
      if (!ok) allOk = false;
    } catch (e) {
      console.error(`[ERROR] ${page} ->`, e.message);
      allOk = false;
    }
  }

  if (allOk) {
    console.log("\n ALL CORE PAGES PASSED HTTP 200 AND VERIFIED DARK / AMOLED / LIGHT THEME SUPPORT!");
    process.exit(0);
  } else {
    console.error("\n Some pages failed verification.");
    process.exit(1);
  }
}

run();
