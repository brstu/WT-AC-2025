class EventList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.events = [];
    this.loadEvents();
  }

  async loadEvents() {
    try {
      const response = await fetch('/api/events');
      this.events = await response.json();
      this.render();
    } catch (error) {
      console.error('Error loading events:', error);
      this.renderError();
    }
  }

  render() {
    if (this.events.length === 0) {
      this.container.innerHTML = '<p class="no-events">No events scheduled</p>';
      return;
    }

    this.container.innerHTML = `
      <h2>Upcoming Events (${this.events.length})</h2>
      <div class="events-grid">
        ${this.events.map(event => `
          <div class="event-card" data-id="${event.id}">
            <h3>${event.title}</h3>
            <p class="event-date">📅 ${event.date} at ${event.time}</p>
            <p class="event-location">📍 ${event.location}</p>
            <p class="event-description">${event.description}</p>
            <div class="event-footer">
              <span class="attendees">👥 ${event.attendees} attendees</span>
              <button class="delete-btn" onclick="eventList.deleteEvent('${event.id}')">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderError() {
    this.container.innerHTML = `
      <div class="error">
        <p>Failed to load events. Please try again later.</p>
        <button onclick="eventList.loadEvents()">Retry</button>
      </div>
    `;
  }

  async deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      this.events = this.events.filter(event => event.id !== id);
      this.render();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  }
}

// Для тестирования
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventList;
}