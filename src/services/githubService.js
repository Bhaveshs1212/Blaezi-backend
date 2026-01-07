/**
 * GitHub Service
 * 
 * PURPOSE: Fetch user repositories and project information from GitHub API
 * 
 * FEATURES:
 * - Fetch user repositories
 * - Get repository details
 * - Filter by language, stars, etc.
 */

const { Octokit } = require('@octokit/rest');
const axios = require('axios');

/**
 * Create GitHub client (with or without authentication)
 */
const createGitHubClient = (token = null) => {
  if (token) {
    return new Octokit({ auth: token });
  }
  // Without token (public API, limited rate)
  return new Octokit();
};

/**
 * Fetch all repositories for a GitHub user
 * 
 * @param {string} username - GitHub username
 * @param {string} token - Optional GitHub personal access token for higher rate limits
 * @returns {Promise<Array>} List of repositories
 */
const fetchUserRepositories = async (username, token = null) => {
  try {
    const octokit = createGitHubClient(token);
    
    console.log('🔍 Fetching repos from GitHub for user:', username);
    
    // Fetch all repos for the user
    const { data: repos } = await octokit.repos.listForUser({
      username,
      per_page: 100,
      sort: 'updated',
      direction: 'desc'
    });

    console.log(`✓ GitHub API returned ${repos.length} repositories`);
    console.log('First 3 repos:', repos.slice(0, 3).map(r => ({
      name: r.name,
      owner: r.owner.login,
      fullName: r.full_name,
      url: r.html_url
    })));

    // Transform to our format
    const transformedRepos = repos.map(repo => ({
      githubId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || '',
      url: repo.html_url,
      homepage: repo.homepage || '',
      language: repo.language || 'Unknown',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      openIssues: repo.open_issues_count,
      isPrivate: repo.private,
      isFork: repo.fork,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,  // Last commit push time
      size: repo.size,
      topics: repo.topics || [],
      hasWiki: repo.has_wiki,
      hasPages: repo.has_pages,
      defaultBranch: repo.default_branch,
      archived: repo.archived,
      disabled: repo.disabled,
      visibility: repo.visibility
    }));

    return {
      success: true,
      data: transformedRepos,
      count: transformedRepos.length,
      username
    };

  } catch (error) {
    console.error('Error fetching GitHub repos:', error.message);
    
    // Handle specific errors
    if (error.status === 404) {
      throw new Error(`GitHub user "${username}" not found`);
    } else if (error.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please provide a GitHub token.');
    } else {
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  }
};

/**
 * Get detailed information about a specific repository
 * 
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - Optional GitHub token
 * @returns {Promise<Object>} Repository details
 */
const fetchRepositoryDetails = async (owner, repo, token = null) => {
  try {
    const octokit = createGitHubClient(token);
    
    const { data } = await octokit.repos.get({
      owner,
      repo
    });

    return {
      success: true,
      data: {
        githubId: data.id,
        name: data.name,
        fullName: data.full_name,
        description: data.description || '',
        url: data.html_url,
        homepage: data.homepage || '',
        language: data.language || 'Unknown',
        stars: data.stargazers_count,
        forks: data.forks_count,
        watchers: data.watchers_count,
        openIssues: data.open_issues_count,
        isPrivate: data.private,
        isFork: data.fork,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        pushedAt: data.pushed_at,
        size: data.size,
        topics: data.topics || [],
        hasWiki: data.has_wiki,
        hasPages: data.has_pages,
        defaultBranch: data.default_branch,
        archived: data.archived,
        disabled: data.disabled
      }
    };

  } catch (error) {
    console.error('Error fetching repo details:', error.message);
    throw new Error(`Failed to fetch repository details: ${error.message}`);
  }
};

/**
 * Get repository languages (breakdown by percentage)
 * 
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - Optional GitHub token
 * @returns {Promise<Object>} Languages used in the repository
 */
const fetchRepositoryLanguages = async (owner, repo, token = null) => {
  try {
    const octokit = createGitHubClient(token);
    
    const { data } = await octokit.repos.listLanguages({
      owner,
      repo
    });

    // Calculate total bytes
    const totalBytes = Object.values(data).reduce((sum, bytes) => sum + bytes, 0);
    
    // Convert to percentages
    const languages = Object.entries(data).map(([language, bytes]) => ({
      language,
      bytes,
      percentage: ((bytes / totalBytes) * 100).toFixed(2)
    }));

    // Sort by percentage (descending)
    languages.sort((a, b) => b.percentage - a.percentage);

    return {
      success: true,
      data: languages,
      primaryLanguage: languages[0]?.language || 'Unknown'
    };

  } catch (error) {
    console.error('Error fetching repo languages:', error.message);
    return {
      success: false,
      data: [],
      primaryLanguage: 'Unknown'
    };
  }
};

/**
 * Get repository commits (recent activity)
 * 
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} limit - Number of commits to fetch (default: 10)
 * @param {string} token - Optional GitHub token
 * @returns {Promise<Array>} Recent commits
 */
const fetchRepositoryCommits = async (owner, repo, limit = 10, token = null) => {
  try {
    const octokit = createGitHubClient(token);
    
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: limit
    });

    const commits = data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url
    }));

    return {
      success: true,
      data: commits,
      count: commits.length
    };

  } catch (error) {
    console.error('Error fetching commits:', error.message);
    return {
      success: false,
      data: [],
      count: 0
    };
  }
};

/**
 * Get repository README content
 * 
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - Optional GitHub token
 * @returns {Promise<Object>} README content
 */
const fetchRepositoryReadme = async (owner, repo, token = null) => {
  try {
    const octokit = createGitHubClient(token);
    
    const { data } = await octokit.repos.getReadme({
      owner,
      repo
    });

    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    return {
      success: true,
      content,
      downloadUrl: data.download_url,
      htmlUrl: data.html_url
    };

  } catch (error) {
    console.error('Error fetching README:', error.message);
    return {
      success: false,
      content: '',
      message: 'README not found'
    };
  }
};

/**
 * Search repositories by username and filters
 * 
 * @param {string} username - GitHub username
 * @param {Object} filters - Filter options (language, stars, etc.)
 * @param {string} token - Optional GitHub token
 * @returns {Promise<Array>} Filtered repositories
 */
const searchUserRepositories = async (username, filters = {}, token = null) => {
  try {
    const result = await fetchUserRepositories(username, token);
    let repos = result.data;

    // Apply filters
    if (filters.language) {
      repos = repos.filter(repo => 
        repo.language && repo.language.toLowerCase() === filters.language.toLowerCase()
      );
    }

    if (filters.minStars) {
      repos = repos.filter(repo => repo.stars >= filters.minStars);
    }

    if (filters.excludeForks) {
      repos = repos.filter(repo => !repo.isFork);
    }

    if (filters.onlyPublic) {
      repos = repos.filter(repo => !repo.isPrivate);
    }

    if (filters.excludeArchived) {
      repos = repos.filter(repo => !repo.archived);
    }

    return {
      success: true,
      data: repos,
      count: repos.length,
      username
    };

  } catch (error) {
    throw error;
  }
};

/**
 * Validate if a GitHub username exists
 * 
 * @param {string} username - GitHub username
 * @returns {Promise<boolean>} True if user exists
 */
const validateGitHubUsername = async (username) => {
  try {
    const octokit = createGitHubClient();
    await octokit.users.getByUsername({ username });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get GitHub user profile information
 * 
 * @param {string} username - GitHub username
 * @param {string} token - Optional GitHub token
 * @returns {Promise<Object>} User profile
 */
const fetchUserProfile = async (username, token = null) => {
  try {
    const octokit = createGitHubClient(token);
    
    const { data } = await octokit.users.getByUsername({ username });

    return {
      success: true,
      data: {
        login: data.login,
        name: data.name,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        company: data.company,
        location: data.location,
        email: data.email,
        blog: data.blog,
        publicRepos: data.public_repos,
        publicGists: data.public_gists,
        followers: data.followers,
        following: data.following,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        htmlUrl: data.html_url
      }
    };

  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }
};

module.exports = {
  fetchUserRepositories,
  fetchRepositoryDetails,
  fetchRepositoryLanguages,
  fetchRepositoryCommits,
  fetchRepositoryReadme,
  searchUserRepositories,
  validateGitHubUsername,
  fetchUserProfile
};
