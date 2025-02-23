const axios = require("axios");
const { Client, GatewayIntentBits, Collection } = require("discord.js");

const { loadCommands, loadEvents, readConfig } = require("ls_bots.js");

const config = readConfig();
const client = new Client({
  intents: [GatewayIntentBits.GuildIntegrations, GatewayIntentBits.Guilds],
});

const productId = 1;
const version = "1.0.4";

const checkAuthorization = async () => {
  try {
    client.once("ready", async () => {
      const guildId = client.guilds.cache.first()?.id;

      if (!guildId)
        return console.error("Error: Bot is not part of any server.");

      const response = await axios
        .get(`http://api.ls-service.dev/auth/`, {
          params: {
            guildId,
            productId,
            version,
          },
        })
        .catch(() => {});

      if (!response) return console.error("Error with authorization");

      const data = response.data;
      if (data && data.authorized) {
        console.info(data.authorized);
        client.commands = new Collection();

        await loadCommands(client);
        await loadEvents(client);

        console.info(`${client.user.username} is now ready to use`);
      } else if (data && data.error) {
        console.error(data.error);

        if (client.user) client.destroy();
      } else {
        console.error("error");
      }
    });
  } catch (error) {
    console.error(
      "Error: 401 - An error occurred while authorizing with the Server.",
      error
    );
  }
};

const authorizationCheckInterval = 24 * 60 * 60 * 1000;

const checkAndStartBot = async () => {
  await checkAuthorization();
  setInterval(checkAuthorization, authorizationCheckInterval);

  if (!client.user) return;
};

const startBot = async () => {
  await checkAndStartBot();
};

client.login(config.token);
startBot();

const handleError = async (errorType, error) => {
  try {
    const fullErrorMessage = `${errorType}:\n${error.stack || error}`;

    await axios.get(`http://api.ls-service.dev/handler/error/`, {
      params: {
        productId,
        version,
        message: fullErrorMessage,
      },
    });
  } catch (axiosError) {
    console.error("Error while sending error report:", axiosError);
  }
};

process.on("unhandledRejection", (reason, promise) => {
  handleError("Unhandled Rejection", promise);
});

process.on("uncaughtException", (err) => {
  handleError("Uncaught Exception", err);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  handleError("Uncaught Exception Monitor", origin);
});
