import { describe, it, expect } from 'vitest';
import notificationReducer, { showNotification, hideNotification } from './notificationSlice';

describe('notificationSlice', () => {
  const initialState = {
    message: '',
    type: '',
    isVisible: false,
  };

  it('should return initial state', () => {
    expect(notificationReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle showNotification with success type', () => {
    const message = 'Operation successful';
    const nextState = notificationReducer(
      initialState,
      showNotification({ message, type: 'success' })
    );
    
    expect(nextState.message).toBe(message);
    expect(nextState.type).toBe('success');
    expect(nextState.isVisible).toBe(true);
  });

  it('should handle showNotification with error type', () => {
    const message = 'An error occurred';
    const nextState = notificationReducer(
      initialState,
      showNotification({ message, type: 'error' })
    );
    
    expect(nextState.message).toBe(message);
    expect(nextState.type).toBe('error');
    expect(nextState.isVisible).toBe(true);
  });

  it('should handle showNotification with default info type', () => {
    const message = 'Information message';
    const nextState = notificationReducer(
      initialState,
      showNotification({ message })
    );
    
    expect(nextState.message).toBe(message);
    expect(nextState.type).toBe('info');
    expect(nextState.isVisible).toBe(true);
  });

  it('should handle hideNotification', () => {
    const visibleState = {
      message: 'Test message',
      type: 'success',
      isVisible: true,
    };
    
    const nextState = notificationReducer(visibleState, hideNotification());
    
    expect(nextState.isVisible).toBe(false);
    expect(nextState.message).toBe('Test message'); // message persists
    expect(nextState.type).toBe('success'); // type persists
  });

  it('should handle multiple showNotification calls', () => {
    let state = notificationReducer(
      initialState,
      showNotification({ message: 'First message', type: 'info' })
    );
    
    expect(state.message).toBe('First message');
    
    state = notificationReducer(
      state,
      showNotification({ message: 'Second message', type: 'error' })
    );
    
    expect(state.message).toBe('Second message');
    expect(state.type).toBe('error');
  });
});
