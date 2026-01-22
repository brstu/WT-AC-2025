function Loading(message = 'Загрузка...') {
  return `
    <div class="loading-state">
      <h2>${message}</h2>
      <div style="margin-top: 2rem;">
        <div style="
          width: 50px;
          height: 50px;
          border: 3px solid #2a2a3e;
          border-top-color: #a78bfa;
          border-radius: 50%;
          margin: 0 auto;
          animation: spin 1s linear infinite;
        "></div>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;
}