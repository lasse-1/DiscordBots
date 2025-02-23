const {
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const {
  readConfig,
  addEmbedValue,
  getLocales,
  createLog,
} = require("ls_bots.js");
const { Captcha } = require("captcha-canvas");
const captcha = new Captcha();

module.exports = {
  name: "interactionCreate",
  /**
   * @param {import('discord.js').Interaction} interaction
   */

  async execute(interaction) {
    const { customId, user, member, guild, componentType } = interaction;
    const config = await readConfig();
    const locals = await getLocales(interaction);

    if (componentType !== 2 || customId !== "verify-system") return;
    await interaction.deferReply({ ephemeral: true });

    if (interaction.member.roles.cache.has(config.VerifySystem.Role))
      return interaction.editReply({
        content: locals.VerifySystem.Messages.AlreadyVerified,
      });

    const {
      author,
      authorUrl,
      title,
      description,
      color,
      thumbnail,
      footer,
      footerUrl,
    } = locals.VerifySystem.CapchaMessage;

    if (config.VerifySystem.Captcha) {
      captcha.async = true;
      captcha.addDecoy();
      captcha.drawTrace();
      captcha.drawCaptcha();

      const captchaImage = await captcha.png;

      const embed = new EmbedBuilder();
      addEmbedValue(embed, "setAuthor", author, authorUrl);
      addEmbedValue(embed, "setTitle", title);
      addEmbedValue(embed, "setDescription", description);
      addEmbedValue(embed, "setColor", color);
      addEmbedValue(embed, "setThumbnail", thumbnail);
      addEmbedValue(embed, "setImage", "attachment://captcha.png");
      addEmbedValue(embed, "setFooter", footer, footerUrl);

      try {
        let send;
        const dmChannel = await user.createDM();

        await dmChannel
          .send({
            embeds: [embed],
            files: [
              {
                attachment: captchaImage,
                name: "captcha.png",
              },
            ],
          })
          .then(async () => {
            await interaction.editReply(locals.VerifySystem.Messages.DMMessage);
            send = user;
          })
          .catch(async (e) => {
            await guild.channels
              .create({
                name: `${config.VerifySystem.ChannelName}${user.username}`,
                type: ChannelType.GuildText,
                parent: config.VerifySystem.Category,
                permissionOverwrites: [
                  {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                  },
                  {
                    id: user.id,
                    allow: [
                      PermissionFlagsBits.ViewChannel,
                      PermissionFlagsBits.SendMessages,
                    ],
                  },
                ],
              })
              .then(async (channel) => {
                channel.send({
                  embeds: [embed],
                  files: [
                    {
                      attachment: captchaImage,
                      name: "captcha.png",
                    },
                  ],
                });
                send = channel;
                interaction.editReply(
                  locals.VerifySystem.Messages.ChannelMessage.replace(
                    "%channel%",
                    channel
                  )
                );
              });
          });

        const filter = (m) => m.author.id === user.id;
        let collector;
        if (send.type === 0) {
          collector = send.createMessageCollector({
            filter,
            time: 1 * 60000,
            max: 1,
          });
        } else {
          collector = dmChannel.createMessageCollector({
            filter,
            time: 1 * 60000,
            max: 1,
          });
        }

        collector.on("collect", (userMessage) => {
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
          } =
            userMessage.content === captcha.text
              ? locals.VerifySystem.SuccessMessage
              : locals.VerifySystem.FailureMessage;

          const embed = new EmbedBuilder();
          addEmbedValue(embed, "setAuthor", author, authorUrl);
          addEmbedValue(embed, "setTitle", title);
          addEmbedValue(embed, "setDescription", description);
          addEmbedValue(embed, "setColor", color);
          addEmbedValue(embed, "setThumbnail", thumbnail);
          addEmbedValue(embed, "setImage", image);
          addEmbedValue(embed, "setFooter", footer, footerUrl);

          user.send({ embeds: [embed] });

          if (userMessage.content === captcha.text) {
            member.roles.add(config.VerifySystem.Role);
            createLog({
              interaction: interaction,
              channelId: config.Logs.Verify,
              title: "Verification",
              description: `${user} Successfully Verified`,
            });
            if (send.type === 0) {
              setTimeout(() => {
                send.delete();
              }, 3000);
            } else {
              send.deleteDM();
            }
          } else {
            createLog({
              interaction: interaction,
              channelId: config.Logs.Verify,
              title: "Verification",
              description: `${user} Failure to verify`,
              color: "FF0000",
            });
            if (send.type === 0) {
              setTimeout(() => {
                send.delete();
              }, 3000);
            } else {
              send.deleteDM();
            }
          }
        });
        collector.on("end", (collected, reason) => {
          if (reason === "time") {
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
            } = locals.VerifySystem.FailureMessage;

            const embed = new EmbedBuilder();
            addEmbedValue(embed, "setAuthor", author, authorUrl);
            addEmbedValue(embed, "setTitle", title);
            addEmbedValue(
              embed,
              "setDescription",
              locals.VerifySystem.Messages.TimeError
            );
            addEmbedValue(embed, "setColor", color);
            addEmbedValue(embed, "setThumbnail", thumbnail);
            addEmbedValue(embed, "setImage", image);
            addEmbedValue(embed, "setFooter", footer, footerUrl);

            user.send({ embeds: [embed] });

            if (send.type === 0) {
              setTimeout(() => {
                send.delete();
              }, 3000);
            } else {
              send.deleteDM();
            }
          }
        });
      } catch (e) {}
    }
  },
};
