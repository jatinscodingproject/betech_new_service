const puppeteer = require("puppeteer");

let browser = null;

async function getBrowser() {
  if (browser) return browser;

  browser = await puppeteer.launch({
    headless: false,

    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",

    userDataDir: "C:\\puppeteer\\chrome-profile",

    ignoreHTTPSErrors: true,

    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-features=HttpsFirstMode",
      "--disable-web-security",
      "--disable-infobars",
      "--start-maximized",
    ],

    ignoreDefaultArgs: ["--enable-automation"],
  });

  console.log("🚀 Chrome launched (shared browser)");
  return browser;
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    console.log("🛑 Chrome closed");
  }
}

module.exports = { getBrowser, closeBrowser };

