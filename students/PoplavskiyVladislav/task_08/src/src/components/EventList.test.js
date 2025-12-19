const EventList = require('./EventList');

// Mock fetch
global.fetch = jest.fn();

describe('EventList', () => {
  let eventList;
  let mockContainer;

  beforeEach(() => {
    mockContainer = {
      innerHTML: ''
    };
    document.getElementById = jest.fn(() => mockContainer);
    eventList = new EventList('events-container');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should load and render events', async () => {
    const mockEvents = [
      { id: '1', title: 'Test Event', date: '2024-12-15', time: '18:00', location: 'Online', description: 'Test', attendees: 10 }
    ];

    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockEvents)
    });

    await eventList.loadEvents();

    expect(fetch).toHaveBeenCalledWith('/api/events');
    expect(mockContainer.innerHTML).toContain('Test Event');
  });

  test('should handle fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await eventList.loadEvents();

    expect(mockContainer.innerHTML).toContain('Failed to load events');
  });

  test('should render empty state', async () => {
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce([])
    });

    await eventList.loadEvents();

    expect(mockContainer.innerHTML).toContain('No events scheduled');
  });
});