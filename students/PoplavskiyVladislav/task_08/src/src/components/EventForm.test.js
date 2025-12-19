const EventForm = require('./EventForm');

describe('EventForm', () => {
  let eventForm;
  let mockForm;

  beforeEach(() => {
    mockForm = {
      addEventListener: jest.fn(),
      reset: jest.fn()
    };
    document.getElementById = jest.fn(() => mockForm);
    eventForm = new EventForm('event-form');
  });

  test('should initialize form', () => {
    expect(mockForm.addEventListener).toHaveBeenCalledWith('submit', expect.any(Function));
  });

  test('should handle form submission', async () => {
    const mockEvent = { preventDefault: jest.fn() };
    const mockFormData = {
      get: jest.fn(key => {
        const data = {
          title: 'Test Event',
          date: '2024-12-15',
          time: '18:00',
          location: 'Online',
          description: 'Test Description',
          attendees: '20'
        };
        return data[key];
      })
    };

    global.FormData = jest.fn(() => mockFormData);
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
    global.alert = jest.fn();

    await eventForm.handleSubmit(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith('/api/events', expect.any(Object));
  });
});