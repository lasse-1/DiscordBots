const {
  ChannelType,
  VoiceState,
  Collection,
  Events,
  PermissionFlagsBits,
} = require("discord.js");

const { readConfig } = require("ls_bots.js");
let voiceManager = new Collection();

module.exports = {
  name: Events.VoiceStateUpdate,
  /**
   *
   * @param {VoiceState} newState
   * @param {VoiceState} oldState
   */

  async execute(oldState, newState) {
    const config = await readConfig();
    const { member, guild } = newState;
    const newChannel = newState.channel;
    const oldChannel = oldState.channel;
    const channelId = config.SupportChannel.MoveChannel;
    const channelName = config.SupportChannel.ChannelName || "Support-";

    if (
      oldChannel !== newChannel &&
      newChannel &&
      newChannel.id === channelId
    ) {
      const category =
        config.SupportChannel.ChannelCategory || newChannel.parent;

      const voiceChannel = await guild.channels.create({
        name: `${channelName}${member.user.username}`,
        type: ChannelType.GuildVoice,
        parent: category,
        permissionOverwrites: [
          {
            id: member.id,
            allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
          },
          {
            id: guild.id,
            deny: [PermissionFlagsBits.Connect],
            allow: [PermissionFlagsBits.Stream],
          },
        ],
      });

      voiceManager.set(member.id, voiceChannel.id);
      // for spam protection
      await newChannel.permissionOverwrites.edit(member, { Connect: false });
      setTimeout(() => {
        newChannel.permissionOverwrites.delete(member);
      }, 30 * 1000);

      return setTimeout(() => {
        member.voice.setChannel(voiceChannel).catch((e) => {
          voiceChannel.delete();
        });
      }, 600);
    }

    const jtcChannel = voiceManager.get(member.id);
    const members = oldChannel?.members
      .filter((m) => !m.user.bot)
      .map((m) => m.id);
    if (
      jtcChannel &&
      oldChannel.id === jtcChannel &&
      (!newChannel || newChannel.id !== jtcChannel)
    ) {
      if (members.length > 0) {
        let randomId = members[Math.floor(Math.random() * members.length)];
        let randomMember = guild.members.cache.get(randomId);
        randomMember.voice.setChannel(oldChannel).then((v) => {
          oldChannel.send(
            `Der User ${randomMember} ist nun der owner dieses Chanels ${oldChannel}`
          );
          oldChannel.setName(randomMember.user.username).catch((e) => null);
          oldChannel.permissionOverwrites.edit(randomMember, {
            Connect: true,
            ManageChannels: true,
          });
        });
        voiceManager.set(member.id, null);
        voiceManager.set(randomMember.id, oldChannel.id);
      } else {
        voiceManager.delete(member.id);
        oldChannel.delete().catch((e) => null);
      }
    }
  },
};
