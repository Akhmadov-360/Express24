import '../index.css';

const favoritesContainer = document.getElementById('main');

function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `<h1>Список пуст</h1>`;
        return;
    }

    favorites.forEach((product) => {
        const { id, name, logo, cover, isAvailable, isOpen, isExternal, reviews, subCategories } = product;
        const names = subCategories.map((i) => i.name).join(" · ");
        
        const productEl = document.createElement("div");
        productEl.classList.add("w-[342px]", "h-[307px]", "relative", "cursor-pointer", "rounded-[10px]", "shadow-[-1px_5px_6px_-1px_rgba(34,60,80,0.2)]", "overflow-hidden", "group");
        
        productEl.innerHTML = 
            `<img src="${cover}" alt="${name}" class="w-full h-[195.4px] object-cover rounded-t-[10px]">
            <img src="${logo}" alt="Logo" class="absolute h-[40px] w-[40px] z-10 top-2 right-2 rounded-lg">
            <button class="remove-btn absolute h-[40px] w-[40px] rounded-[100%] p-[10px] shadow-[0px_8px_5px_-1px_rgba(34,60,80,0.2)] bg-[#ffffff] flex justify-center text-[20px] items-center z-20 top-[178px] right-[10px]">
            <i class='bx bxs-heart' style='color:#ff4d4f'></i>
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
        
        favoritesContainer.appendChild(productEl);

        const removeButton = productEl.querySelector('.remove-btn');
        removeButton.addEventListener('click', () => {
            removeFavorite(product.id);
            productEl.remove();
        });
    });
}

function removeFavorite(productId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const updatedFavorites = favorites.filter(fav => fav.id !== productId);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
}

displayFavorites();
