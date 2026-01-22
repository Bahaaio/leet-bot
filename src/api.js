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
          premiumOnly: false,
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

  /**
   * fetches user information from LeetCode.
   * @param {string} username - the LeetCode username
   * @returns {Object} An object containing details of the user
   */
  async getUser(username) {
    const response = await lc.graphql({
      query: `
query ($username: String!) {
  matchedUser(username: $username) {
    username
    githubUrl
    linkedinUrl
    twitterUrl
    userCalendar {
      streak
      totalActiveDays
    }
    profile {
      realName
      userAvatar
      skillTags
      ranking
      aboutMe
    }
    submitStats {
        acSubmissionNum {
            difficulty
            count
            submissions
        }
        totalSubmissionNum {
            difficulty
            count
            submissions
        }
    }
  }
}`,
      variables: { username },
    });

    const user = response.data.matchedUser;

    const solved = user.submitStats.acSubmissionNum.filter(
      obj => obj.difficulty !== "All"
    );

    return {
      username: user.username,
      real_name: user.profile.realName,
      about: user.profile.aboutMe,
      avatar: user.profile.userAvatar,
      skill_tags: user.profile.skillTags,
      ranking: user.profile.ranking,

      streak: user.userCalendar.streak,
      total_active_days: user.userCalendar.totalActiveDays,
      solved: solved,

      githubUrl: user.githubUrl,
      linkedinUrl: user.linkedinUrl,
      twitterUrl: user.twitterUrl,
    };
  },
};
