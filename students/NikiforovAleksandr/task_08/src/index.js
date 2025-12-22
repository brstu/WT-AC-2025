// Client-side JavaScript for memes gallery
class MemesGallery {
  constructor() {
    this.baseUrl = '/api';
    this.memesContainer = document.getElementById('memes-container');
    this.searchInput = document.getElementById('search-input');
    this.searchButton = document.getElementById('search-button');
    this.loadingElement = document.getElementById('loading');
    this.errorElement = document.getElementById('error');
    
    this.initialize();
  }

  initialize() {
    this.loadMemes();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.searchButton.addEventListener('click', () => this.handleSearch());
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });
  }

  async loadMemes(searchTerm = '') {
    this.showLoading();
    this.hideError();

    try {
      const url = searchTerm 
        ? `${this.baseUrl}/memes?search=${encodeURIComponent(searchTerm)}`
        : `${this.baseUrl}/memes`;
      
      const response = await fetch(url);
      const memes = await response.json();
      
      this.displayMemes(memes);
    } catch (error) {
      this.showError('Failed to load memes. Please try again later.');
    } finally {
      this.hideLoading();
    }
  }

  displayMemes(memes) {
    this.memesContainer.innerHTML = '';

    if (memes.length === 0) {
      this.memesContainer.innerHTML = `
        <div class="no-results">
          <h3>No memes found</h3>
          <p>Try a different search term</p>
        </div>
      `;
      return;
    }

    memes.forEach(meme => {
      const memeCard = document.createElement('div');
      memeCard.className = 'meme-card';
      memeCard.innerHTML = `
        <img src="${meme.url}" alt="${meme.name}" class="meme-image">
        <div class="meme-content">
          <h3 class="meme-title">${meme.name}</h3>
          <p class="meme-description">${meme.description}</p>
          <div class="meme-stats">
            <button class="like-button" data-id="${meme.id}">
              ❤️ <span class="like-count">${meme.likes}</span>
            </button>
            <span class="views">👁️ ${meme.views}</span>
          </div>
          <div class="meme-tags">
            ${meme.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
          </div>
        </div>
      `;
      
      this.memesContainer.appendChild(memeCard);
    });

    this.setupLikeButtons();
  }

  setupLikeButtons() {
    document.querySelectorAll('.like-button').forEach(button => {
      button.addEventListener('click', async (e) => {
        const memeId = e.currentTarget.getAttribute('data-id');
        await this.likeMeme(memeId);
      });
    });
  }

  async likeMeme(memeId) {
    try {
      const response = await fetch(`${this.baseUrl}/memes/${memeId}/like`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        const likeCount = document.querySelector(`[data-id="${memeId}"] .like-count`);
        likeCount.textContent = result.likes;
      }
    } catch (error) {
      console.error('Failed to like meme:', error);
    }
  }

  handleSearch() {
    const searchTerm = this.searchInput.value.trim();
    this.loadMemes(searchTerm);
  }

  showLoading() {
    this.loadingElement.style.display = 'block';
  }

  hideLoading() {
    this.loadingElement.style.display = 'none';
  }

  showError(message) {
    this.errorElement.textContent = message;
    this.errorElement.style.display = 'block';
  }

  hideError() {
    this.errorElement.style.display = 'none';
  }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MemesGallery();
});