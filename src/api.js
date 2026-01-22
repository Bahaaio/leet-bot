const { LeetCode } = require("leetcode-query");
const { LEETCODE_BASE_URL } = require("./constants");

const lc = new LeetCode();

/**
 * featches a random problem from LeetCode.
 *
 * @param {string?} difficulty - the random problem difficulty
 * @returns {Object} An object containing details of the random problem:
 */
module.exports = {
  async getRandomProblem(difficulty) {
    const response = await lc.graphql({
      query: `
query ($categorySlug: String, $filters: QuestionListFilterInput) {
  question: randomQuestion(categorySlug: $categorySlug, filters: $filters) {
    slug: titleSlug
    questionFrontendId
    title
    difficulty
    likes
    dislikes
    tags: topicTags {
      slug
    }
  }
}`,
      variables: {
        categorySlug: "",
        filters: {
          difficulty: difficulty?.toUpperCase(),
        },
      },
    });

    const problem = response.data.question;

    return {
      url: `${LEETCODE_BASE_URL}/problems/${problem.slug}/`,
      id: problem.questionFrontendId,
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags.map(obj => obj.slug),
      likes: problem.likes,
      dislikes: problem.dislikes,
    };
  },

  /**
   * fetches the daily coding problem from LeetCode.
   * @returns {Object} An object containing details of the daily problem:
   */
  async getDailyProblem() {
    const response = await lc.graphql({
      query: `
query {
  daily: activeDailyCodingChallengeQuestion {
    link
    question {
      questionFrontendId
      title
      difficulty
      likes
      dislikes
      tags: topicTags {
        slug
      }
    }
  }
}`,
    });

    const data = response.data.daily;
    const problem = data.question;

    return {
      url: `${LEETCODE_BASE_URL}${data.link}`,
      id: problem.questionFrontendId,
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags.map(obj => obj.slug),
      likes: problem.likes,
      dislikes: problem.dislikes,
    };
  },
};
