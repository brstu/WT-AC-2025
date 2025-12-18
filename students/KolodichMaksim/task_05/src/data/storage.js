// src/data/storage.js

let events = []; // Массив событий
let registrations = []; // Массив регистраций

let eventIdCounter = 1;
let registrationIdCounter = 1;

// ---------- Работа с событиями (events) ----------

const getAllEvents = () => events;

const addEvent = (eventData) => {
  const newEvent = {
    ...eventData,
    id: eventIdCounter++,
  };
  events.push(newEvent);
  return newEvent;
};

const findEventById = (id) => events.find((e) => e.id === Number(id));

const updateEvent = (id, updateData) => {
  const event = findEventById(id);
  if (event) {
    Object.assign(event, updateData);
  }
  return event;
};

const deleteEvent = (id) => {
  const initialLength = events.length;
  events = events.filter((e) => e.id !== Number(id));
  return events.length < initialLength; // true, если удалено
};

// ---------- Работа с регистрациями (registrations) ----------

const getAllRegistrations = () => registrations;

// Получить все регистрации на конкретное событие
const getRegistrationsByEventId = (eventId) =>
  registrations.filter((r) => r.eventId === Number(eventId));

const addRegistration = (registrationData) => {
  const newRegistration = {
    ...registrationData,
    id: registrationIdCounter++,
  };
  registrations.push(newRegistration);
  return newRegistration;
};

const findRegistrationById = (id) =>
  registrations.find((r) => r.id === Number(id));

const updateRegistration = (id, updateData) => {
  const registration = findRegistrationById(id);
  if (registration) {
    Object.assign(registration, updateData);
  }
  return registration;
};

const deleteRegistration = (id) => {
  const initialLength = registrations.length;
  registrations = registrations.filter((r) => r.id !== Number(id));
  return registrations.length < initialLength;
};

// Экспорт всех функций
module.exports = {
  // Events
  getAllEvents,
  addEvent,
  findEventById,
  updateEvent,
  deleteEvent,

  // Registrations
  getAllRegistrations,
  getRegistrationsByEventId,
  addRegistration,
  findRegistrationById,
  updateRegistration,
  deleteRegistration,
};