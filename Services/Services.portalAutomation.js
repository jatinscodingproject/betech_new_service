const { getBrowser } = require("./browsermanager");

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const normalizeOrigin = (origin = "") =>
  origin.replace(/^https:\/\//i, "http://");

async function clearCookiesAndCache(page) {
  const client = await page.target().createCDPSession();
  await client.send("Network.clearBrowserCookies");
  await client.send("Network.clearBrowserCache");
  console.log("🧹 Cookies & cache cleared");
}

const clickConfirmButton = async ({ origin, msisdn, client_ip }) => {
  let page;

  try {
    origin = origin;

    const browser = await getBrowser();
    page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 700 });
    // await page.setBypassCSP(true);

    await page.setExtraHTTPHeaders({
      MSISDN: msisdn,
      "X-Forwarded-For": client_ip,
    });

    console.log("🍪 Cookies at start:", (await page.cookies()).length);
    
    if (origin.includes("quizzy.betech.lk")) {
      await page.goto(`http://consent.hutch.lk/register-service/XQ%3D%3DCA%3D%3Deg%3D%3DAw%3D%3D`, { waitUntil: "domcontentloaded" });
      await sleep(2000);

      // await page.goto(`${origin.replace(/\/$/, "")}/send-otp.php`, {
      //   waitUntil: "domcontentloaded",
      // });

      console.log("quizzy Consent");
    }

    else if (origin.includes("dermascan.betech.lk")) {
      await page.goto(`http://consent.hutch.lk/register-service/XQ%3D%3DCA%3D%3Deg%3D%3DDQ%3D%3D`, { waitUntil: "domcontentloaded" });
      await sleep(2000);

      // await page.goto(`${origin.replace(/\/$/, "")}/public/subscribe.php`, {
      //   waitUntil: "domcontentloaded",
      // });

      console.log("Dermascan Consent");
    }

    else if (origin.includes("serenai.betech.lk")) {
      await page.goto(`http://consent.hutch.lk/register-service/XQ%3D%3DCA%3D%3Deg%3D%3DAQ%3D%3D`, { waitUntil: "domcontentloaded" });
      await sleep(2000);

      // await page.goto(`${origin.replace(/\/$/, "")}/public/subscribe.php`, {
      //   waitUntil: "domcontentloaded",
      // });

      console.log("Serenai Consent");
    }

    else if (origin.includes("lumabond.betech.lk")) {
      await page.goto(`http://consent.hutch.lk/register-service/XQ%3D%3DCA%3D%3Dew%3D%3DBQ%3D%3D`, { waitUntil: "domcontentloaded" });
      await sleep(2000);

      // await page.goto(`${origin.replace(/\/$/, "")}/public/subscribe.php`, {
      //   waitUntil: "domcontentloaded",
      // });

      console.log("Lumabond Consent");
    }
    
    else {
      throw new Error("Origin not allowed");
    }
 const controls = await page.evaluate(() => {
        return Array.from(
            document.querySelectorAll("button, input, [role='button']")
        ).map((el) => ({
            tag: el.tagName,
            id: el.id || "",
            name: el.getAttribute("name") || "",
            type: el.getAttribute("type") || "",
            className: el.className || "",
            text: (el.innerText || el.value || "").trim(),
            disabled: !!el.disabled,
            visible: !!(
                el.offsetWidth ||
                el.offsetHeight ||
                el.getClientRects().length
            )
        }));
    });

    console.log("🔎 Consent controls:");
    console.dir(controls, { depth: null });
    const confirmButton = await page.waitForSelector(
        "button.btn.btn-brand.mb-3",
        {
            visible: true,
            timeout: 15000,
        }
    );

    if (!confirmButton) {
        throw new Error("Confirm button not found");
    }

console.log("✅ Confirm button found — clicking...");

await confirmButton.click();
    await sleep(6000);
    const cookiesAfter = await page.cookies();
    console.log("🍪 Cookies before clear:", cookiesAfter.length);
  const success =
    cookiesAfter.length > 0 ||
    page.url().includes("success") ||
    page.url().includes("register");
    // 🔥 CLEAR COOKIES FOR NEXT USER
    await clearCookies(page);
    await page.close();
    return success;
  } catch (err) {
    console.error("❌ Automation failed:", err.message);
    if (page) await page.close();
    return false;
  }
};

module.exports = clickConfirmButton;