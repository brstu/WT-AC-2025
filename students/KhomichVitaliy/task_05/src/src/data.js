let recipes = [
    {
        id: 1,
        title: "Борщ классический",
        description: "Традиционный украинский борщ со свёклой и мясом",
        category: "Супы",
        cookingTime: 90, // в минутах
        ingredients: [
            { name: "Свёкла", amount: "3 шт" },
            { name: "Говядина", amount: "500 г" },
            { name: "Капуста", amount: "300 г" },
            { name: "Картофель", amount: "4 шт" }
        ],
        instructions: "1. Сварить бульон...\n2. Добавить свёклу..."
    },
    {
        id: 2,
        title: "Тирамису",
        description: "Итальянский десерт с маскарпоне и кофе",
        category: "Десерты",
        cookingTime: 30,
        ingredients: [
            { name: "Маскарпоне", amount: "500 г" },
            { name: "Печенье савоярди", amount: "300 г" },
            { name: "Кофе эспрессо", amount: "200 мл" },
            { name: "Яйца", amount: "4 шт" }
        ],
        instructions: "1. Взбить желтки с сахаром...\n2. Пропитать печенье кофе..."
    }
];

let nextId = 3;

module.exports = { recipes, nextId };