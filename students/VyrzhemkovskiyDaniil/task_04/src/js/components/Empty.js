function Empty(message = 'Здесь пока ничего нет', buttonText = null, buttonLink = null) {
  const button = buttonText && buttonLink ? `
    <a href="${buttonLink}" class="btn-primary">${buttonText}</a>
  ` : '';
  
  return `
    <div class="empty-state">
      <h2>${message}</h2>
      <p>Начните добавлять фильмы в вашу библиотеку</p>
      ${button}
    </div>
  `;
}