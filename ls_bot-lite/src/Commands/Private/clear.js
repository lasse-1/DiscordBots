const { SlashCommandBuilder, Colors, EmbedBuilder } = require("discord.js");
const { readConfig, getLocales } = require("ls_bots.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Command to clear messages in a channel.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of the messages to clear (max: 100)")
        .setMaxValue(100)
        .setMinValue(1)
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Only messages from this user will be cleared")
        .setRequired(false)
    ),

  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    const { channel, options, guild, commandName } = interaction;
    const config = await readConfig();
    const locals = await getLocales(interaction);

    const { description_1, description_2, description_3, description_4 } =
      locals.Clear;

    if (!guild || commandName !== "clear") return;

    await interaction.deferReply({ ephemeral: true });

    let amount = options.getInteger("amount");
    if (amount > 99) {
      amount = 99;
    }
    const target = options.getUser("user");

    const messages = await channel.messages.fetch({
      limit: amount + 1,
    });

    const embed = new EmbedBuilder().setColor("Random");

    if (target) {
      let i = 0;
      const filtered = [];

      (await messages).filter((msg) => {
        if (
          msg.author.id === target.id &&
          amount > i &&
          msg.createdTimestamp >= Date.now() - 1209600000
        ) {
          filtered.push(msg);
          i++;
        }
      });
      if (filtered.length === 0) {
        embed.setDescription(description_1);
        await interaction.editReply({ embeds: [embed] });
      }
      await channel.bulkDelete(filtered).then(async (msgs) => {
        const description = description_2
          .replace("%size%", msgs.size)
          .replace("%target%", target);
        embed.setDescription(description);
        await interaction.editReply({ embeds: [embed] });
      });
    } else {
      let filtered = [];

      (await messages).filter((msg) => {
        if (msg.createdTimestamp >= Date.now() - 1209600000) {
          filtered.push(msg);
        }
      });
      if (filtered.length === 0) {
        embed.setDescription(description_3);
        return interaction.editReply({ embeds: [embed] });
      }
      await channel.bulkDelete(filtered).then(async (msgs) => {
        const description = description_4.replace("%size%", msgs.size);

        embed.setDescription(description);
        await interaction.editReply({ embeds: [embed] });
      });
    }
  },
};
