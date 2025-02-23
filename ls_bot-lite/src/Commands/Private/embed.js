const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { readConfig, getLocales, addEmbedValue } = require("ls_bots.js");

const collectors = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-embed")
    .setDescription("Create a new embed")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Titel for the embed")
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
    const { options, guild, commandName, channel } = interaction;
    const locals = await getLocales(interaction);
    const config = await readConfig();

    if (!guild || commandName !== "create-embed") return;

    await interaction.deferReply({ ephemeral: true });

    const userId = interaction.user.id;

    if (collectors.has(userId)) {
      await interaction.editReply({
        content: "Please finish your previous action first.",
        ephemeral: true,
      });
      return;
    }

    const title = options.getString("title");
    const description = options.getString("description")?.replace(/\\n/g, "\n");
    const image = options.getString("image");
    const thumbnail = options.getString("thumbnail");
    const color = options.getString("color") || 0x000000;

    if (image) {
      if (!image.startsWith("http")) {
        return await interaction.deferReply({
          content: "Pleas enter a image url",
        });
      }
    }

    if (thumbnail) {
      if (!thumbnail.startsWith("http")) {
        return await interaction.deferReply({
          content: "Please enter a thumbnail url",
        });
      }
    }

    const embed = new EmbedBuilder();
    addEmbedValue(embed, "setTitle", title);
    addEmbedValue(embed, "setDescription", description);
    addEmbedValue(embed, "setColor", color);
    addEmbedValue(embed, "setImage", image);
    addEmbedValue(embed, "setThumbnail", thumbnail);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("send_embed")
          .setStyle(ButtonStyle.Success)
          .setLabel("Senden")
          .setEmoji("✅")
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId("delete_embed")
          .setStyle(ButtonStyle.Danger)
          .setLabel("Löschen")
          .setEmoji("❌")
      );

    try {
      await interaction
        .editReply({
          embeds: [embed],
          components: [row],
          ephemeral: true,
        })
        .then(() => {
          const collector = interaction.channel.createMessageComponentCollector(
            {
              time: 60000,
            }
          );
          collectors.set(userId, collector);

          collector.on("collect", async (buttonInteraction) => {
            await buttonInteraction.deferUpdate();

            if (buttonInteraction.customId === "send_embed") {
              return channel.send({
                embeds: [embed],
                components: [],
                ephemeral: false,
              });
            } else if (buttonInteraction.customId === "delete_embed") {
              await deleteEmbed(interaction);
            }

            collector.stop();
            collectors.delete(userId);
          });

          collector.on("end", async () => {
            await deleteEmbed(interaction);
          });

          async function deleteEmbed(interaction) {
            embed.setTitle("Abgebrochen");
            embed.setDescription("**Die Embed Erstellung wurde Abgebrochen**");
            await interaction.editReply({
              embeds: [embed],
              components: [],
              ephemeral: true,
            });
          }
        });
    } catch (e) {
      const embed = new EmbedBuilder()
        .setTitle("Fehler")
        .setDescription(
          "Der Embed konnte nicht erstellt werden. Bitte überprüfen Sie, ob alle Angaben korrekt sind."
        )
        .setColor("FF0000")
        .setTimestamp();
      interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
      collectors.delete(userId);
    }
  },
};
