export class Toast {
    static show(type, title, message, duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">×</button>
        `;
        
        container.appendChild(toast);
        
        toast.querySelector('.toast-close').onclick = () => this.remove(toast);
        
        setTimeout(() => this.remove(toast), duration);
    }
    
    static remove(toast) {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }
    
    static success(message, title = 'Успешно') {
        this.show('success', title, message);
    }
    
    static error(message, title = 'Ошибка') {
        this.show('error', title, message);
    }
    
    static info(message, title = 'Информация') {
        this.show('info', title, message);
    }
    
    static warning(message, title = 'Внимание') {
        this.show('warning', title, message);
    }
}

export class Prefetch {
    static cache = new Map();
    
    static async prefetchPlace(id) {
        if (this.cache.has(id)) return this.cache.get(id);
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`http://localhost:3000/places/${id}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error(`Ошибка ${response.status}`);
            
            const data = await response.json();
            this.cache.set(id, data);
            return data;
        } catch (error) {
            console.warn('Prefetch failed:', error);
            return null;
        }
    }
    
    static clearCache() {
        this.cache.clear();
    }
}

export class Progress {
    static bar = document.getElementById('progressBar');
    
    static start() {
        if (!this.bar) return;
        this.bar.style.width = '30%';
        this.bar.style.transition = 'width 0.3s ease';
    }
    
    static update(percent) {
        if (!this.bar) return;
        this.bar.style.width = `${Math.min(percent, 100)}%`;
    }
    
    static complete() {
        if (!this.bar) return;
        this.bar.style.width = '100%';
        setTimeout(() => {
            this.bar.style.width = '0%';
            this.bar.style.transition = 'width 0s';
        }, 300);
    }
    
    static error() {
        if (!this.bar) return;
        this.bar.style.backgroundColor = 'var(--danger)';
        this.bar.style.width = '100%';
        setTimeout(() => {
            this.bar.style.width = '0%';
            this.bar.style.backgroundColor = 'linear-gradient(90deg, var(--primary), var(--secondary))';
        }, 500);
    }
}