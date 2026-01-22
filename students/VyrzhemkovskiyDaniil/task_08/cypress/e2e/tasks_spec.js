describe('Трекер задач - E2E тесты', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.wait(1000); // Даем время на загрузку
  });

  it('должен загрузить главную страницу', () => {
    cy.contains('Трекер задач').should('be.visible');
    cy.contains('Добавить новую задачу').should('be.visible');
    cy.get('#title').should('be.visible');
    cy.get('#description').should('be.visible');
  });

  it('должен отображать статистику', () => {
    cy.get('#total-tasks').should('be.visible');
    cy.get('#completed-tasks').should('be.visible');
    cy.get('#pending-tasks').should('be.visible');
  });

  it('должен отображать фильтры', () => {
    cy.get('[data-filter="all"]').should('be.visible');
    cy.get('[data-filter="pending"]').should('be.visible');
    cy.get('[data-filter="completed"]').should('be.visible');
    cy.get('[data-filter="all"]').should('have.class', 'active');
  });

  it('должен загрузить и отобразить задачи', () => {
    cy.get('.task-card', { timeout: 10000 }).should('have.length.at.least', 1);
    
    cy.get('.task-card').first().within(() => {
      cy.get('.task-title').should('not.be.empty');
      cy.get('.task-description').should('be.visible');
      cy.get('.task-status').should('be.visible');
      cy.get('.action-btn.complete-btn').should('be.visible');
      cy.get('.action-btn.delete-btn').should('be.visible');
    });
  });

  it('должен добавить новую задачу', () => {
    const taskTitle = 'Новая задача через Cypress';
    
    cy.get('#title').type(taskTitle);
    cy.get('#description').type('Описание новой задачи');
    cy.get('#due-date').type('2024-12-25');
    cy.get('#priority').select('high');
    
    cy.get('#add-task-form').submit();
    
    cy.contains(taskTitle, { timeout: 5000 }).should('be.visible');
    cy.get('.task-status.status-pending').should('be.visible');
  });

  it('должен переключить статус задачи', () => {
    // Сначала задача должна быть в статусе "ожидает"
    cy.get('.task-status.status-pending').first().should('be.visible');
    
    // Нажимаем кнопку выполнения
    cy.get('.action-btn.complete-btn').first().click();
    
    // Теперь должна быть "выполнена"
    cy.get('.task-status.status-completed', { timeout: 3000 }).should('be.visible');
    
    // Проверяем обновление статистики
    cy.get('#completed-tasks').should(($el) => {
      const completedCount = parseInt($el.text());
      expect(completedCount).to.be.at.least(1);
    });
  });

  it('должен удалить задачу', () => {
    cy.get('.task-card', { timeout: 10000 }).should('have.length.at.least', 1);
    
    // Запоминаем количество задач
    cy.get('#total-tasks').then(($total) => {
      const initialCount = parseInt($total.text());
      
      // Удаляем первую задачу
      cy.get('.action-btn.delete-btn').first().click();
      
      // Подтверждаем удаление
      cy.on('window:confirm', () => true);
      
      // Проверяем, что счетчик уменьшился
      cy.get('#total-tasks', { timeout: 3000 }).should(($newTotal) => {
        const newCount = parseInt($newTotal.text());
        expect(newCount).to.equal(initialCount - 1);
      });
    });
  });

  it('должен фильтровать задачи', () => {
    // Добавляем задачу
    cy.get('#title').type('Задача для фильтра');
    cy.get('#add-task-form').submit();
    
    // Фильтруем по ожидающим
    cy.get('[data-filter="pending"]').click();
    cy.get('.task-card .task-status.status-pending').should('be.visible');
    cy.get('.task-status.status-completed').should('not.exist');
    
    // Фильтруем по выполненным
    cy.get('[data-filter="completed"]').click();
    cy.get('.task-card .task-status.status-completed').should('be.visible');
    cy.get('.task-status.status-pending').should('not.exist');
    
    // Возвращаемся ко всем
    cy.get('[data-filter="all"]').click();
    cy.get('.task-card', { timeout: 3000 }).should('have.length.at.least', 1);
  });

  it('должен показывать сообщение при отсутствии задач', () => {
    // Удаляем все задачи
    cy.get('.action-btn.delete-btn').each(($btn) => {
      cy.wrap($btn).click();
      cy.on('window:confirm', () => true);
      cy.wait(500);
    });
    
    cy.contains('Задачи не найдены').should('be.visible');
    cy.contains('Добавьте первую задачу!').should('be.visible');
  });

  it('должен обновлять статистику при действиях', () => {
    cy.get('#total-tasks').then(($total) => {
      const initialTotal = parseInt($total.text());
      const initialCompleted = parseInt(cy.get('#completed-tasks').invoke('text'));
      
      // Добавляем задачу
      cy.get('#title').type('Тестовая задача для статистики');
      cy.get('#add-task-form').submit();
      
      // Проверяем увеличение общего количества
      cy.get('#total-tasks', { timeout: 3000 }).should(($newTotal) => {
        expect(parseInt($newTotal.text())).to.equal(initialTotal + 1);
      });
      
      // Выполняем задачу
      cy.get('.action-btn.complete-btn').first().click();
      
      // Проверяем увеличение выполненных
      cy.get('#completed-tasks', { timeout: 3000 }).should(($newCompleted) => {
        expect(parseInt($newCompleted.text())).to.equal(initialCompleted + 1);
      });
    });
  });

  it('должен быть адаптивным', () => {
    cy.viewport('iphone-6');
    cy.get('.task-card').should('be.visible');
    cy.get('.filters').should('be.visible');
    
    cy.viewport('macbook-15');
    cy.get('.task-card').should('be.visible');
    cy.get('.tasks-container').should('have.css', 'grid-template-columns');
  });
});