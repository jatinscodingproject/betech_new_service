const cron = require("node-cron");
const { Op } = require("sequelize");
const User = require("../Models/models.customer");
const clickConfirmButton = require("../Services/Services.portalAutomation");
// const Gameon = require("../Models/models.gameon");

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const PORTAL_LIMITS = {
  "https://quizzy.betech.lk": 10000,
  "https://dermascan.betech.lk": 10000,
  "https://lumabond.betech.lk": 10000,
  "https://serenai.betech.lk": 10000,
};

let isRunning = false;

cron.schedule("* * * * *", async () => {
  if (isRunning) {
    console.log("⏸️ Cron already running, skipping");
    return;
  }

  isRunning = true;
  console.log("▶️ Charging loop started");

  try {
    for (const [origin, limit] of Object.entries(PORTAL_LIMITS)) {
      let processed = 0;
      while (processed < limit) {
        const customer = await User.findOne({
          where: {
            is_chargin: 0,
            // origin,
          },
          order: [["createdAt", "ASC"]],
        });
        console.log(customer)

        const success = await clickConfirmButton({
          origin : customer.origin,
          msisdn: customer.msisdn,
          client_ip: customer.client_ip,
        });

        if (success) {
          await customer.update({ is_chargin: 1 });
          processed++;
          console.log(`✅ ${origin} charged: ${customer.msisdn}`);
        } else {
          await customer.update({ is_chargin: -1 });
          console.log(`❌ Failed: ${customer.msisdn}`);
        }

        await sleep(800);
      }

      console.log(`🔒 ${origin} processed: ${processed}/${limit}`);
    }
  } catch (err) {
    console.error("🔥 Charging error:", err);
  } finally {
    isRunning = false;
    console.log("⏳ Cycle completed, waiting for next tick");
  }
});

