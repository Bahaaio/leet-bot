const { LeetCode } = require("leetcode-query");
const {
  LEETCODE_BASE_URL,
  NEETCODE_GH_BASE_URL,
  NEETCODE_GH_API_URL,
} = require("./constants");

const lc = new LeetCode();
const solutionCache = {};
let dailyCache = {};

/**
 * @typedef LeetCodeUser
 * @property {string} username - the LeetCode username
 * @property {string} real_name - the real name of the user
 * @property {string} about - the about me section of the user
 * @property {string} avatar - the URL of the user's avatar
 * @property {string[]} skill_tags - the skill tags of the user
 * @property {number} ranking - the ranking of the user
 * @property {number} streak - the current streak of the user
 * @property {number} total_active_days - the total active days of the user
 * @property {SolvedCount[]} solved - array of objects containing solved problem counts by difficulty
 * @property {string?} githubUrl - the GitHub URL of the user
 * @property {string?} linkedinUrl - the LinkedIn URL of the user
 * @property {string?} twitterUrl - the Twitter URL of the user
 */

/**
 * @typedef SolvedCount
 * @property {string} difficulty - "Easy" | "Medium" | "Hard"
 * @property {number} count - Number of problems solved
 */

/**
 * @typedef LeetCodeProblem
 * @property {string} url - the URL of the problem
 * @property {string} id - the frontend ID of the problem
 * @property {string} title - the title of the problem
 * @property {string} difficulty - the difficulty of the problem
 * @property {string[]} tags - array of tags associated with the problem
 * @property {number} likes - number of likes for the problem
 * @property {number} dislikes - number of dislikes for the problem
 */

/**
 * @typedef ProblemSolution
 * @property {string} problemUrl - the problem URL
 * @property {string} problemSlug - the problem slug
 * @property {string} code - the solution code as a string
 */

/**
 * @typedef SolutionDetails
 * @property {string} url - the solution file URL
 * @property {string} problemSlug - the problem slug
 */

module.exports = {
  /**
   * featches a random problem from LeetCode.
   * @param {string?} difficulty - the random problem difficulty
   * @returns {Promise<LeetCodeProblem>} An object containing details of the random problem
   */
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
   * @returns {Promise<LeetCodeProblem>} An object containing details of the daily problem:
   */
  async getDailyProblem() {
    const today = new Date().toISOString().split("T")[0];
    if (dailyCache[today]) {
      const ret = dailyCache[today];

      // delete all other days
      dailyCache = {};
      dailyCache[today] = ret;

      return ret;
    }

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

    const ret = {
      url: `${LEETCODE_BASE_URL}${data.link}`,
      id: problem.questionFrontendId,
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags.map(obj => obj.slug),
      likes: problem.likes,
      dislikes: problem.dislikes,
    };

    dailyCache[today] = ret;
    return ret;
  },

  /**
   * fetches user information from LeetCode.
   * @param {string} username - the LeetCode username
   * @returns {Promise<LeetCodeUser>} An object containing details of the user
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

  /**
   * fetches the solution code for a given problem and language from LeetCode.
   * @param {string} problemId - the frontend ID of the problem
   * @param {string} language - the programming language for the solution
   * @returns {Promise<ProblemSolution>} An object containing the problem solution details
   */
  async getProblemSolution(problemId, language) {
    const id = problemId.padStart(4, "0");
    const { url, problemSlug } = await getSolutionData(id, language);

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(
        `Failed to fetch solution from NeetCode GitHub repository: ${res.status} ${res.statusText}`
      );
    }

    const code = await res.text();
    const problemUrl = `${LEETCODE_BASE_URL}/problems/${problemSlug}/`;

    return {
      problemSlug,
      problemUrl,
      code,
    };
  },
};

/**
 * fetches the problem solution Url for a given problem.
 * @param {string} problemId - the 0 padded frontend ID of the problem
 * @param {string} language - the programming language for the solution
 * @returns {Promise<SolutionDetails>} An object containing the solution URL and problem slug
 */
async function getSolutionData(problemId, language) {
  let files;

  if (solutionCache[language]) {
    files = solutionCache[language];
  } else {
    const res = await fetch(`${NEETCODE_GH_API_URL}/${language}`);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch language directory from NeetCode GitHub repository: ${res.status} ${res.statusText}`
      );
    }

    files = await res.json();
    solutionCache[language] = files;
  }
  const file = files.find(f => f.name.startsWith(problemId));

  if (!file) {
    throw new Error(
      `Solution not found for problem ID ${problemId} in language ${language}`
    );
  }

  const url = `${NEETCODE_GH_BASE_URL}/${language}/${file.name}`;
  const problemSlug = file.name.split(".")[0].substring(5);

  return {
    url,
    problemSlug,
  };
}
