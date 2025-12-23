/**
 * MemeCard component for displaying individual memes
 */
class MemeCard {
  constructor(meme) {
    this.meme = meme;
  }

  render() {
    return `
      <div class="meme-card" data-id="${this.meme.id}">
        <img src="${this.meme.url}" alt="${this.meme.name}" class="meme-image">
        <div class="meme-content">
          <h3 class="meme-title">${this.meme.name}</h3>
          <p class="meme-description">${this.meme.description}</p>
          <div class="meme-stats">
            <span class="likes">❤️ ${this.meme.likes}</span>
            <span class="views">👁️ ${this.meme.views}</span>
          </div>
          <div class="meme-tags">
            ${this.meme.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create meme card element
   * @returns {HTMLElement}
   */
  createElement() {
    const div = document.createElement('div');
    div.className = 'meme-card';
    div.setAttribute('data-id', this.meme.id);
    
    div.innerHTML = `
      <img src="${this.meme.url}" alt="${this.meme.name}" class="meme-image">
      <div class="meme-content">
        <h3 class="meme-title">${this.meme.name}</h3>
        <p class="meme-description">${this.meme.description}</p>
        <div class="meme-stats">
          <button class="like-button">❤️ <span class="like-count">${this.meme.likes}</span></button>
          <span class="views">👁️ ${this.meme.views}</span>
        </div>
        <div class="meme-tags">
          ${this.meme.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
        </div>
      </div>
    `;
    
    return div;
  }
}

module.exports = MemeCard;