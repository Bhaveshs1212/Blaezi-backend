/**
 * Project Controller
 * 
 * PURPOSE: Handle GitHub project syncing and tracking
 * 
 * ENDPOINTS:
 * - GET /api/projects          - Get user's projects
 * - POST /api/projects/sync    - Sync from GitHub (now uses GitHub username)
 * - GET /api/projects/github/:username - Fetch projects directly from GitHub
 * - GET /api/projects/:id      - Get single project
 * - PATCH /api/projects/:id    - Update project tracking
 * - DELETE /api/projects/:id   - Remove project
 * - GET /api/projects/stats    - Get statistics
 */

const Project = require('../models/Project');
const githubService = require('../services/githubService');
const User = require('../models/User');

/**
 * GET /api/projects
 * 
 * Get all projects for user with optional filters
 */
exports.getUserProjects = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    
    const { status, starred, language } = req.query;
    
    let filters = {};
    if (status) filters.status = status;
    if (starred !== undefined) filters.starred = starred === 'true';
    if (language) filters.language = language;
    
    const projects = await Project.getUserProjects(userId, filters);
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
    
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

/**
 * GET /api/projects/:id
 * 
 * Get single project by ID
 */
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
    
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
};

/**
 * GET /api/projects/github/:username
 * 
 * Fetch repositories directly from GitHub for a given username
 * This returns live data from GitHub API without saving to database
 * 
 * QUERY PARAMS:
 * - language: Filter by programming language
 * - minStars: Minimum number of stars
 * - excludeForks: true/false
 * - onlyPublic: true/false
 */
exports.fetchFromGitHub = async (req, res) => {
  try {
    const { username } = req.params;
    const { language, minStars, excludeForks, onlyPublic } = req.query;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'GitHub username is required'
      });
    }
    
    // Build filters
    const filters = {};
    if (language) filters.language = language;
    if (minStars) filters.minStars = parseInt(minStars);
    if (excludeForks) filters.excludeForks = excludeForks === 'true';
    if (onlyPublic) filters.onlyPublic = onlyPublic === 'true';
    
    // Fetch from GitHub
    const result = await githubService.searchUserRepositories(username, filters);
    
    res.json({
      success: true,
      count: result.count,
      data: result.data,
      username: result.username,
      source: 'GitHub API'
    });
    
  } catch (error) {
    console.error('Error fetching from GitHub:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch repositories from GitHub',
      error: error.message
    });
  }
};

/**
 * POST /api/projects/sync
 * 
 * Sync projects from GitHub by username and save to database
 * 
 * BODY:
 * {
 *   "githubUsername": "username",
 *   "filters": {
 *     "language": "JavaScript",
 *     "minStars": 5,
 *     "excludeForks": true
 *   }
 * }
 */
exports.syncFromGitHub = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    
    const { githubUsername, filters } = req.body;
    
    if (!githubUsername) {
      return res.status(400).json({
        success: false,
        message: 'GitHub username is required'
      });
    }
    
    console.log('Syncing GitHub repos for user:', githubUsername);
    console.log('Filters:', filters);
    
    // Fetch repositories from GitHub
    const result = await githubService.searchUserRepositories(
      githubUsername, 
      filters || {}
    );
    
    console.log('Fetched repos count:', result.count);
    const githubRepos = result.data;
    
    if (githubRepos.length === 0) {
      console.log('No repos found for username:', githubUsername);
      return res.status(404).json({
        success: false,
        message: `No public repositories found for GitHub user "${githubUsername}". Make sure the username is correct and the user has public repositories.`,
        count: 0,
        data: [],
        username: githubUsername
      });
    }
    
    const syncedProjects = [];
    const errors = [];
    
    // Save each repository to database
    for (const repo of githubRepos) {
      try {
        console.log('Processing repo:', repo.name);
        console.log('Repo data:', JSON.stringify(repo, null, 2));
        
        // Convert our camelCase format to GitHub API format for the model
        const githubApiFormat = {
          id: repo.githubId,
          name: repo.name,
          full_name: repo.fullName,
          description: repo.description,
          html_url: repo.url,
          homepage: repo.homepage,
          language: repo.language,
          stargazers_count: repo.stars,
          forks_count: repo.forks,
          private: repo.isPrivate,
          topics: repo.topics,
          created_at: repo.createdAt,
          updated_at: repo.updatedAt,
          pushed_at: repo.pushedAt  // Use pushed_at for last commit time
        };
        
        console.log('GitHub API format:', JSON.stringify(githubApiFormat, null, 2));
        console.log('Calling Project.syncFromGitHub with userId:', userId);
        
        const project = await Project.syncFromGitHub(userId, githubApiFormat);
        console.log('✅ Successfully synced:', repo.name);
        syncedProjects.push(project);
      } catch (repoError) {
        console.error('❌ Error syncing repo:', repo.name);
        console.error('Error details:', repoError);
        console.error('Error stack:', repoError.stack);
        errors.push({ 
          repo: repo.name, 
          error: repoError.message,
          stack: repoError.stack 
        });
      }
    }
    
    // Update user's GitHub username if not already set
    await User.findByIdAndUpdate(userId, { githubUsername }, { new: true });
    
    console.log('Successfully synced', syncedProjects.length, 'projects');
    
    if (syncedProjects.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'All repositories failed to sync. Check backend logs for details.',
        count: 0,
        data: [],
        errors: errors,
        username: githubUsername
      });
    }
    
    res.json({
      success: true,
      message: `Successfully synced ${syncedProjects.length} projects from GitHub`,
      count: syncedProjects.length,
      data: syncedProjects,
      errors: errors.length > 0 ? errors : undefined,
      username: githubUsername
    });
    
  } catch (error) {
    console.error('Error syncing projects:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync projects from GitHub',
      error: error.message
    });
  }
};

/**
 * PATCH /api/projects/:id
 * 
 * Update project tracking fields
 * 
 * BODY:
 * {
 *   "status": "completed",
 *   "progress": 100,
 *   "notes": "Finished all features",
 *   "techStack": ["React", "Node.js"],
 *   "starred": true
 * }
 */
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const { status, progress, notes, techStack, starred } = req.body;
    
    if (status) project.status = status;
    if (progress !== undefined) project.progress = progress;
    if (notes !== undefined) project.notes = notes;
    if (techStack) project.techStack = techStack;
    if (starred !== undefined) project.starred = starred;
    
    await project.save();
    
    res.json({
      success: true,
      data: project
    });
    
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
};

/**
 * DELETE /api/projects/:id
 * 
 * Remove project from tracking (soft delete)
 */
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Soft delete: set isActive to false
    project.isActive = false;
    await project.save();
    
    res.json({
      success: true,
      message: 'Project removed from tracking'
    });
    
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};

/**
 * GET /api/projects/stats
 * 
 * Get project statistics
 */
exports.getProjectStats = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    
    const stats = await Project.getUserStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * GET /api/projects/starred
 * 
 * Get starred/favorite projects
 */
exports.getStarredProjects = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    
    const projects = await Project.getUserProjects(userId, { starred: true });
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
    
  } catch (error) {
    console.error('Error fetching starred projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch starred projects',
      error: error.message
    });
  }
};
