const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { readConfig, getLocales } = require("ls_bots.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit-embed")
    .setDescription("Edit an existing embed from the Bot")
    .addStringOption((option) =>
      option
        .setName("message-id")
        .setDescription("The message ID of the embed to edit")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Title for the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Description for the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("Color for the embed")
        .setMaxLength(6)
        .setMinLength(6)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("image")
        .setDescription("Image for the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("thumbnail")
        .setDescription("Thumbnail for the embed")
        .setRequired(false)
    ),

  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    const { options, guild, channel, commandName } = interaction;

    const config = await readConfig();

    if (!guild || commandName !== "edit-embed") return;

    await interaction.deferReply({ ephemeral: true });

    const messageId = options.getString("message-id");

    let message;
    try {
      message = await channel.messages.fetch(messageId);
    } catch (err) {
      return await interaction.editReply(
        `No message found with this ID: ${messageId}`
      );
    }

    if (!message.embeds.length) {
      return await interaction.editReply(
        "The specified message has no embeds to edit."
      );
    }

    const oldEmbed = message.embeds[0];

    const title = options.getString("title") || oldEmbed.title;
    const description =
      options.getString("description")?.replace(/\\n/g, "\n") ||
      oldEmbed.description;
    const image = options.getString("image") || oldEmbed.image?.url;
    const thumbnail = options.getString("thumbnail") || oldEmbed.thumbnail?.url;
    const color = options.getString("color") || config.Color || oldEmbed.color;

    try {
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setImage(image)
        .setThumbnail(thumbnail)
        .setTimestamp();

      await message.edit({ embeds: [embed] });

      const successEmbed = new EmbedBuilder()
        .setTitle("Successfully changed!")
        .setDescription("The embed was successfully changed.")
        .setColor("Green")
        .setTimestamp();

      await interaction.editReply({
        embeds: [successEmbed],
        ephemeral: true,
      });
    } catch (e) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription(
          "The embed could not be edited. Please ensure that the message you are trying to edit is from me and it is an embed."
        )
        .setColor("FF0000")
        .setTimestamp();

      return await interaction.editReply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }
  },
};
