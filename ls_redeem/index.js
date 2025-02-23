const { Client, GatewayIntentBits, Collection } = require("discord.js");

const { loadCommands, loadEvents, readConfig } = require("ls_bots.js");

const config = readConfig();
const client = new Client({
  intents: [GatewayIntentBits.GuildIntegrations, GatewayIntentBits.Guilds],
});


const Start = async () => {
  try {
    client.once("ready", async () => {

        client.commands = new Collection();

        await loadCommands(client);
        await loadEvents(client);
    });
  } catch (error) {
    console.error(
      "Error: 401 - An error occurred while authorizing with the Server.",
      error
    );
  }
};

const startBot = async () => {
  await Start();
};

client.login(config.token);
startBot();
