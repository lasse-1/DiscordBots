const { SlashCommandBuilder } = require("discord.js");
const { addEmbedValue, getLocales } = require("ls_bots.js");
const Database = require("../../Database");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("available-codes")
    .setDescription("Retrieve a list of all available redemption codes"),

  async execute(interaction) {
    const locals = await getLocales(interaction);
    const { guild, commandName } = interaction;

    if (!guild || commandName !== "available-codes") return;

    await interaction.deferReply({ ephemeral: true });

    const allCodes = await Database.getAllCodes();

    if (!allCodes.length)
      return interaction.editReply({ content: "No codes available" });

    const {
      author,
      authorUrl,
      title,
      description,
      color,
      thumbnail,
      image,
      footer,
      footerUrl,
    } = locals.AvailableCodesEmbed;
    let codes = "";
    let types = "";
    let names = "";

    for (let i = 0; i < allCodes.length; i++) {
      codes += `${allCodes[i].code}\n`;
      types += `${allCodes[i].type}\n`;

      if (allCodes[i].type === "car" && allCodes[i].plate) {
        names += `${allCodes[i].name} (${allCodes[i].plate})\n`;
      } else {
        names += `${allCodes[i].name}\n`;
      }
    }

    const embed = new EmbedBuilder().addFields(
      {
        name: "**Code** ",
        value: `\`${codes}\``,
        inline: true,
      },
      {
        name: "**Type** ",
        value: `${types}`,
        inline: true,
      },
      {
        name: "**Name** ",
        value: `${names}`,
        inline: true,
      }
    );
    addEmbedValue(embed, "setAuthor", author, authorUrl);
    addEmbedValue(embed, "setTitle", title);
    addEmbedValue(embed, "setDescription", description);
    addEmbedValue(embed, "setColor", color);
    addEmbedValue(embed, "setThumbnail", thumbnail);
    addEmbedValue(embed, "setImage", image);
    addEmbedValue(embed, "setFooter", footer, footerUrl);

    return interaction.editReply({ embeds: [embed] });
  },
};
