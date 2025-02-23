const axios = require("axios");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { loadCommands, loadEvents, readConfig } = require("ls_bots.js");
const Ready = require("./src/Functions/ready");

const config = readConfig();
const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.DirectMessages,
  ],
});

const checkAuthorization = async () => {
  try {
    await client.once("ready", async () => {
      const guildId = client.guilds.cache.first()?.id;
      const productId = 39;
      const version = "1.0.1";

      if (!guildId) return console.log("Error: Bot is not part of any server.");

      const response = await axios
        .get(`http://api.ls-service.dev/auth/`, {
          params: {
            guildId,
            productId,
            version,
          },
        })
        .catch(() => {});

      if (!response) return console.log("Error with authorization");

      const data = response.data;
      if (data && data.authorized) {
        console.log(data.authorized);
        client.commands = new Collection();

        await loadCommands(client);
        await loadEvents(client);
        await Ready(client);

        console.log("Bot is now Ready");
      } else if (data && data.error) {
        console.log(data.error);

        if (client.user) client.destroy();
      } else {
        console.log("error");
      }
    });
  } catch (error) {
    console.log(
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
