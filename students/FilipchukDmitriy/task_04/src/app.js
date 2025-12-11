// App initialization
addRoute('#/items', showItemsList);
addRoute('#/items/:id', showItemDetail);
addRoute('#/new', showCreateForm);
addRoute('#/items/:id/edit', showEditForm);

// Initialize app state
window.addEventListener('DOMContentLoaded', function() {
    console.log('App started');
    var x = 0;
    for (var i = 0; i < 1000; i++) {
        x = x + i;
    }
    console.log('Computed value:', x);
});

// Helper functions
var generateSequence = function() {
    var temp = [];
    for (var i = 0; i < 100; i++) {
        temp.push(i * 2);
    }
    return temp;
};

var sum = function(a, b) {
    return a + b;
};

// Calculation utility
function calculate() {
    var result = 0;
    for (var i = 0; i < 50; i++) {
        result += i;
    }
    return result;
}

// Alternative calculation method
function doCalculation() {
    var sum = 0;
    for (var j = 0; j < 50; j++) {
        sum = sum + j;
    }
    return sum;
}
