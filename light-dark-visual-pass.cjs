const { chromium } = require("./frontend/node_modules/playwright");
const fs = require("fs");
const path = require("path");

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://127.0.0.1:8000/api";
const OUT_DIR = path.join(__dirname, "frontend", "test-results", "light-dark-visual-pass");

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
const themes = ["light", "dark"];

const viewports = [
  { name: "desktop", width: 1440, height: 950 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
];

const pagesByRole = {
  customer: [
    ["/customer", "Customer Dashboard"],
    ["/customer/requests", "My Requests"],
    ["/customer/payments", "Payment History"],
    ["/customer/pets", "My Pets"],
  ],
  receptionist: [
    ["/receptionist/dashboard", "Pending Requests"],
    ["/receptionist/approvals", "Approvals"],
    ["/receptionist/bookings", "Bookings"],
  ],
  cashier: [
    ["/cashier/pos", "POS"],
    ["/cashier/payment-verification", "Payment Verification"],
    ["/cashier/transactions", "Transactions"],
  ],
  inventory: [
    ["/inventory", "Inventory Dashboard"],
    ["/inventory/stock", "Inventory List"],
    ["/inventory/history", "Stock Logs"],
    ["/inventory/reports", "Low Stock Reports"],
  ],
  veterinary: [
    ["/veterinary/appointments", "Appointments"],
    ["/veterinary/services", "Veterinary Services"],
  ],
  manager: [
    ["/manager", "Manager Dashboard"],
    ["/manager/reports", "Manager Reports"],
  ],
  admin: [
    ["/admin", "Admin Dashboard"],
    ["/admin/users", "Users"],
    ["/admin/chatbot", "Logs"],
  ],
};

const chatbotPrompts = {
  customer: "status ng request ko",
  cashier: "may pending payments ba",
  inventory: "low stock",
  veterinary: "appointments today",
};

const isIgnorableBrowserNoise = (entry = "") =>
  /fonts\.googleapis\.com|fonts\.gstatic\.com|ERR_NETWORK_ACCESS_DENIED|net::ERR_BLOCKED_BY_CLIENT|sockjs-node|hot-update/i.test(entry);

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
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

async function seedAuthAndTheme(page, auth, theme) {
  await page.addInitScript(({ token, user, theme }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role);
    localStorage.setItem("name", user.name || user.username || user.email);
    localStorage.setItem("username", user.username || user.email);
    localStorage.setItem("email", user.email);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("theme", theme);
    if (document.documentElement) {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.classList.remove("dark", "dark-mode", "dark-theme", "night-mode");
    }
    if (document.body) {
      document.body.removeAttribute("data-theme");
      document.body.classList.remove("dark", "dark-mode", "dark-theme", "night-mode");
    }
  }, { ...auth, theme });
}

async function collectPageState(page) {
  return page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const overflowX = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - viewportWidth;
    const visibleText = document.body.innerText || "";
    const actualTheme = document.documentElement.getAttribute("data-theme");
    const bodyTheme = document.body.getAttribute("data-theme");
    const legacyDarkClasses = [
      document.body.classList.contains("dark"),
      document.body.classList.contains("dark-mode"),
      document.documentElement.classList.contains("dark"),
      document.documentElement.classList.contains("dark-mode"),
    ].some(Boolean);

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

    return { overflowX, visibleText, wideElements, actualTheme, bodyTheme, legacyDarkClasses };
  });
}

async function maybeTestChatbot(page, role) {
  const prompt = chatbotPrompts[role];
  if (!prompt) return { skipped: true };

  const buttons = await page.locator("button").allTextContents().catch(() => []);
  const hasChatButton = /chat|assistant|bot|help/i.test(buttons.join(" "));
  if (!hasChatButton) return { skipped: true, reason: "No obvious chatbot button on this page." };

  const candidates = page.locator("button").filter({ hasText: /chat|assistant|bot|help/i });
  if ((await candidates.count()) < 1) return { skipped: true, reason: "Chatbot trigger not locatable." };

  await candidates.first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(700);
  const input = page.locator("textarea, input[type='text']").last();
  if (!(await input.count())) return { skipped: true, reason: "Chatbot input not found after opening." };

  await input.fill(prompt);
  await input.press("Enter");
  await page.waitForTimeout(2200);
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

  for (const theme of themes) {
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
            if (message.type() === "error" || message.type() === "warning") {
              consoleErrors.push(`${message.type()}: ${message.text()}`);
            }
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

          await seedAuthAndTheme(page, authByRole[role], theme);
          const url = `${APP_URL}${route}`;
          let state = null;
          let screenshot = null;
          let navigationError = null;

          try {
            await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
            await page.waitForTimeout(1200);
            state = await collectPageState(page);
            screenshot = path.join(OUT_DIR, `${theme}-${viewport.name}-${role}-${route.replace(/\W+/g, "-")}.png`);
            await page.screenshot({ path: screenshot, fullPage: true });
          } catch (error) {
            navigationError = error.message;
          }

          let chatbot = { skipped: true };
          if (
            viewport.name === "desktop" &&
            ["/customer/requests", "/cashier/pos", "/inventory", "/veterinary/appointments"].includes(route)
          ) {
            try {
              chatbot = await maybeTestChatbot(page, role);
            } catch (error) {
              chatbot = { skipped: false, error: error.message };
            }
          }

          report.results.push({
            theme,
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
            actualTheme: state?.actualTheme || null,
            bodyTheme: state?.bodyTheme || null,
            legacyDarkClasses: state?.legacyDarkClasses || false,
            wideElements: state?.wideElements || [],
            chatbot,
            screenshot,
          });

          await context.close();
        }
      }
    }
  }

  await browser.close();
  report.finishedAt = new Date().toISOString();
  const outFile = path.join(OUT_DIR, "light-dark-visual-pass.json");
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
      item.actualTheme !== item.theme ||
      item.bodyTheme ||
      item.legacyDarkClasses ||
      item.chatbot.error;
  });

  console.log(`Light/dark visual pass wrote ${outFile}`);
  console.log(`Checked ${report.results.length} page/theme/viewport combinations.`);
  console.log(`Flagged ${failures.length} combinations for review.`);
  for (const item of failures.slice(0, 80)) {
    const appConsoleErrors = item.consoleErrors.filter((entry) => !isIgnorableBrowserNoise(entry));
    const appFailedRequests = item.failedRequests.filter((entry) => !isIgnorableBrowserNoise(entry));
    const appBadResponses = item.badResponses.filter((entry) => !entry.includes("/notifications") && !isIgnorableBrowserNoise(entry));
    console.log(`${item.theme} ${item.viewport} ${item.role} ${item.route}: nav=${item.navigationError || "ok"} theme=${item.actualTheme} body=${item.bodyTheme || "none"} legacy=${item.legacyDarkClasses ? "yes" : "no"} overflow=${item.overflowX} console=${appConsoleErrors.length} failed=${appFailedRequests.length} page=${item.pageErrors.length} bad=${appBadResponses.length} chat=${item.chatbot.error || "ok"}`);
  }
})();
