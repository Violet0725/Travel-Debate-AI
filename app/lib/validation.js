// Input validation utilities

export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export function validateDestination(destination) {
  if (!destination || typeof destination !== 'string') {
    throw new ValidationError('Destination is required', 'destination');
  }
  
  const trimmed = destination.trim();
  
  if (trimmed.length === 0) {
    throw new ValidationError('Destination cannot be empty', 'destination');
  }
  
  if (trimmed.length > 100) {
    throw new ValidationError('Destination must be less than 100 characters', 'destination');
  }
  
  // Basic sanitization - remove any potential script tags
  if (/<script|javascript:/i.test(trimmed)) {
    throw new ValidationError('Invalid destination format', 'destination');
  }
  
  return trimmed;
}

export function validateAgent(agent) {
  const validAgents = ['frugal', 'boujee', 'mediator'];
  
  if (!agent || typeof agent !== 'string') {
    throw new ValidationError('Agent type is required', 'agent');
  }
  
  if (!validAgents.includes(agent)) {
    throw new ValidationError(`Agent must be one of: ${validAgents.join(', ')}`, 'agent');
  }
  
  return agent;
}

export function validateDays(days) {
  const numDays = parseInt(days, 10);
  
  if (isNaN(numDays)) {
    throw new ValidationError('Days must be a number', 'days');
  }
  
  if (numDays < 1 || numDays > 14) {
    throw new ValidationError('Days must be between 1 and 14', 'days');
  }
  
  return numDays;
}

export function validatePreference(preference) {
  const validPreferences = ['frugal', 'boujee', 'mediator'];
  
  if (!preference || typeof preference !== 'string') {
    throw new ValidationError('Preference is required', 'preference');
  }
  
  if (!validPreferences.includes(preference)) {
    throw new ValidationError(`Preference must be one of: ${validPreferences.join(', ')}`, 'preference');
  }
  
  return preference;
}

export function validateItinerary(itinerary) {
  if (!itinerary || typeof itinerary !== 'string') {
    throw new ValidationError('Itinerary is required', 'itinerary');
  }
  
  if (itinerary.trim().length === 0) {
    throw new ValidationError('Itinerary cannot be empty', 'itinerary');
  }
  
  if (itinerary.length > 50000) {
    throw new ValidationError('Itinerary is too long', 'itinerary');
  }
  
  return itinerary;
}

export function validateContext(context) {
  if (context === undefined || context === null) {
    return '';
  }
  
  if (typeof context !== 'string') {
    throw new ValidationError('Context must be a string', 'context');
  }
  
  if (context.length > 10000) {
    throw new ValidationError('Context is too long', 'context');
  }
  
  return context;
}
