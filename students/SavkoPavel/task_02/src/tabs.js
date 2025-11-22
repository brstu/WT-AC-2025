export function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.tab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
            panels.forEach(panel => panel.setAttribute('aria-hidden', 'true'));
            
            this.setAttribute('aria-selected', 'true');
            const panelId = this.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            panel.setAttribute('aria-hidden', 'false');
        });
        
        tab.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const currentIndex = Array.from(tabs).indexOf(this);
                let nextIndex = e.key === 'ArrowRight' 
                    ? (currentIndex + 1) % tabs.length 
                    : (currentIndex - 1 + tabs.length) % tabs.length;
                
                tabs[nextIndex].focus();
            }
        });
    });
}