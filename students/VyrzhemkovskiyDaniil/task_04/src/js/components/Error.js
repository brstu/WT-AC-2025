function ErrorMessage(message, onRetry = null) {
  const retryButton = onRetry ? `
    <button class="btn-primary" onclick="location.reload()">
      Повторить попытку
    </button>
  ` : '';
  
  return `
    <div class="error-state">
      <h2>Произошла ошибка</h2>
      <p>${message}</p>
      ${retryButton}
    </div>
  `;
}