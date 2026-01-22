const { SlashCommandBuilder } = require("discord.js");
const { getDailyProblem } = require("../src/api");
const { embedProblem } = require("../src/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Get today's problem"),

  async execute(interaction) {
    const problem = await getDailyProblem();
    const embed = embedProblem(problem);

    await interaction.reply({ embeds: [embed] });
  },
};
