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
    origin = normalizeOrigin(origin);

    const browser = await getBrowser();
    page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 900 });
    await page.setBypassCSP(true);

    await page.setExtraHTTPHeaders({
      MSISDN: msisdn,
      "X-Forwarded-For": client_ip,
    });

    console.log("🍪 Cookies at start:", (await page.cookies()).length);

    if (origin.includes("gameon.trickso.com")) {
      await page.goto("http://gameon.trickso.com/subscribe", {
        waitUntil: "networkidle2",
      });

      await sleep(6000);

      const clicked = await page.evaluate(() => {
        const btn = [...document.querySelectorAll("button")].find(
          (b) => b.innerText.trim() === "Subscribe Now",
        );

        if (!btn) return false;

        const rect = btn.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;

        // fire full native event sequence
        btn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        btn.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        return true;
      });

      if (!clicked) {
        throw new Error("Subscribe button not clickable");
      }

      console.log("🖱️ Subscribe button clicked (DOM safe)");
    }

    else if (origin.includes("begames.betech.lk")) {
      await page.goto(origin, { waitUntil: "domcontentloaded" });
      await sleep(2000);

      await page.goto(`${origin.replace(/\/$/, "")}/send-otp.php`, {
        waitUntil: "domcontentloaded",
      });

      console.log("📨 BeGames Send OTP opened");
    } else if (origin.includes("vibebox.betech.lk")) {
      await page.goto(origin, { waitUntil: "domcontentloaded" });
      await sleep(2000);

      await page.goto(`${origin.replace(/\/$/, "")}/send-otp.php`, {
        waitUntil: "domcontentloaded",
      });

      console.log("📨 VibeBox Send OTP opened");
    } else if (origin.includes("kidzflix.betech.lk")) {
      await page.goto(origin, { waitUntil: "domcontentloaded" });

      await sleep(2000);

      await page.goto(`${origin.replace(/\/$/, "")}/send-otp.php`, {
        waitUntil: "domcontentloaded",
      });

      console.log("🎬 Kidzflix video hit");
    } else {
      throw new Error("Origin not allowed");
    }

    // ================= CONFIRM =================
    let confirmed = false;
    try {
      await page.waitForSelector("button.confirm", { timeout: 8000 });
      await page.click("button.confirm");
      confirmed = true;
      console.log(`✅ Confirm clicked for ${msisdn}`);
    } catch {
      console.log("⏱️ Confirm button not present");
    }

    await sleep(6000);

    const cookiesAfter = await page.cookies();
    console.log("🍪 Cookies before clear:", cookiesAfter.length);

    const success =
      confirmed ||
      cookiesAfter.length > 0 ||
      page.url().includes("success") ||
      page.url().includes("register");

    // 🔥 CLEAR COOKIES FOR NEXT USER
    await clearCookiesAndCache(page);

    await page.close();

    return success;
  } catch (err) {
    console.error("❌ Automation failed:", err.message);
    if (page) await page.close();
    return false;
  }
};

module.exports = clickConfirmButton;
