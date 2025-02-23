module.exports = {
  name: "interactionCreate",

  execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        interaction.reply({
          content: "This command is no longer current",
        });
      }
      command.execute(interaction, client);
    }
  },
};
