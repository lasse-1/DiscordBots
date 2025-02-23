const { getLocales } = require("ls_bots.js");
const Database = require("../../Database");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    const locals = await getLocales(interaction);
    const { customId } = interaction;

    if (!interaction.isModalSubmit() && customId !== "delete-code-modal")
      return;

    await interaction.deferReply({ ephemeral: true });

    const code = interaction.fields.getTextInputValue("delete-code-input");

    await Database.deleteCode(code).catch((err) => {
      return interaction.editReply({
        content: locals.DeleteCode.Text.description2.replace("%code%", code),
      });
    });

    return interaction.editReply({
      content: locals.DeleteCode.Text.description1.replace("%code%", code),
    });
  },
};
