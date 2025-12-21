import { describe, it, expect } from 'vitest';
import notificationReducer, { showNotification, hideNotification } from './notificationSlice';

describe('notificationSlice', () => {
  const initialState = {
    message: '',
    type: '',
    isVisible: false,
  };

  it('should return the initial state', () => {
    expect(notificationReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle showNotification with message and type', () => {
    const notification = {
      message: 'Success message',
      type: 'success',
    };
    const nextState = notificationReducer(initialState, showNotification(notification));

    expect(nextState.message).toBe('Success message');
    expect(nextState.type).toBe('success');
    expect(nextState.isVisible).toBe(true);
  });

  it('should handle showNotification with default type as info', () => {
    const notification = {
      message: 'Info message',
    };
    const nextState = notificationReducer(initialState, showNotification(notification));

    expect(nextState.message).toBe('Info message');
    expect(nextState.type).toBe('info');
    expect(nextState.isVisible).toBe(true);
  });

  it('should handle hideNotification', () => {
    const visibleState = {
      message: 'Test message',
      type: 'error',
      isVisible: true,
    };
    const nextState = notificationReducer(visibleState, hideNotification());

    expect(nextState.isVisible).toBe(false);
    expect(nextState.message).toBe('Test message'); // message should remain
    expect(nextState.type).toBe('error'); // type should remain
  });

  it('should handle multiple notification types', () => {
    const types = ['success', 'error', 'info', 'warning'];

    types.forEach((type) => {
      const nextState = notificationReducer(
        initialState,
        showNotification({ message: `${type} message`, type })
      );
      expect(nextState.type).toBe(type);
      expect(nextState.isVisible).toBe(true);
    });
  });
});
