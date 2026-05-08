const { chromium } = require("./frontend/node_modules/playwright");
const { execFileSync } = require("child_process");
const path = require("path");

const FRONTEND = "http://localhost:3000";
const API_BASE = "http://localhost:8000/api";
const MYSQL = "C:\\xampp\\mysql\\bin\\mysql.exe";
const PROOF = path.join(__dirname, "frontend", "public", "logo192.png");
const PASSWORD = "Password123!";

const evidence = {
  startedAt: new Date().toISOString(),
  checks: [],
  issues: [],
  console: [],
  network: [],
  changedFiles: ["e2e-click-validation.cjs"],
};

const q = (sql) => {
  const out = execFileSync(MYSQL, ["-u", "root", "--batch", "--raw", "--skip-column-names", "-e", `USE pawesome_db; ${sql}`], {
    encoding: "utf8",
  }).trim();
  if (!out) return [];
  return out.split(/\r?\n/).map((line) => line.split("\t"));
};

const one = (sql) => q(sql)[0] || null;
const esc = (value) => String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");

const add = (name, status, details = {}) => {
  evidence.checks.push({ name, status, details });
  console.log(`${status.toUpperCase()}: ${name}`, details);
};

const issue = (name, details = {}) => {
  evidence.issues.push({ name, details });
  console.log(`ISSUE: ${name}`, details);
};

const itemById = (id) => {
  const r = one(`SELECT id, sku, name, stock, price FROM inventory_items WHERE id=${Number(id)};`);
  if (!r) return null;
  return { id: Number(r[0]), sku: r[1], name: r[2], stock: Number(r[3]), price: Number(r[4]) };
};

const latestOrderId = () => Number((one("SELECT COALESCE(MAX(id),0) FROM customer_orders;") || [0])[0]);

const orderById = (id) => {
  const r = one(`SELECT id, total_amount, status, payment_status, payment_proof, paid_at, verified_by, cashier_remarks, receipt_number FROM customer_orders WHERE id=${Number(id)};`);
  if (!r) return null;
  return {
    id: Number(r[0]),
    total: Number(r[1]),
    status: r[2],
    payment_status: r[3],
    payment_proof: r[4] || null,
    paid_at: r[5] || null,
    verified_by: r[6] || null,
    cashier_remarks: r[7] || null,
    receipt_number: r[8] || null,
  };
};

const orderItem = (orderId) => {
  const r = one(`SELECT inventory_item_id, product_name, quantity, price, subtotal FROM customer_order_items WHERE customer_order_id=${Number(orderId)} ORDER BY id LIMIT 1;`);
  if (!r) return null;
  return { itemId: Number(r[0]), product: r[1], qty: Number(r[2]), price: Number(r[3]), subtotal: Number(r[4]) };
};

const recentLogs = (itemId, refId = null) => {
  const ref = refId ? ` AND reference_id=${Number(refId)}` : "";
  return q(`SELECT delta, previous_stock, new_stock, movement_type, reference_type, reference_id, reason FROM inventory_logs WHERE inventory_item_id=${Number(itemId)}${ref} ORDER BY id DESC LIMIT 5;`)
    .map((r) => ({ delta: Number(r[0]), previous_stock: r[1] === "NULL" ? null : Number(r[1]), new_stock: r[2] === "NULL" ? null : Number(r[2]), movement_type: r[3], reference_type: r[4], reference_id: r[5], reason: r[6] }));
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clickFirstText = async (page, text, timeout = 8000) => {
  const loc = page.getByText(text, { exact: false }).first();
  await loc.waitFor({ state: "visible", timeout });
  await loc.click();
};

const clickButton = async (page, pattern, timeout = 8000) => {
  const loc = page.getByRole("button", { name: pattern }).first();
  try {
    await loc.waitFor({ state: "visible", timeout });
    await loc.click();
    return;
  } catch (err) {
    const source = pattern.source.replace(/\\s\+/g, " ").replace(/\\/g, "").replace(/\^|\$|\.\*|\?/g, "");
    const clicked = await page.evaluate((needle) => {
      const normalizedNeedle = needle.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
      const buttons = [...document.querySelectorAll("button, label, [role='button']")];
      const target = buttons.find((el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
        return text.includes(normalizedNeedle) && !el.disabled && el.offsetParent !== null;
      });
      if (!target) return false;
      target.click();
      return true;
    }, source);
    if (!clicked) throw err;
  }
};

const acceptSwal = async (page, textPattern = null, timeout = 8000) => {
  const confirm = page.locator("button.swal2-confirm").first();
  await confirm.waitFor({ state: "visible", timeout });
  if (textPattern) {
    const label = await confirm.textContent();
    if (!textPattern.test(label || "")) throw new Error(`Unexpected SweetAlert confirm button: ${label}`);
  }
  await confirm.click();
};

const login = async (page, email, expectedPath) => {
  page.once("dialog", async (dialog) => dialog.accept().catch(() => {}));
  await page.goto(`${FRONTEND}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${FRONTEND}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="text"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await clickButton(page, /sign in/i);
  await page.waitForURL(new RegExp(expectedPath.replace("/", "\\/")), { timeout: 15000 });
  add(`Login ${email}`, "passed", { url: page.url() });
};

const selectOrderCardButton = async (page, orderId, buttonText) => {
  const clicked = await page.evaluate(({ orderId, buttonText }) => {
    const text = String(orderId);
    const cards = [...document.querySelectorAll(".order-card, tr, .customer-order-card, .order-item, .card, div")];
    const card = cards.find((el) => (el.innerText || "").includes(`#${text}`) || (el.innerText || "").includes(`Order #${text}`) || (el.innerText || "").includes(text));
    if (!card) return false;
    const buttons = [...card.querySelectorAll("button")];
    const button = buttons.find((b) => (b.innerText || "").toLowerCase().includes(buttonText.toLowerCase()) && !b.disabled);
    if (!button) return false;
    button.click();
    return true;
  }, { orderId, buttonText });
  if (!clicked) {
    const sample = await page.evaluate(() => ({
      url: location.href,
      body: document.body.innerText.slice(0, 1600),
      buttons: [...document.querySelectorAll("button")]
        .map((b) => (b.innerText || b.textContent || "").trim())
        .filter(Boolean)
        .slice(0, 80),
    }));
    throw new Error(`Could not click ${buttonText} for order ${orderId}. Visible sample: ${JSON.stringify(sample)}`);
  }
};

const createOrderViaBrowser = async (page, product, label) => {
  const maxBefore = latestOrderId();
  const stockBefore = itemById(product.id).stock;
  await login(page, "customer@example.com", "/customer");
  await page.evaluate(() => localStorage.removeItem("customer_cart"));
  await page.goto(`${FRONTEND}/customer/store`, { waitUntil: "domcontentloaded" });
  await page.getByText(product.name, { exact: false }).first().waitFor({ state: "visible", timeout: 20000 });
  await page.getByPlaceholder(/search products/i).fill(product.name);
  await page.getByText(product.name, { exact: false }).first().waitFor({ state: "visible", timeout: 10000 });
  await sleep(700);
  const clickedProductCart = await page.evaluate((productName) => {
    const nameNode = [...document.querySelectorAll("div, h1, h2, h3, h4, span, p")]
      .find((el) => (el.innerText || "").trim() === productName);
    let card = nameNode;
    while (card && card !== document.body && card.querySelectorAll("button").length < 3) {
      card = card.parentElement;
    }
    if (!card || card === document.body) return false;
    const buttons = [...card.querySelectorAll("button")].filter((b) => !b.disabled);
    const target = buttons[buttons.length - 1];
    if (!target) return false;
    target.click();
    return true;
  }, product.name);
  if (!clickedProductCart) {
    const visibleText = await page.evaluate(() => ({
      body: document.body.innerText.slice(0, 1200),
      buttons: [...document.querySelectorAll("button, label, [role='button']")]
        .filter((el) => el.offsetParent !== null)
        .map((el) => (el.innerText || el.textContent || "").trim())
        .filter(Boolean)
        .slice(0, 40),
    }));
    throw new Error(`Add to Cart button not found after product search. Visible sample: ${JSON.stringify(visibleText)}`);
  }
  await clickButton(page, /proceed to checkout/i);
  await clickButton(page, /place order/i);
  await acceptSwal(page, /ok/i);
  await page.waitForFunction(({ max, apiBase }) => {
    return fetch(`${apiBase}/customer/store/orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, Accept: "application/json" },
    }).then((r) => r.json()).then((data) => {
      const list = Array.isArray(data) ? data : data.data || data.orders || [];
      return list.some((o) => Number(o.id) > max && String(o.status).toLowerCase() === "pending");
    }).catch(() => false);
  }, { max: maxBefore, apiBase: API_BASE }, { timeout: 15000 });
  const newId = latestOrderId();
  const order = orderById(newId);
  const stockAfter = itemById(product.id).stock;
  const ok = newId > maxBefore && order.status === "pending" && order.payment_status === "unpaid" && stockAfter === stockBefore;
  add(`${label}: customer checkout browser`, ok ? "passed" : "failed", { orderId: newId, stockBefore, stockAfter, order });
  await page.goto(`${FRONTEND}/customer/orders`, { waitUntil: "domcontentloaded" });
  await page.getByText(String(newId), { exact: false }).first().waitFor({ state: "visible", timeout: 10000 });
  add(`${label}: order appears in My Orders`, "passed", { orderId: newId });
  return newId;
};

const approveOrderViaBrowser = async (page, orderId) => {
  const item = orderItem(orderId);
  const stockBefore = itemById(item.itemId).stock;
  await login(page, "receptionist@example.com", "/receptionist");
  await page.goto(`${FRONTEND}/receptionist/orders`, { waitUntil: "domcontentloaded" });
  await page.locator("body").waitFor({ state: "visible", timeout: 10000 });
  await page.getByText(String(orderId), { exact: false }).first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
  await selectOrderCardButton(page, orderId, "Approve");
  await acceptSwal(page, /approve/i);
  await page.locator("button.swal2-confirm").waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
  await sleep(1200);
  const stockAfter = itemById(item.itemId).stock;
  const order = orderById(orderId);
  const logs = recentLogs(item.itemId, orderId);
  const ok = order.status === "approved" && order.payment_status === "unpaid" && stockAfter === stockBefore - item.qty && logs.some((l) => l.new_stock === stockAfter);
  add("Receptionist approval browser", ok ? "passed" : "failed", { orderId, item, stockBefore, stockAfter, order, logs });
  return { item, stockBefore, stockAfter, order, logs };
};

const rejectOrCancelOrderViaBrowser = async (page, orderId, action) => {
  const item = orderItem(orderId);
  const stockBefore = itemById(item.itemId).stock;
  await login(page, "receptionist@example.com", "/receptionist");
  await page.goto(`${FRONTEND}/receptionist/orders`, { waitUntil: "domcontentloaded" });
  await page.getByText(/loading orders/i).first().waitFor({ state: "hidden", timeout: 20000 }).catch(() => {});
  await page.getByText(String(orderId), { exact: false }).first().waitFor({ state: "visible", timeout: 20000 }).catch(() => {});
  await selectOrderCardButton(page, orderId, action);
  const textarea = page.locator(".swal2-textarea").first();
  await textarea.waitFor({ state: "visible", timeout: 8000 });
  await textarea.fill(`Browser E2E ${action.toLowerCase()} validation`);
  await acceptSwal(page, new RegExp(action, "i"));
  await page.locator("button.swal2-confirm").waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
  await sleep(1200);
  const stockAfter = itemById(item.itemId).stock;
  const order = orderById(orderId);
  const expectedStatus = action.toLowerCase() === "cancel" ? "cancelled" : "rejected";
  const ok = order.status === expectedStatus;
  add(`Receptionist ${action.toLowerCase()} browser`, ok ? "passed" : "failed", { orderId, stockBefore, stockAfter, order, logs: recentLogs(item.itemId, orderId) });
  return { item, stockBefore, stockAfter, order };
};

const uploadProofViaBrowser = async (page, orderId) => {
  await login(page, "customer@example.com", "/customer");
  await page.goto(`${FRONTEND}/customer/payments?order_id=${orderId}`, { waitUntil: "domcontentloaded" });
  page.once("dialog", async (dialog) => dialog.accept().catch(() => {}));
  const paymentInput = page.locator(`#file-upload-store_order-${orderId}`).first();
  await paymentInput.waitFor({ state: "attached", timeout: 15000 });
  await paymentInput.setInputFiles(PROOF);
  await page.waitForFunction(({ id, apiBase }) => {
    return fetch(`${apiBase}/customer/store/orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, Accept: "application/json" },
    }).then((r) => r.json()).then((data) => {
      const list = Array.isArray(data) ? data : data.data || data.orders || [];
      const order = list.find((o) => Number(o.id) === Number(id));
      return order && String(order.payment_status).toLowerCase() === "pending";
    }).catch(() => false);
  }, { id: orderId, apiBase: API_BASE }, { timeout: 15000 });
  const order = orderById(orderId);
  add("Customer payment proof upload browser", order.payment_status === "pending" && !!order.payment_proof ? "passed" : "failed", { orderId, order });
};

const verifyPaymentViaBrowser = async (page, orderId, itemId) => {
  const stockBefore = itemById(itemId).stock;
  await login(page, "cashier@example.com", "/cashier");
  await page.goto(`${FRONTEND}/cashier/payment-verification`, { waitUntil: "domcontentloaded" });
  await page.getByText(String(orderId), { exact: false }).first().waitFor({ state: "visible", timeout: 15000 });
  const proofVisible = await page.getByText(/view proof/i).first().isVisible().catch(() => false);
  await selectOrderCardButton(page, orderId, "Verify");
  await sleep(1500);
  const stockAfter = itemById(itemId).stock;
  const order = orderById(orderId);
  const ok = order.payment_status === "paid" && !!order.paid_at && !!order.verified_by && !!order.receipt_number && stockAfter === stockBefore;
  add("Cashier payment verification browser", ok ? "passed" : "failed", { orderId, proofVisible, stockBefore, stockAfter, order });
};

const posTransactionViaBrowser = async (page, product) => {
  const stockBefore = itemById(product.id).stock;
  const salesBefore = Number((one("SELECT COALESCE(MAX(id),0) FROM sales;") || [0])[0]);
  await login(page, "cashier@example.com", "/cashier");
  await page.goto(`${FRONTEND}/cashier/pos`, { waitUntil: "domcontentloaded" });
  await page.locator('input[placeholder*="Search"], input[placeholder*="Scan"], input[type="search"]').first().fill(product.name);
  await sleep(1000);
  await clickButton(page, /add/i);
  await clickButton(page, /proceed to payment/i);
  await page.locator('input[placeholder*="Walk-in"]').first().fill("Browser E2E Walk-in");
  await page.locator('input[placeholder*="."]').last().fill(String(Math.ceil(product.price + 200)));
  const complete = page.getByRole("button", { name: /complete payment/i }).first();
  await complete.waitFor({ state: "visible", timeout: 10000 });
  const disabled = await complete.isDisabled();
  if (disabled) throw new Error("Complete Payment remained disabled after valid cart and cash amount.");
  await complete.click();
  await sleep(1800);
  const stockAfter = itemById(product.id).stock;
  const latestSale = Number((one("SELECT COALESCE(MAX(id),0) FROM sales;") || [0])[0]);
  const logs = recentLogs(product.id);
  const ok = latestSale > salesBefore && stockAfter === stockBefore - 1 && logs.some((l) => l.new_stock === stockAfter || l.delta === -1);
  add("Cashier POS browser", ok ? "passed" : "failed", { product, stockBefore, stockAfter, salesBefore, latestSale, logs });
};

const inventoryAdjustmentViaBrowser = async (page, product) => {
  const stockBefore = itemById(product.id).stock;
  await login(page, "inventory@example.com", "/inventory");
  await page.goto(`${FRONTEND}/inventory/stock`, { waitUntil: "domcontentloaded" });
  await page.locator('input[placeholder*="Search"], input[type="search"]').first().fill(product.name);
  await sleep(1000);
  await clickButton(page, /adjust/i);
  await page.locator('input[type="number"]').first().fill("2");
  await page.locator("select").last().selectOption({ label: "Inventory correction" }).catch(async () => {
    await page.locator("select").last().selectOption("Inventory correction");
  });
  await clickButton(page, /save adjustment/i);
  await sleep(1500);
  const stockAfter = itemById(product.id).stock;
  const logs = recentLogs(product.id);
  const ok = stockAfter === stockBefore + 2 && logs.some((l) => l.new_stock === stockAfter && /correction/i.test(l.reason || ""));
  add("Inventory stock adjustment browser", ok ? "passed" : "failed", { product, stockBefore, stockAfter, logs });
};

const vetConsultationViaBrowser = async (page) => {
  const r = one("SELECT id,status FROM appointments WHERE status IN ('scheduled','approved','in_progress','in_consultation') ORDER BY FIELD(status,'scheduled','approved','in_progress','in_consultation'), id LIMIT 1;");
  if (!r) {
    issue("No eligible vet appointment for consultation");
    return;
  }
  const appointmentId = Number(r[0]);
  await login(page, "vet@example.com", "/veterinary");
  await page.goto(`${FRONTEND}/veterinary/appointments/${appointmentId}/consult`, { waitUntil: "domcontentloaded" });
  if (await page.getByRole("button", { name: /start consultation/i }).first().isVisible().catch(() => false)) {
    await clickButton(page, /start consultation/i);
    await sleep(900);
  }
  const values = [
    "Browser E2E chief complaint",
    "Mild itching observed",
    "Vitals stable",
    "Browser E2E diagnosis",
    "Medicated bath and observation",
    "Procedure notes saved by browser audit",
    "Follow-up in seven days",
    "Remarks saved by browser audit",
  ];
  const textareas = page.locator("textarea");
  for (let i = 0; i < Math.min(values.length, await textareas.count()); i += 1) {
    await textareas.nth(i).fill(values[i]);
  }
  await clickButton(page, /save draft/i);
  await sleep(1000);
  await clickButton(page, /finalize/i);
  await sleep(1500);
  const appt = one(`SELECT status, diagnosis, treatment_notes, prescription, vet_remarks FROM appointments WHERE id=${appointmentId};`);
  const rec = one(`SELECT status, diagnosis, treatment_plan, follow_up_instructions, notes FROM medical_records WHERE appointment_id=${appointmentId} ORDER BY id DESC LIMIT 1;`);
  const ok = appt && ["completed", "treated"].includes(String(appt[0]).toLowerCase()) && rec && String(rec[0]).toLowerCase() === "finalized";
  add("Veterinary consultation notes/status browser", ok ? "passed" : "failed", { appointmentId, appointment: appt, medicalRecord: rec });
};

const reportsSmokeViaBrowser = async (page) => {
  const pages = [
    ["manager@example.com", "/manager", "/manager/reports", "Manager reports"],
    ["admin@example.com", "/admin", "/admin", "Admin dashboard"],
    ["payroll@example.com", "/payroll", "/payroll/reports", "Payroll reports"],
  ];
  for (const [email, expected, route, name] of pages) {
    await login(page, email, expected);
    await page.goto(`${FRONTEND}${route}`, { waitUntil: "domcontentloaded" });
    await page.locator("body").waitFor({ state: "visible", timeout: 10000 });
    const body = (await page.locator("body").innerText()).trim();
    add(name, body.length > 100 ? "passed" : "failed", { route, sample: body.slice(0, 180) });
  }
};

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, acceptDownloads: true });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) evidence.console.push({ type: msg.type(), text: msg.text() });
  });
  page.on("response", (res) => {
    const status = res.status();
    if (status >= 400) evidence.network.push({ status, url: res.url() });
  });
  page.on("dialog", async (dialog) => dialog.accept().catch(() => {}));

  try {
    const product = itemById(1);
    const secondProduct = itemById(2);
    const thirdProduct = itemById(6);

    const orderId = await createOrderViaBrowser(page, product, "Primary order");
    const approval = await approveOrderViaBrowser(page, orderId);

    const cancelOrderId = await createOrderViaBrowser(page, secondProduct, "Cancel/restore order");
    const cancelApproval = await approveOrderViaBrowser(page, cancelOrderId);
    const cancelResult = await rejectOrCancelOrderViaBrowser(page, cancelOrderId, "Cancel");
    const restored = cancelResult.stockAfter === cancelApproval.stockBefore;
    add("Approved order cancel restores stock once", restored ? "passed" : "failed", {
      orderId: cancelOrderId,
      beforeApproval: cancelApproval.stockBefore,
      afterApproval: cancelApproval.stockAfter,
      afterCancel: cancelResult.stockAfter,
      order: cancelResult.order,
    });

    const rejectOrderId = await createOrderViaBrowser(page, thirdProduct, "Pending reject order");
    const rejectItem = orderItem(rejectOrderId);
    const rejectBefore = itemById(rejectItem.itemId).stock;
    const rejectResult = await rejectOrCancelOrderViaBrowser(page, rejectOrderId, "Reject");
    add("Pending order reject does not deduct stock", rejectResult.stockAfter === rejectBefore ? "passed" : "failed", {
      orderId: rejectOrderId,
      beforeReject: rejectBefore,
      afterReject: rejectResult.stockAfter,
      order: rejectResult.order,
    });

    await uploadProofViaBrowser(page, orderId);
    await verifyPaymentViaBrowser(page, orderId, approval.item.itemId);

    await login(page, "customer@example.com", "/customer");
    await page.goto(`${FRONTEND}/customer/payments`, { waitUntil: "domcontentloaded" });
    await page.getByText(String(orderId), { exact: false }).first().waitFor({ state: "visible", timeout: 12000 });
    await page.getByText(/receipt/i).first().waitFor({ state: "visible", timeout: 12000 });
    add("Customer receipt visibility after cashier verification", "passed", { orderId, order: orderById(orderId) });

    await posTransactionViaBrowser(page, product);
    await inventoryAdjustmentViaBrowser(page, product);
    await vetConsultationViaBrowser(page);
    await reportsSmokeViaBrowser(page);

    await login(page, "customer@example.com", "/customer");
    for (const route of ["/admin", "/cashier", "/inventory", "/receptionist", "/manager", "/veterinary", "/payroll"]) {
      await page.goto(`${FRONTEND}${route}`, { waitUntil: "domcontentloaded" });
      await sleep(500);
      const ok = !page.url().includes(route) || page.url().includes("/unauthorized") || page.url().includes("/login");
      add(`Customer blocked from ${route}`, ok ? "passed" : "failed", { finalUrl: page.url() });
    }
  } catch (err) {
    issue("Browser validation aborted", { message: err.message, stack: err.stack });
  } finally {
    evidence.finishedAt = new Date().toISOString();
    evidence.summary = {
      passed: evidence.checks.filter((c) => c.status === "passed").length,
      failed: evidence.checks.filter((c) => c.status === "failed").length,
      issues: evidence.issues.length,
      consoleErrors: evidence.console.filter((c) => c.type === "error").length,
      networkFailures: evidence.network.length,
    };
    console.log("E2E_BROWSER_VALIDATION_RESULT=" + JSON.stringify(evidence, null, 2));
    await browser.close();
  }
})();
