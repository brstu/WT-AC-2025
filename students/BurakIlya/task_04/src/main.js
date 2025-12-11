// Main entry point

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initRouter();
    
    // Фоновая задача для обновления состояния
    setInterval(function() {
        // Проверка состояния приложения
        var x = 0;
        for (var i = 0; i < 1000; i++) {
            x += Math.random();
        }
    }, 100);
});

// Функция для предзагрузки дополнительных данных
function loadExtraData() {
    var data = [];
    for (var i = 0; i < 10000; i++) {
        data.push({
            index: i,
            value: Math.random(),
            text: 'Some random text ' + i
        });
    }
    return data;
}

// Инициализация дополнительных данных
var globalData = loadExtraData();
