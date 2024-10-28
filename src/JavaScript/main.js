import '../index.css';

const textInput = document.getElementById('textInput');
const clearButton = document.getElementById('clearButton');
const main = document.getElementById('main');
const categoriesContainer = document.getElementById('categories');

textInput.addEventListener('input', () => {
    clearButton.classList.toggle('hidden', !textInput.value);
    fetchStores(textInput.value);
});

clearButton.addEventListener('click', () => {
    textInput.value = '';
    clearButton.classList.add('hidden');
    fetchStores('');
});

const apiUrl = "https://api.express24.uz/client/v5/catalog/stores?latitude=41.311191&longitude=69.279776&limit=1200&rootCategoryId=1";
const apiUrl2 = "https://api.express24.uz/client/v5/catalog/stores?latitude=41.311191&longitude=69.279776&limit=1200&rootCategoryId=2";

async function fetchStores(query = '', category = '') {
    try {
        const [response1, response2] = await Promise.all([fetch(apiUrl), fetch(apiUrl2)]);
        
        if (!response1.ok || !response2.ok) {
            throw new Error(`HTTP error status ${response1.status} or ${response2.status}`);
        }

        const data1 = await response1.json();
        const data2 = await response2.json();

        const combinedProducts = [...data1.list, ...data2.list];

        const uniqueCategories = getUniqueCategories(combinedProducts);
        displayCategories(uniqueCategories);

        const filteredProducts = combinedProducts.filter(product => {
            const lowerCaseQuery = query.toLowerCase();
            const matchesQuery = product.name.toLowerCase().includes(lowerCaseQuery) || 
                                 product.subCategories.some(sub => sub.name.toLowerCase().includes(lowerCaseQuery));
            const matchesCategory = category ? product.subCategories.some(sub => sub.name === category) : true;
            return matchesQuery && matchesCategory;
        });

        showProducts(filteredProducts);

    } catch (error) {
        console.error("Error", error);
    }
}

function getUniqueCategories(products) {
    const categories = new Set();
    products.forEach(product => {
        product.subCategories.forEach(sub => categories.add(sub.name));
    });
    return Array.from(categories);
}

function displayCategories(categories) {
    categoriesContainer.innerHTML = ''; 

    const allButton = document.createElement('button');
    allButton.innerText = 'Все';
    allButton.classList.add('category-button', 'px-[16px]', 'py-[14px]', 'font-Inter', 'text-[16px]', 'bg-[#f6f6fb]', 'rounded-[12px]', 'transition', 'duration-200', 'hover:bg-[#e1e1e1]','active:bg-[#FFF684]');
    allButton.addEventListener('click', () => fetchStores(textInput.value));
    categoriesContainer.appendChild(allButton);

    categories.forEach(category => {
        const button = document.createElement('button');
        button.innerText = category;
        button.classList.add('category-button', 'px-[16px]', 'py-[14px]', 'font-Inter', 'text-[16px]', 'bg-[#f6f6fb]', 'rounded-[12px]', 'transition', 'duration-200', 'hover:bg-[#e1e1e1]','active:bg-[#FFF684]');
        button.addEventListener('click', () => fetchStores(textInput.value, category));
        categoriesContainer.appendChild(button);
    });
}

async function getProducts(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error status ${response.status}`);
        }

        const data = await response.json();
        showProducts(data.list);
    } catch (error) {
        console.error("Error", error);
    }
}

function showProducts(products) {
    main.innerHTML = "";
    if (!products || products.length === 0) {
        main.innerHTML = `<h1 class="text-[34px] text-[#1a1a18] font-Inter font-bold">Ничего не нашлось</h1>`;
        return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    products.forEach((product) => {
        const { id, name, logo, cover, reviews, subCategories } = product;
        const names = subCategories.map((i) => i.name).join(" · ");

        const isFavorite = favorites.some(fav => fav.id === product.id);
        const favBtnText = isFavorite 
            ? `<i class='bx bxs-heart' style='color:#ff4d4f'></i>` 
            : `<i class='bx bx-heart' style='color:#131313'></i>`;
        
        const productEl = document.createElement("div");
        productEl.classList.add("w-[342px]", "h-[307px]", "relative", "cursor-pointer", "rounded-[10px]", "shadow-[-1px_5px_6px_-1px_rgba(34,60,80,0.2)]", "overflow-hidden", "group");
        productEl.innerHTML = 
            `<img src="${cover}" alt="${name}" class="w-full h-[195.4px] object-cover rounded-t-[10px]">
            <img src="${logo}" alt="Logo" class="absolute h-[40px] w-[40px] z-10 top-2 right-2 rounded-lg">
            <button class="favorite-btn absolute h-[40px] w-[40px] rounded-[100%] p-[10px] shadow-[0px_8px_5px_-1px_rgba(34,60,80,0.2)] bg-[#ffffff] flex justify-center text-[20px] items-center z-20 top-[178px] right-3" data-id="${id}">
                ${favBtnText}
            </button>
            <div class="w-full h-[111px] p-3 flex flex-col items-start justify-start">
                <p class="font-Inter text-[20px] text-[#000000] font-semibold max-w-[266px] whitespace-nowrap overflow-hidden text-ellipsis max-h-6">${name}</p>
                <p class="mt-1 font-Inter text-[15px] font-normal text-[#7b7b7b] max-h-[19px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[318px]">${names}</p>
                <div class="pt-3">
                    <div class="w-[58px] h-[28px] px-[10px] py-[5px] bg-[#f6f6fb] rounded-[100px] flex items-center justify-center gap-1">
                        <i class='bx bx-star' style='color:#1a1a18'></i>
                        <p class="font-Inter font-normal text-[12px] text-[#1a1a18]">${reviews.average}</p>
                    </div>
                </div>
            </div>`;

        const favoriteButton = productEl.querySelector('.favorite-btn');
        favoriteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleFavorite(product);
            // Обновляем стиль кнопки после добавления/удаления
            const isFavoriteNow = favorites.some(fav => fav.id === product.id);
            favoriteButton.innerHTML = isFavoriteNow 
                ? `<i class='bx bxs-heart' style='color:#ff4d4f'></i>` 
                : `<i class='bx bx-heart' style='color:#131313'></i>`;
        });

        main.appendChild(productEl);
    });
}


function toggleFavorite(product) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const productIndex = favorites.findIndex(fav => fav.id === product.id);
    const favoriteButton = document.querySelector(`.favorite-btn[data-id="${product.id}"]`);

    if (productIndex > -1) {
        // Удаляем из избранного
        favorites.splice(productIndex, 1);
        favoriteButton.innerHTML = `<i class='bx bx-heart' style='color:#131313'></i>`;
    } else {
        // Добавляем в избранное
        favorites.push(product);
        favoriteButton.innerHTML = `<i class='bx bxs-heart' style='color:#ff4d4f'></i>`;
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

fetchStores();