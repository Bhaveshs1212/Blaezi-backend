/**
 * Career Event Controller
 * 
 * PURPOSE: Handle career event tracking and preparation
 * 
 * ENDPOINTS:
 * - GET /api/career             - Get all events
 * - GET /api/career/upcoming    - Get upcoming events
 * - GET /api/career/past        - Get past events
 * - GET /api/career/stats       - Get statistics
 * - POST /api/career            - Create new event
 * - GET /api/career/:id         - Get single event
 * - PATCH /api/career/:id       - Update event
 * - DELETE /api/career/:id      - Delete event
 * - POST /api/career/:id/steps  - Add preparation step
 * - PATCH /api/career/:id/steps/:stepId - Toggle step completion
 */

const CareerEvent = require('../models/CareerEvent');

/**
 * GET /api/career
 * 
 * Get all events with optional filters
 */
exports.getAllEvents = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    
    const { type, status, starred, includeArchived } = req.query;
    
    let events;
    
    if (type) {
      events = await CareerEvent.getEventsByType(userId, type);
    } else if (starred === 'true') {
      events = await CareerEvent.getStarredEvents(userId);
    } else {
      events = await CareerEvent.getUserEvents(userId, includeArchived === 'true');
    }
    
    // Filter by status if provided
    if (status && events) {
      events = events.filter(e => e.status === status);
    }
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

/**
 * GET /api/career/upcoming
 * 
 * Get upcoming events
 */
exports.getUpcomingEvents = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    
    const events = await CareerEvent.getUpcomingEvents(userId, limit);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
    
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events',
      error: error.message
    });
  }
};

/**
 * GET /api/career/past
 * 
 * Get past events
 */
exports.getPastEvents = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    
    const events = await CareerEvent.getPastEvents(userId);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
    
  } catch (error) {
    console.error('Error fetching past events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch past events',
      error: error.message
    });
  }
};

/**
 * GET /api/career/stats
 * 
 * Get event statistics
 */
exports.getEventStats = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    
    const stats = await CareerEvent.getUserStats(userId);
    
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
 * POST /api/career
 * 
 * Create new event
 * 
 * BODY:
 * {
 *   "title": "Google Interview",
 *   "description": "Final round",
 *   "type": "interview",
 *   "date": "2026-02-15",
 *   "priority": "high",
 *   "company": "Google",
 *   "location": "Virtual",
 *   "preparationSteps": [
 *     { "title": "Review system design" },
 *     { "title": "Practice coding" }
 *   ]
 * }
 */
exports.createEvent = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    
    const {
      title,
      description,
      type,
      date,
      status,
      completed,  // Frontend might send boolean 'completed'
      priority,
      company,
      location,
      url,
      preparationSteps,
      preparation,  // Frontend might send 'preparation' instead of 'preparationSteps'
      notes,
      starred
    } = req.body;
    
    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: 'Title and date are required'
      });
    }
    
    // Handle completed boolean -> status conversion
    let eventStatus = status;
    if (completed !== undefined && !status) {
      eventStatus = completed ? 'completed' : 'upcoming';
    }
    
    // Handle preparation vs preparationSteps
    const steps = preparationSteps || preparation || [];
    
    // Validate and normalize event type
    const validTypes = ['interview', 'deadline', 'goal', 'milestone', 'networking', 'other'];
    let eventType = type ? type.toLowerCase() : 'other';
    if (!validTypes.includes(eventType)) {
      // Map common variations
      if (['exam', 'test', 'assessment'].includes(eventType)) {
        eventType = 'milestone';
      } else {
        eventType = 'other';
      }
    }
    
    const event = await CareerEvent.create({
      userId,
      title,
      description,
      type: eventType,
      date,
      status: eventStatus,
      priority,
      company,
      location,
      url,
      preparationSteps: steps,
      notes,
      starred
    });
    
    res.status(201).json({
      success: true,
      data: event
    });
    
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

/**
 * GET /api/career/:id
 * 
 * Get single event by ID
 */
exports.getEventById = async (req, res) => {
  try {
    const event = await CareerEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
    
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

/**
 * PATCH /api/career/:id
 * 
 * Update event
 */
exports.updateEvent = async (req, res) => {
  try {
    const event = await CareerEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const {
      title,
      description,
      type,
      date,
      status,
      priority,
      company,
      location,
      url,
      notes,
      outcome,
      starred,
      isArchived
    } = req.body;
    
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (type) event.type = type;
    if (date) event.date = date;
    if (status) event.status = status;
    if (priority) event.priority = priority;
    if (company !== undefined) event.company = company;
    if (location !== undefined) event.location = location;
    if (url !== undefined) event.url = url;
    if (notes !== undefined) event.notes = notes;
    if (outcome !== undefined) event.outcome = outcome;
    if (starred !== undefined) event.starred = starred;
    if (isArchived !== undefined) event.isArchived = isArchived;
    
    await event.save();
    
    res.json({
      success: true,
      data: event
    });
    
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

/**
 * DELETE /api/career/:id
 * 
 * Delete event
 */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await CareerEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user owns this event
    if (event.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }
    
    await CareerEvent.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

/**
 * POST /api/career/:id/steps
 * 
 * Add preparation step to event
 * 
 * BODY:
 * {
 *   "title": "Review system design",
 *   "description": "Study scaling patterns"
 * }
 */
exports.addPreparationStep = async (req, res) => {
  try {
    const event = await CareerEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Step title is required'
      });
    }
    
    event.addPreparationStep(title, description);
    await event.save();
    
    res.json({
      success: true,
      data: event
    });
    
  } catch (error) {
    console.error('Error adding step:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add step',
      error: error.message
    });
  }
};

/**
 * PATCH /api/career/:id/steps/:stepId
 * 
 * Toggle step completion
 * 
 * BODY:
 * {
 *   "isCompleted": true
 * }
 */
exports.toggleStepCompletion = async (req, res) => {
  try {
    const event = await CareerEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const { isCompleted } = req.body;
    
    if (isCompleted) {
      event.completeStep(req.params.stepId);
    } else {
      event.uncompleteStep(req.params.stepId);
    }
    
    await event.save();
    
    res.json({
      success: true,
      data: event
    });
    
  } catch (error) {
    console.error('Error toggling step:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle step',
      error: error.message
    });
  }
};

/**
 * DELETE /api/career/:id/steps/:stepId
 * 
 * Delete a preparation step from an event
 */
exports.deletePreparationStep = async (req, res) => {
  try {
    const event = await CareerEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user owns this event
    if (event.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this event'
      });
    }
    
    // Find and remove the step
    const stepIndex = event.preparationSteps.findIndex(
      step => step._id.toString() === req.params.stepId
    );
    
    if (stepIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Preparation step not found'
      });
    }
    
    event.preparationSteps.splice(stepIndex, 1);
    await event.save();
    
    res.json({
      success: true,
      message: 'Preparation step deleted successfully',
      data: event
    });
    
  } catch (error) {
    console.error('Error deleting preparation step:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete preparation step',
      error: error.message
    });
  }
};
