const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

let browser = null;
let currentProfile = null;

async function getBrowser(profileName = "default-profile") {

  // If already running with same profile, reuse
  if (browser && currentProfile === profileName) {
    return browser;
  }

  // If running with different profile, close first
  if (browser && currentProfile !== profileName) {
    await browser.close();
    browser = null;
  }

  const profilePath = path.join(
    "C:/puppeteer/profiles",
    profileName
  );

  // Create folder if not exists
  if (!fs.existsSync(profilePath)) {
    fs.mkdirSync(profilePath, { recursive: true });
  }

  browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    userDataDir: profilePath,   // ✅ dynamic profile
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

  currentProfile = profileName;

  console.log("🚀 Chrome launched with profile:", profilePath);

  return browser;
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    currentProfile = null;
    console.log("🛑 Chrome closed");
  }
}

module.exports = { getBrowser, closeBrowser };
