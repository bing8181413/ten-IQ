import { createActionId, resetActionIdsForTests } from './requestId';

describe('action ids', () => {
  it('is deterministic for the same action sequence and unique within the sequence', () => {
    resetActionIdsForTests();
    const firstRun = [createActionId('demo'), createActionId('demo')];
    resetActionIdsForTests();
    expect([createActionId('demo'), createActionId('demo')]).toEqual(firstRun);
    expect(new Set(firstRun).size).toBe(2);
  });
});
