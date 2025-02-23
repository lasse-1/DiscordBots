const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { getLocales } = require("ls_bots.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete-code")
    .setDescription("Delete a redemption code"),

  async execute(interaction) {
    const locals = await getLocales(interaction);
    const { guild, commandName } = interaction;

    if (!guild || commandName !== "delete-code") return;

    const modal = new ModalBuilder()
      .setCustomId("delete-code-modal")
      .setTitle(locals.DeleteCode.Modal.Title);

    const textInput = new TextInputBuilder()
      .setCustomId("delete-code-input")
      .setLabel(locals.DeleteCode.Modal.Label)
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const actionRow = new ActionRowBuilder().addComponents(textInput);

    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  },
};
