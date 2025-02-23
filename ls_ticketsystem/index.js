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

const Start = async () => {
  try {
    await client.once("ready", async () => {
        client.commands = new Collection();

        await loadCommands(client);
        await loadEvents(client);
        await Ready(client);
    });
  } catch (error) {
    console.log(
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
