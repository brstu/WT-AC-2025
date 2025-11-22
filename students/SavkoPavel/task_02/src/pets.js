const petsData = {
    cats: [
        {
            id: 1,
            name: "Мурзик",
            category: "Кошка",
            image: "https://garden-zoo.ru/userfiles/%D0%9F%D0%BE%D1%87%D0%B5%D0%BC%D1%83%20%D0%BA%D0%BE%D1%82%D1%8B%20%D1%82%D0%B0%D0%BA%D0%B8%D0%B5%20%D0%B2%D1%8B%D1%81%D0%BE%D0%BA%D0%BE%D0%BC%D0%B5%D1%80%D0%BD%D1%8B%D0%B52.jpg",
            description: "Игривый кот, возраст 2.3 года.",
            liked: false
        },
        {
            id: 2,
            name: "Снежка",
            category: "Кошка", 
            image: "https://garden-zoo.ru/userfiles/%D0%9F%D0%BE%D1%87%D0%B5%D0%BC%D1%83%20%D0%BA%D0%BE%D1%82%D1%8B%20%D1%82%D0%B0%D0%BA%D0%B8%D0%B5%20%D0%B2%D1%8B%D1%81%D0%BE%D0%BA%D0%BE%D0%BC%D0%B5%D1%80%D0%BD%D1%8B%D0%B5.jpg",
            description: "Спокойная кошечка, возраст 2 года.",
            liked: false
        }
    ],
    dogs: [
        {
            id: 3,
            name: "Бобик",
            category: "Собака",
            image: "https://placedog.net/300/200", 
            description: "Дружелюбный пес средних размеров, возраст 2 года.",
            liked: false
        }
    ],
    others: [
        {
            id: 4,
            name: "Крош",
            category: "Кролик",
            image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80",
            description: "Декоративный кролик, возраст 6 месяцев.",
            liked: false
        }
    ]
};

function renderPets(pets, container) {
    container.innerHTML = '';
    
    pets.forEach(pet => {
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';
        petCard.dataset.id = pet.id;
        petCard.dataset.category = pet.category.toLowerCase();
        
        petCard.innerHTML = `
            <img src="${pet.image}" alt="${pet.name}" class="pet-image">
            <div class="pet-info">
                <h3 class="pet-name">${pet.name}</h3>
                <span class="pet-category">${pet.category}</span>
                <p class="pet-description">${pet.description}</p>
                <div class="pet-actions">
                    <button class="like-btn ${pet.liked ? 'liked' : ''}" aria-label="${pet.liked ? 'Убрать лайк' : 'Поставить лайк'}">
                        ${pet.liked ? '❤️' : '🤍'}
                    </button>
                    <button class="delete-btn" aria-label="Удалить карточку">🗑️</button>
                </div>
            </div>
        `;
        
        container.appendChild(petCard);
    });
}

function addPetToSelect(pet, selectElement) {
    const option = document.createElement('option');
    option.value = pet.id;
    option.textContent = `${pet.name} (${pet.category})`;
    selectElement.appendChild(option);
}

function toggleLike(petId, category, likeButton) {
    let petsArray;
    
    if (category === 'кошка' || category === 'кот') petsArray = petsData.cats;
    else if (category === 'собака') petsArray = petsData.dogs;
    else petsArray = petsData.others;
    
    const pet = petsArray.find(p => p.id === petId);
    if (pet) {
        pet.liked = !pet.liked;
        likeButton.textContent = pet.liked ? '❤️' : '🤍';
        likeButton.classList.toggle('liked');
        likeButton.setAttribute('aria-label', pet.liked ? 'Убрать лайк' : 'Поставить лайк');
    }
}

function removePet(petId, category, petCard) {
    let petsArray;
    
    if (category === 'кошка' || category === 'кот') petsArray = petsData.cats;
    else if (category === 'собака') petsArray = petsData.dogs;
    else petsArray = petsData.others;
    
    const petIndex = petsArray.findIndex(p => p.id === petId);
    if (petIndex !== -1) {
        petsArray.splice(petIndex, 1);
        petCard.remove();
        
        const petSelect = document.getElementById('pet-select');
        const optionToRemove = petSelect.querySelector(`option[value="${petId}"]`);
        if (optionToRemove) optionToRemove.remove();
    }
}

export function initPets() {
    const catsContainer = document.getElementById('cats-container');
    const dogsContainer = document.getElementById('dogs-container');
    const othersContainer = document.getElementById('others-container');
    const petSelect = document.getElementById('pet-select');
    
    renderPets(petsData.cats, catsContainer);
    renderPets(petsData.dogs, dogsContainer);
    renderPets(petsData.others, othersContainer);
    
    [...petsData.cats, ...petsData.dogs, ...petsData.others].forEach(pet => {
        addPetToSelect(pet, petSelect);
    });
    
    // Делегирование событий
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('like-btn')) {
            const petCard = e.target.closest('.pet-card');
            const petId = parseInt(petCard.dataset.id);
            const petCategory = petCard.dataset.category;
            toggleLike(petId, petCategory, e.target);
        }
        
        if (e.target.classList.contains('delete-btn')) {
            const petCard = e.target.closest('.pet-card');
            const petId = parseInt(petCard.dataset.id);
            const petCategory = petCard.dataset.category;
            removePet(petId, petCategory, petCard);
        }
    });
}