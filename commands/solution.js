const { SlashCommandBuilder } = require("discord.js");
const { getProblemSolution } = require("../src/api");
const { embedSolution } = require("../src/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("solution")
    .setDescription("Provides a solution to a given problem.")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID of the problem to solve")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("language")
        .setDescription("Programming language to use for the solution")
        .addChoices(
          { name: "Python", value: "python" },
          { name: "JavaScript", value: "javascript" },
          { name: "TypeScript", value: "typescript" },
          { name: "Java", value: "java" },
          { name: "Kotlin", value: "kotlin" },
          { name: "C", value: "c" },
          { name: "C++", value: "cpp" },
          { name: "Go", value: "go" },
          { name: "Ruby", value: "ruby" },
          { name: "C#", value: "csharp" },
          { name: "Rust", value: "rust" },
          { name: "Swift", value: "swift" },
          { name: "Dart", value: "dart" }
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    const problemId = interaction.options.getString("id");
    const language = interaction.options.getString("language") || "javascript";

    try {
      const solution = await getProblemSolution(problemId, language);
      const problemTitle = solution.problemSlug
        .replace("-", " ")
        .replace(/\b\w/g, c => c.toUpperCase());

      const embed = embedSolution(
        solution.code,
        language,
        solution.problemUrl,
        problemTitle,
        problemId
      );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "Couldn't find a solution for that problem in the specified language."
      );
    }
  },
};
