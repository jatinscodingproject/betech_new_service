  // GNU nano 7.2                                                                                                                  browsermanager.js
const puppeteer = require("puppeteer");
const os = require("os");

let browser = null;

async function getBrowser() {
  if (browser) return browser;

  const isLinux = os.platform() === "linux";
  const isWindows = os.platform() === "win32";

  let executablePath;
  let userDataDir;

  if (isLinux) {
    // Linux paths (your server)
    executablePath = "/usr/bin/chromium-browser";
    userDataDir = "/root/puppeteer/chrome-profile";
  } else if (isWindows) {
    // Windows paths (local dev)
    executablePath =
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    userDataDir = "C:\\puppeteer\\chrome-profile";
  }

  browser = await puppeteer.launch({
    headless: isLinux ? "new" : false,

    executablePath,
    userDataDir,

    ignoreHTTPSErrors: true,

    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-infobars",
      "--disable-features=HttpsFirstMode",
      "--disable-web-security",
      ...(isLinux ? [] : ["--start-maximized"]),
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
