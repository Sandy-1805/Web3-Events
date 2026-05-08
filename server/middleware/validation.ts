export function validateRequiredFields(body: any, fields: string[]): string | null {
  for (const field of fields) {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      return `Le champ "${field}" est requis`;
    }
  }
  return null;
}

export function validateEventData(body: any): string | null {
  if (!body.title) return 'Le titre est requis';
  if (!body.startDate) return 'La date de début est requise';
  if (!body.endDate) return 'La date de fin est requise';
  return null;
}

export function validateSessionData(body: any): string | null {
  if (!body.title) return 'Le titre est requis';
  if (!body.startTime) return 'L\'heure de début est requise';
  if (!body.endTime) return 'L\'heure de fin est requise';
  if (!body.room) return 'La salle est requise';
  if (!body.eventId) return 'L\'événement est requis';
  return null;
}

export function validateSpeakerData(body: any): string | null {
  if (!body.name) return 'Le nom est requis';
  return null;
}

export function validateQuestionData(body: any): string | null {
  if (!body.content || body.content.trim() === '') {
    return 'La question ne peut pas être vide';
  }
  return null;
}

export function sanitizeBody(body: any): any {
  const sanitized = { ...body };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim().replace(/[<>]/g, '');
    }
  }
  return sanitized;
}