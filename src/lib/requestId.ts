let sequence = 0;

export function createActionId(prefix: string) {
  sequence += 1;
  return `${prefix}-${sequence.toString(36).padStart(4, '0')}`;
}

export function resetActionIdsForTests() {
  sequence = 0;
}
