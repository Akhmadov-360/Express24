import '../index.css';

const textInput = document.getElementById('textInput');
const clearButton = document.getElementById('clearButton');
const main = document.getElementById('main');
const categoriesContainer = document.getElementById('categories');
const hideBtn = document.getElementById('hide');
const showBtn = document.getElementById('load-more');

let productsToShow = 12;
let products = [];

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
        products = combinedProducts;

        const uniqueCategories = getUniqueCategories(combinedProducts);
        displayCategories(uniqueCategories);

        const filteredProducts = filterProducts(combinedProducts, query, category);
        showProducts(filteredProducts);

    } catch (error) {
        console.error("Error", error);
    }
}

function filterProducts(products, query, category) {
    return products.filter(product => {
        const lowerCaseQuery = query.toLowerCase();
        const matchesQuery = product.name.toLowerCase().includes(lowerCaseQuery) || 
                             product.subCategories.some(sub => sub.name.toLowerCase().includes(lowerCaseQuery));
        const matchesCategory = category ? product.subCategories.some(sub => sub.name === category) : true;
        return matchesQuery && matchesCategory;
    });
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
    allButton.classList.add('category-button', 'px-[16px]', 'py-[14px]', 'font-Inter', 'text-[16px]', 'bg-[#f6f6fb]', 'rounded-[12px]', 'transition', 'duration-200', 'hover:bg-[#e1e1e1]', 'active:bg-[#FFF684]');
    allButton.addEventListener('click', () => fetchStores(textInput.value));
    categoriesContainer.appendChild(allButton);

    const visibleCategories = categories.slice(0, 6);
    const hiddenCategories = categories.slice(6);

    visibleCategories.forEach(category => {
        const button = document.createElement('button');
        button.innerText = category;
        button.classList.add('category-button', 'px-[16px]', 'py-[14px]', 'font-Inter', 'text-[16px]', 'bg-[#f6f6fb]', 'rounded-[12px]', 'transition', 'duration-200', 'hover:bg-[#e1e1e1]', 'active:bg-[#FFF684]');
        button.addEventListener('click', () => fetchStores(textInput.value, category));
        categoriesContainer.appendChild(button);
    });

    if (hiddenCategories.length > 0) {
        const moreButton = document.createElement('button');
    moreButton.classList.add('category-button', 'px-[16px]', 'ml-[60px]', 'flex', 'items-center', 'gap-[5px]', 'py-[14px]', 'font-Inter', 'text-[16px]', 'bg-[#f6f6fb]', 'rounded-[12px]', 'transition', 'duration-200', 'hover:bg-[#e1e1e1]', 'active:bg-[#FFF684]');

    const moreText = document.createTextNode('Ещё');

    const icon = document.createElement('i');
    icon.classList.add('bx', 'bx-chevron-down', 'bx-sm');
    icon.style.color = '#8e8e93';

    moreButton.appendChild(moreText);
    moreButton.appendChild(icon);

    moreButton.addEventListener('click', () => showMoreCategories(hiddenCategories, moreButton));
    categoriesContainer.appendChild(moreButton);
    }
}

function showMoreCategories(hiddenCategories) {
    const existingDropdown = document.querySelector('.custom-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }

    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('custom-dropdown', 'absolute', 'mt-2', 'z-50','bg-white', 'shadow-md', 'rounded-lg', 'border');

    dropdownContainer.style.maxHeight = '200px';
    dropdownContainer.style.overflowY = 'auto';

    hiddenCategories.forEach(category => {
        const option = document.createElement('div');
        option.innerText = category;
        option.classList.add('custom-option', 'px-[16px]', 'bg-[#ffffff]', 'py-[14px]', 'hover:bg-[#e1e1e1]', 'cursor-pointer');
        option.addEventListener('click', () => {
            fetchStores(textInput.value, category);
            dropdownContainer.remove();
        });
        dropdownContainer.appendChild(option);
    });

    categoriesContainer.appendChild(dropdownContainer);

    dropdownContainer.style.position = 'absolute';
    dropdownContainer.style.top = "225px";
    dropdownContainer.style.left = "883px";
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
    const productsToDisplay = products.slice(0, productsToShow);
    if (!productsToDisplay || productsToDisplay.length === 0) {
        main.innerHTML = `<h1 class="text-[34px] text-[#1a1a18] font-Inter font-bold">Ничего не нашлось</h1>`;
        return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    productsToDisplay.forEach((product) => {
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
            const isFavoriteNow = favorites.some(fav => fav.id === product.id);
            favoriteButton.innerHTML = isFavoriteNow 
                ? `<i class='bx bxs-heart' style='color:#ff4d4f'></i>` 
                : `<i class='bx bx-heart' style='color:#131313'></i>`;
        });

        main.appendChild(productEl);

        showBtn.style.display = productsToShow < products.length ? 'block' : 'none';
        hideBtn.style.display = productsToShow > 14 ? 'block' : 'none';
    });
}

showBtn.addEventListener('click', async () => {
    const loadMoreText = document.getElementById('load-more-text');

    showBtn.disabled = true;
    loadMoreText.textContent = 'Loading...';

    await new Promise(resolve => setTimeout(resolve, 1000));

    productsToShow += 12;
    showProducts(products);

    showBtn.disabled = false;
    loadMoreText.textContent = 'Load More';
});

hideBtn.addEventListener("click", async () => {
    const hideText = document.getElementById('hide-text');

    hideBtn.disabled = true;
    hideText.textContent = 'Hiding...'

    await new Promise(resolve => setTimeout(resolve, 500));

    productsToShow = 12; 
    showProducts(products); 

    hideBtn.disabled = false;
    hideText.textContent = 'Hide';
  });


function toggleFavorite(product) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const productIndex = favorites.findIndex(fav => fav.id === product.id);
    const favoriteButton = document.querySelector(`.favorite-btn[data-id="${product.id}"]`);

    if (productIndex > -1) {
      
        favorites.splice(productIndex, 1);
        favoriteButton.innerHTML = `<i class='bx bx-heart' style='color:#131313'></i>`;
    } else {
        
        favorites.push(product);
        favoriteButton.innerHTML = `<i class='bx bxs-heart' style='color:#ff4d4f'></i>`;
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

fetchStores();