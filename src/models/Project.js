/**
 * Project Model
 * 
 * PURPOSE: Track projects synced from GitHub
 * 
 * KEY CONCEPTS:
 * - Syncs with GitHub API (not user-created manually)
 * - Stores repo metadata
 * - User adds custom fields (progress, notes, stars)
 * 
 * ARCHITECTURE:
 * Unlike DSA (Master + Progress), Projects use SINGLE MODEL
 * Why? Each user has different projects (no shared catalog)
 * 
 * WORKFLOW:
 * 1. User connects GitHub account (OAuth)
 * 2. Backend fetches repos via GitHub API
 * 3. User selects which repos to track
 * 4. Additional fields for progress tracking
 */

const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  
  // ═══════════════════════════════════════════════════════════
  // USER RELATIONSHIP
  // ═══════════════════════════════════════════════════════════
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // ═══════════════════════════════════════════════════════════
  // GITHUB DATA (from API)
  // ═══════════════════════════════════════════════════════════
  
  /**
   * githubId - Unique repo ID from GitHub
   * Prevents duplicate tracking of same repo
   */
  githubId: {
    type: Number,
    required: true,
    index: true
  },

  /**
   * name - Repository name
   * Example: "my-portfolio", "chat-app"
   */
  name: {
    type: String,
    required: true,
    trim: true
  },

  /**
   * fullName - Full repo name (owner/repo)
   * Example: "john/my-portfolio"
   */
  fullName: {
    type: String,
    required: true
  },

  /**
   * description - Repo description from GitHub
   */
  description: {
    type: String,
    default: ''
  },

  /**
   * url - GitHub repo URL
   */
  url: {
    type: String,
    required: true
  },

  /**
   * homepage - Project's live URL (if any)
   */
  homepage: {
    type: String,
    default: ''
  },

  /**
   * language - Primary programming language
   * Note: Renamed from 'language' to 'programmingLanguage' to avoid MongoDB text index conflict
   */
  programmingLanguage: {
    type: String,
    default: 'Unknown'
  },

  /**
   * languages - All languages used (percentage breakdown)
   * Example: { "JavaScript": 65, "CSS": 25, "HTML": 10 }
   */
  languages: {
    type: Map,
    of: Number,
    default: {}
  },

  /**
   * stars - GitHub stars count
   */
  stars: {
    type: Number,
    default: 0
  },

  /**
   * forks - Fork count
   */
  forks: {
    type: Number,
    default: 0
  },

  /**
   * isPrivate - Is repo private?
   */
  isPrivate: {
    type: Boolean,
    default: false
  },

  /**
   * topics - GitHub topics/tags
   */
  topics: {
    type: [String],
    default: []
  },

  /**
   * createdAt - When repo was created on GitHub
   */
  githubCreatedAt: {
    type: Date
  },

  /**
   * githubUpdatedAt - Last push (commit) to GitHub
   * This uses GitHub's pushed_at field to track actual commit activity
   */
  githubUpdatedAt: {
    type: Date
  },

  // ═══════════════════════════════════════════════════════════
  // USER TRACKING FIELDS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * status - Project completion status
   */
  status: {
    type: String,
    enum: {
      values: ['planning', 'in-progress', 'completed', 'archived'],
      message: '{VALUE} is not a valid status'
    },
    default: 'in-progress'
  },

  /**
   * progress - Completion percentage (0-100)
   */
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  /**
   * notes - Personal notes about the project
   */
  notes: {
    type: String,
    maxlength: 2000
  },

  /**
   * techStack - Technologies used (user can customize)
   */
  techStack: {
    type: [String],
    default: []
  },

  /**
   * starred - Favorite/important projects
   */
  starred: {
    type: Boolean,
    default: false
  },

  /**
   * isActive - Is user actively tracking this project?
   */
  isActive: {
    type: Boolean,
    default: true
  },

  /**
   * lastSyncedAt - When did we last sync with GitHub?
   */
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true,  // createdAt, updatedAt (for tracking in our DB)
  collection: 'projects',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ═══════════════════════════════════════════════════════════
// VIRTUAL FIELDS
// ═══════════════════════════════════════════════════════════

/**
 * daysSinceLastCommit - Calculate days since last GitHub update
 */
ProjectSchema.virtual('daysSinceLastCommit').get(function() {
  if (!this.githubUpdatedAt) return null;
  const now = new Date();
  const lastUpdate = new Date(this.githubUpdatedAt);
  const diffTime = Math.abs(now - lastUpdate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

/**
 * healthScore - Calculate project health (0-100)
 * Based on recent activity
 */
ProjectSchema.virtual('healthScore').get(function() {
  const days = this.daysSinceLastCommit;
  if (days === null) return 50;
  
  if (days <= 7) return 100;      // Active (updated in last week)
  if (days <= 30) return 75;      // Recent (updated in last month)
  if (days <= 90) return 50;      // Moderate (updated in last 3 months)
  if (days <= 180) return 25;     // Old (updated in last 6 months)
  return 10;                      // Stale (no updates in 6+ months)
});

/**
 * healthStatus - Get health status label
 */
ProjectSchema.virtual('healthStatus').get(function() {
  const days = this.daysSinceLastCommit;
  if (days === null) return 'unknown';
  
  if (days <= 7) return 'on-track';
  if (days <= 30) return 'on-track';
  if (days <= 90) return 'at-risk';
  return 'delayed';
});

// ═══════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════

/**
 * UNIQUE: userId + githubId
 * User can't track same repo twice
 */
ProjectSchema.index({ userId: 1, githubId: 1 }, { unique: true });

/**
 * Common queries
 */
ProjectSchema.index({ userId: 1, status: 1 });
ProjectSchema.index({ userId: 1, starred: 1 });
ProjectSchema.index({ userId: 1, isActive: 1 });

/**
 * Text search on name and description
 * Note: Specify 'none' as language to avoid conflict with programming language field
 */
ProjectSchema.index({ name: 'text', description: 'text' }, { default_language: 'none' });

// ═══════════════════════════════════════════════════════════
// INSTANCE METHODS
// ═══════════════════════════════════════════════════════════

/**
 * needsSync() - Check if project needs re-sync from GitHub
 * Re-sync if last sync > 24 hours ago
 */
ProjectSchema.methods.needsSync = function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.lastSyncedAt < oneDayAgo;
};

/**
 * updateFromGitHub() - Update project with fresh GitHub data
 */
ProjectSchema.methods.updateFromGitHub = function(githubData) {
  this.name = githubData.name;
  this.fullName = githubData.full_name;
  this.description = githubData.description || '';
  this.url = githubData.html_url;
  this.homepage = githubData.homepage || '';
  this.programmingLanguage = githubData.language || 'Unknown';
  this.stars = githubData.stargazers_count || 0;
  this.forks = githubData.forks_count || 0;
  this.isPrivate = githubData.private;
  this.topics = githubData.topics || [];
  this.githubCreatedAt = githubData.created_at;
  this.githubUpdatedAt = githubData.pushed_at || githubData.updated_at;  // Use pushed_at for commit time
  this.lastSyncedAt = new Date();
  
  return this;
};

// ═══════════════════════════════════════════════════════════
// STATIC METHODS
// ═══════════════════════════════════════════════════════════

/**
 * getUserProjects() - Get all projects for a user
 */
ProjectSchema.statics.getUserProjects = function(userId, filters = {}) {
  const query = { userId, isActive: true, ...filters };
  return this.find(query).sort({ updatedAt: -1 });
};

/**
 * getProjectsByStatus() - Filter by status
 */
ProjectSchema.statics.getProjectsByStatus = function(userId, status) {
  return this.find({ userId, status, isActive: true })
    .sort({ updatedAt: -1 });
};

/**
 * getStarredProjects() - Get favorites
 */
ProjectSchema.statics.getStarredProjects = function(userId) {
  return this.find({ userId, starred: true, isActive: true })
    .sort({ updatedAt: -1 });
};

/**
 * syncFromGitHub() - Create or update project from GitHub data
 */
ProjectSchema.statics.syncFromGitHub = async function(userId, githubRepoData) {
  const project = await this.findOne({
    userId,
    githubId: githubRepoData.id
  });

  if (project) {
    // Update existing
    project.updateFromGitHub(githubRepoData);
    return await project.save();
  } else {
    // Create new
    return await this.create({
      userId,
      githubId: githubRepoData.id,
      name: githubRepoData.name,
      fullName: githubRepoData.full_name,
      description: githubRepoData.description || '',
      url: githubRepoData.html_url,
      homepage: githubRepoData.homepage || '',
      programmingLanguage: githubRepoData.language || 'Unknown',
      stars: githubRepoData.stargazers_count || 0,
      forks: githubRepoData.forks_count || 0,
      isPrivate: githubRepoData.private,
      topics: githubRepoData.topics || [],
      githubCreatedAt: githubRepoData.created_at,
      githubUpdatedAt: githubRepoData.pushed_at || githubRepoData.updated_at,  // Use pushed_at for commit time
      lastSyncedAt: new Date()
    });
  }
};

/**
 * getUserStats() - Project statistics
 */
ProjectSchema.statics.getUserStats = async function(userId) {
  const projects = await this.find({ userId, isActive: true });
  
  return {
    total: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    archived: projects.filter(p => p.status === 'archived').length,
    starred: projects.filter(p => p.starred).length,
    avgProgress: projects.reduce((sum, p) => sum + p.progress, 0) / projects.length || 0
  };
};

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
