const cron = require("node-cron");
const User = require("../Models/models.customer");
const clickConfirmButton = require("../Services/Services.portalAutomation");
const { Op } = require("sequelize");

const sleep = (ms) =>
  new Promise((res) => setTimeout(res, ms));

const DAILY_LIMIT = 1;

let isRunning = false;

cron.schedule("* 7-10 * * *", async () => {

  const now = new Date();

  const istTime = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );

  const hour = istTime.getHours();

  if (
    hour < 7 ||
    hour >= 11
  ) {
    console.log(
      "⏸️ Outside allowed IST time window"
    );

    return;
  }

  if (isRunning) {
    console.log(
      "⏸️ Cron already running, skipping"
    );

    return;
  }

  isRunning = true;

  console.log(
    "▶️ Charging loop started"
  );

  try {

    const origins = [
      "https://quizzy.betech.lk",
      "https://dermascan.betech.lk",
      "https://lumabond.betech.lk",
      "https://serenai.betech.lk",
    ];

    for (const origin of origins) {

      console.log(
        `🚀 Processing ${origin}`
      );

      const startOfDay = new Date();

      startOfDay.setHours(
        0,
        0,
        0,
        0
      );

      const endOfDay = new Date();

      endOfDay.setHours(
        23,
        59,
        59,
        999
      );

      const todayChargedCount =
        await User.count({
          where: {
            origin,
            is_chargin: 1,
            updatedAt: {
              [Op.between]: [
                startOfDay,
                endOfDay,
              ],
            },
          },
        });

      console.log(
        `📊 Today's charged count: ${todayChargedCount}`
      );

      if (
        todayChargedCount >=
        DAILY_LIMIT
      ) {
        console.log(
          `⛔ Daily limit reached for ${origin}`
        );

        continue;
      }

      const remaining =
        DAILY_LIMIT -
        todayChargedCount;

      const customers =
        await User.findAll({
          where: {
            origin,
            is_chargin: 0,
          },
          limit: remaining,
        });

      if (!customers.length) {
        console.log(
          `⚠️ No customers found for ${origin}`
        );

        continue;
      }

      let processed = 0;

      for (const customer of customers) {

        try {

          const success =
            await clickConfirmButton({
              origin:
                customer.origin,
              msisdn:
                customer.msisdn,
              client_ip:
                customer.client_ip,
            });

          if (success) {

            await customer.update({
              is_chargin: 1,
            });

            processed++;

            console.log(
              `✅ ${origin} charged: ${customer.msisdn}`
            );

          } else {

            await customer.update({
              is_chargin: -1,
            });

            console.log(
              `❌ Failed: ${customer.msisdn}`
            );
          }

        } catch (err) {

          console.error(
            `🔥 Error processing ${customer.msisdn}:`,
            err
          );

          await customer.update({
            is_chargin: -1,
          });
        }

        await sleep(800);
      }

      console.log(
        `🔒 ${origin} processed today: ${todayChargedCount +
        processed
        }/${DAILY_LIMIT}`
      );
    }

  } catch (err) {

    console.error(
      "🔥 Charging error:",
      err
    );

  } finally {

    isRunning = false;

    console.log(
      "⏳ Cycle completed, waiting for next tick"
    );
  }
});