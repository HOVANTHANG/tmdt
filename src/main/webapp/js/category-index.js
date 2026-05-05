const CATEGORY_INDEX_API = "http://localhost:8080/api/category/public/findAll";

function getCategoryImage(category) {
    if (category.image && category.image.trim() !== "") {
        return category.image;
    }
    if (category.icon && category.icon.trim() !== "") {
        return category.icon;
    }
    if (category.imageUrl && category.imageUrl.trim() !== "") {
        return category.imageUrl;
    }

    return "image/category-default.png";
}

function safeText(text) {
    return text ? String(text).replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
}

async function loadCategoryIndex() {
    const grid = document.getElementById("categoryGrid");
    if (!grid) return;

    try {
        const response = await fetch(CATEGORY_INDEX_API);

        if (!response.ok) {
            throw new Error("Không tải được danh mục");
        }

        const categories = await response.json();

        let html = "";

        for (let i = 0; i < categories.length; i++) {
            const item = categories[i];

            html += `
                <a class="category-item" href="category-detail?id=${item.id}">
                    <div class="category-img">
                        <img src="${getCategoryImage(item)}" 
                             alt="${safeText(item.name)}"
                             onerror="this.src='image/category-default.png'">
                    </div>
                    <div class="category-name">${safeText(item.name)}</div>
                </a>
            `;
        }

        grid.innerHTML = html || `
            <div class="category-item">
                <div class="category-name">Chưa có danh mục</div>
            </div>
        `;

    } catch (error) {
        console.error("Lỗi loadCategoryIndex:", error);
        grid.innerHTML = `
            <div class="category-item">
                <div class="category-name">Không tải được danh mục</div>
            </div>
        `;
    }
}

function scrollCategory(direction) {
    const grid = document.getElementById("categoryGrid");
    if (!grid) return;

    grid.scrollLeft += direction * 600;
}