let vac = { title: '', company: '', location: '', salary: '', description: '' };
if (id) vac = await getVacancy(id); // для edit

const html = `
  <form id="vacForm">
    <input name="title" placeholder="Заголовок" value="${vac.title}" required>
    <input name="company" placeholder="Компания" value="${vac.company}" required>
    <input name="location" placeholder="Локация" value="${vac.location}">
    <input name="salary" placeholder="Зарплата" value="${vac.salary}">
    <textarea name="description" required>${vac.description}</textarea>
    <button type="submit" id="submitBtn">Сохранить</button>
  </form>
`;

app.innerHTML = html;

const form = document.getElementById('vacForm');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  const data = Object.fromEntries(new FormData(form));

  try {
    if (id) await updateVacancy(id, data);
    else await createVacancy(data);
    showNotification('Сохранено!');
    router.navigate('/vacancies');
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
  }
});