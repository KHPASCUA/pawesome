const { chromium } = require("./frontend/node_modules/playwright");
const fs = require("fs");
const path = require("path");

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://127.0.0.1:8000/api";
const OUT_DIR = path.join(__dirname, "frontend", "test-results", "browser-visual-pass");

const accounts = {
  customer: "customer@example.com",
  receptionist: "receptionist@example.com",
  cashier: "cashier@example.com",
  inventory: "inventory@example.com",
  veterinary: "vet@example.com",
  manager: "manager@example.com",
  admin: "admin@example.com",
};

const passwords = ["Password123!", "password123", "password"];

const viewports = [
  { name: "desktop", width: 1440, height: 950 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
];

const pagesByRole = {
  customer: [
    ["/customer/requests", "My Requests"],
    ["/customer/payments", "Payment History"],
    ["/customer/pets", "My Pets"],
  ],
  receptionist: [
    ["/receptionist/dashboard", "Receptionist Dashboard"],
    ["/receptionist/approvals", "Pending Approvals"],
    ["/receptionist/bookings", "Bookings"],
  ],
  cashier: [
    ["/cashier/pos", "POS"],
    ["/cashier/payment-verification", "Payment Verification"],
    ["/cashier/transactions", "Transactions"],
  ],
  inventory: [
    ["/inventory", "Inventory List"],
    ["/inventory/stock", "Stock"],
    ["/inventory/history", "Stock Logs"],
    ["/inventory/reports", "Low Stock/Reports"],
  ],
  veterinary: [
    ["/veterinary/appointments", "Appointments"],
    ["/veterinary/services", "Services"],
  ],
  manager: [
    ["/manager", "Manager Dashboard"],
    ["/manager/reports", "Reports"],
  ],
  admin: [
    ["/admin", "Admin Reports"],
    ["/admin/users", "Users"],
    ["/admin/chatbot", "Chatbot Logs"],
  ],
};

const removedFeaturePatterns = [
  /\bgender\b/i,
  /\badd-?ons?\b/i,
  /\badd ons?\b/i,
  /\btelegram\b/i,
  /\bexpiry\b/i,
  /\bexpiration\b/i,
  /\bstock value\b/i,
  /\binventory value\b/i,
  /\bheld\b/i,
  /\bhold cart\b/i,
  /\bhold transaction\b/i,
  /\bresume held\b/i,
];

const chatbotPrompts = {
  customer: "status ng request ko",
  cashier: "may pending payments ba",
  inventory: "low stock",
  veterinary: "appointments today",
};

const isIgnorableBrowserNoise = (entry = "") =>
  /fonts\.googleapis\.com|fonts\.gstatic\.com|ERR_NETWORK_ACCESS_DENIED|net::ERR_BLOCKED_BY_CLIENT/i.test(entry);

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  return { ok: response.ok, status: response.status, data, text };
}

async function login(role) {
  let last = null;
  for (const password of passwords) {
    const result = await requestJson(`${API_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ login: accounts[role], password }),
    });
    last = result;
    if (result.ok) return result.data;
  }
  throw new Error(`Login failed for ${role}: ${last?.status} ${last?.text}`);
}

async function seedAuth(page, auth) {
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role);
    localStorage.setItem("name", user.name || user.username || user.email);
    localStorage.setItem("username", user.username || user.email);
    localStorage.setItem("email", user.email);
    localStorage.setItem("user", JSON.stringify(user));
  }, auth);
}

async function collectPageState(page) {
  return page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const overflowX = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - viewportWidth;
    const visibleText = document.body.innerText || "";
    const wideElements = [...document.body.querySelectorAll("*")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className : "",
          text: (element.innerText || element.textContent || "").trim().slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          display: style.display,
          position: style.position,
        };
      })
      .filter((item) => item.display !== "none" && item.width > 0 && (item.right > viewportWidth + 12 || item.left < -12))
      .slice(0, 8);
    return { overflowX, visibleText, wideElements };
  });
}

async function maybeTestChatbot(page, role) {
  const prompt = chatbotPrompts[role];
  if (!prompt) return { skipped: true };

  const buttons = await page.locator("button").allTextContents().catch(() => []);
  const text = buttons.join(" ");
  const hasChatButton = /chat|assistant|bot|help/i.test(text);
  if (!hasChatButton) {
    return { skipped: true, reason: "No obvious chatbot button on this page." };
  }

  const candidates = page.locator("button").filter({ hasText: /chat|assistant|bot|help/i });
  const count = await candidates.count();
  if (count < 1) return { skipped: true, reason: "Chatbot trigger not locatable." };
  await candidates.first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(800);

  const input = page.locator("textarea, input[type='text']").last();
  if (!(await input.count())) return { skipped: true, reason: "Chatbot input not found after opening." };
  await input.fill(prompt);
  await input.press("Enter");
  await page.waitForTimeout(2500);
  return { skipped: false, prompt };
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = {
    appUrl: APP_URL,
    apiUrl: API_URL,
    startedAt: new Date().toISOString(),
    results: [],
  };

  const authByRole = {};
  for (const role of Object.keys(pagesByRole)) {
    authByRole[role] = await login(role);
  }

  for (const viewport of viewports) {
    for (const [role, pages] of Object.entries(pagesByRole)) {
      for (const [route, label] of pages) {
        const context = await browser.newContext({ viewport });
        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        const failedRequests = [];
        const badResponses = [];

        page.on("console", (message) => {
          if (message.type() === "error") consoleErrors.push(message.text());
        });
        page.on("pageerror", (error) => pageErrors.push(error.message));
        page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ""}`));
        page.on("response", (response) => {
          const status = response.status();
          const url = response.url();
          if (status >= 400 && !url.includes("sockjs-node") && !url.includes("hot-update")) {
            badResponses.push(`${status} ${url}`);
          }
        });

        await seedAuth(page, authByRole[role]);
        const url = `${APP_URL}${route}`;
        let state = null;
        let screenshot = null;
        let navigationError = null;

        try {
          await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
          await page.waitForTimeout(1200);
          state = await collectPageState(page);
          screenshot = path.join(OUT_DIR, `${viewport.name}-${role}-${route.replace(/\W+/g, "-")}.png`);
          await page.screenshot({ path: screenshot, fullPage: true });
        } catch (error) {
          navigationError = error.message;
        }

        const visibleText = state?.visibleText || "";
        const removedMatches = removedFeaturePatterns
          .filter((pattern) => pattern.test(visibleText))
          .map((pattern) => pattern.source);

        let chatbot = { skipped: true };
        if (viewport.name === "desktop" && ["/customer/requests", "/cashier/pos", "/inventory", "/veterinary/appointments"].includes(route)) {
          try {
            chatbot = await maybeTestChatbot(page, role);
          } catch (error) {
            chatbot = { skipped: false, error: error.message };
          }
        }

        report.results.push({
          viewport: viewport.name,
          role,
          route,
          label,
          url,
          navigationError,
          consoleErrors,
          pageErrors,
          failedRequests,
          badResponses,
          overflowX: state?.overflowX ?? null,
          wideElements: state?.wideElements || [],
          removedMatches,
          chatbot,
          screenshot,
        });

        await context.close();
      }
    }
  }

  await browser.close();
  report.finishedAt = new Date().toISOString();
  const outFile = path.join(OUT_DIR, "browser-visual-pass.json");
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

  const failures = report.results.filter((item) => {
    const appConsoleErrors = item.consoleErrors.filter((entry) => !isIgnorableBrowserNoise(entry));
    const appFailedRequests = item.failedRequests.filter((entry) => !isIgnorableBrowserNoise(entry));
    const appBadResponses = item.badResponses.filter((entry) => !entry.includes("/notifications") && !isIgnorableBrowserNoise(entry));

    return item.navigationError ||
      item.pageErrors.length ||
      appConsoleErrors.length ||
      appFailedRequests.length ||
      appBadResponses.length ||
      item.overflowX > 16 ||
      item.removedMatches.length ||
      item.chatbot.error;
  });

  console.log(`Browser visual pass wrote ${outFile}`);
  console.log(`Checked ${report.results.length} page/viewport combinations.`);
  console.log(`Flagged ${failures.length} combinations for review.`);
  for (const item of failures.slice(0, 60)) {
    const appConsoleErrors = item.consoleErrors.filter((entry) => !isIgnorableBrowserNoise(entry));
    const appFailedRequests = item.failedRequests.filter((entry) => !isIgnorableBrowserNoise(entry));
    const appBadResponses = item.badResponses.filter((entry) => !entry.includes("/notifications") && !isIgnorableBrowserNoise(entry));
    console.log(`${item.viewport} ${item.role} ${item.route}: nav=${item.navigationError || "ok"} overflow=${item.overflowX} console=${appConsoleErrors.length} failed=${appFailedRequests.length} page=${item.pageErrors.length} bad=${appBadResponses.length} removed=${item.removedMatches.join(",") || "none"} chat=${item.chatbot.error || "ok"}`);
  }
})();
