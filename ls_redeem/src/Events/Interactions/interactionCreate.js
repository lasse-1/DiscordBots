module.exports = {
  name: "interactionCreate",

  execute(interaction, client) {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        return interaction.reply({
          content: "This command is no longer valid or supported.",
          ephemeral: true,
        });
      }
      command.execute(interaction, client);
    }
  },
};
