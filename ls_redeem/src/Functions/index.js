const { EmbedBuilder } = require("discord.js");
const { addEmbedValue, getLocales, readConfig } = require("ls_bots.js");
const Database = require("../Database");

async function genCode() {
  const config = await readConfig();
  const possibilities = config.CodeSettings.Possibilities;
  let text = "";

  for (let i = 0; i < 17; i++) {
    text += possibilities.charAt(
      Math.floor(Math.random() * possibilities.length)
    );
  }

  return text;
}

async function createRedeem(interaction, options) {
  const locals = await getLocales(interaction);
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
  } = locals.RedeemEmbed;

  await Database.createCode(options).catch((err) => null);

  const embed = new EmbedBuilder();
  addEmbedValue(embed, "setAuthor", author, authorUrl);
  addEmbedValue(embed, "setTitle", title);
  addEmbedValue(
    embed,
    "setDescription",
    description.replace("%code%", options.code)
  );
  addEmbedValue(embed, "setColor", color);
  addEmbedValue(embed, "setThumbnail", thumbnail);
  addEmbedValue(embed, "setImage", image);
  addEmbedValue(embed, "setFooter", footer, footerUrl);

  return interaction.editReply({ embeds: [embed] });
}

module.exports = { genCode, createRedeem };
