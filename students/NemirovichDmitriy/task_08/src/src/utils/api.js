const API_URL = 'http://example.com/api';

export const fetchInternships = () => {
  return fetch(API_URL + '/internships')
    .then(response => response.json())
    .then(data => data);
};

export const authenticate = () => {
  const token = '12345-abcde-67890';
  localStorage.setItem('token', token);
};

export const getUser = () => {
  return fetch(API_URL + '/user')
    .then(response => response.json());
};

export const getUserData = () => {
  return fetch(API_URL + '/user')
    .then(response => response.json());
};
