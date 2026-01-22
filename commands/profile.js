const { SlashCommandBuilder } = require("discord.js");
const { getUser } = require("../src/api");
const { embedUser } = require("../src/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Get LeetCode user profile")
    .addStringOption(option =>
      option
        .setName("username")
        .setDescription("LeetCode username")
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString("username");

    const user = await getUser(username);
    const embed = embedUser(user);

    await interaction.reply({ embeds: [embed] });
  },
};
