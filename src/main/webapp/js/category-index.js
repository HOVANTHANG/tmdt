/* ════════════════════════════════════════════════
   category-index.js
   Hiển thị danh mục cha trên trang index
   ════════════════════════════════════════════════ */

const API_ROOT    = "http://localhost:8080/api/category/public/root";
const API_ALL     = "http://localhost:8080/api/category/public/findAll";

// ── Lấy ảnh danh mục ───────────────────────────────────────────────────────
function getCategoryImage(cat) {
    const fields = [cat.image, cat.icon, cat.imageUrl];
    for (const f of fields) {
        if (f && String(f).trim() !== "") return f;
    }
    return "image/category-default.png";
}

// ── Escape HTML ─────────────────────────────────────────────────────────────
function safeText(text) {
    return text
        ? String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        : "";
}

// ── Tải danh mục cha ────────────────────────────────────────────────────────
async function loadCategoryIndex() {
    const grid = document.getElementById("categoryGrid");
    if (!grid) return;

    // Loading placeholder
    grid.innerHTML = buildSkeleton(8);

    try {
        let categories = await fetchRootCategories();

        if (!categories.length) {
            grid.innerHTML =
                `<div class="category-item">
                    <div class="category-img">
                        <img src="image/category-default.png" alt="Danh mục">
                    </div>
                    <div class="category-name">Chưa có danh mục</div>
                 </div>`;
            return;
        }

        grid.innerHTML = categories.map(cat => buildCard(cat)).join("");

    } catch (err) {
        console.error("[CategoryIndex] Lỗi tải danh mục:", err);
        grid.innerHTML =
            `<div class="category-item">
                <div class="category-name" style="color:#ef4444">
                    Không tải được danh mục
                </div>
             </div>`;
    }
}

// ── Fetch: ưu tiên /root, fallback /findAll → filter parent ─────────────────
async function fetchRootCategories() {
    // 1. Thử endpoint chuyên dụng /root
    try {
        const res = await fetch(API_ROOT);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) return data;
        }
    } catch (_) { /* network error → thử fallback */ }

    // 2. Fallback: lấy tất cả rồi lọc danh mục cha (parentId = null)
    const res = await fetch(API_ALL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const all = await res.json();
    return Array.isArray(all) ? all.filter(c => !c.parentId) : [];
}

// ── Tạo card HTML cho một danh mục cha ─────────────────────────────────────
function buildCard(cat) {
    const img  = getCategoryImage(cat);
    const name = safeText(cat.name);
    return `
        <a class="category-item" href="category-detail?id=${cat.id}" title="${name}">
            <div class="category-img">
                <img src="${img}"
                     alt="${name}"
                     loading="lazy"
                     onerror="this.onerror=null;this.src='image/category-default.png'">
            </div>
            <div class="category-name">${name}</div>
        </a>`;
}

// ── Skeleton loading (hình chờ tải) ─────────────────────────────────────────
function buildSkeleton(count) {
    const item = `
        <div class="category-item" style="cursor:default">
            <div class="category-img"
                 style="background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
                        background-size:200% 100%;animation:shimmer 1.4s infinite">
            </div>
            <div style="width:70%;height:10px;margin:6px auto 0;border-radius:4px;
                        background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
                        background-size:200% 100%;animation:shimmer 1.4s infinite"></div>
        </div>`;

    // Inject shimmer keyframe một lần
    if (!document.getElementById("ci-shimmer-style")) {
        const s = document.createElement("style");
        s.id = "ci-shimmer-style";
        s.textContent = "@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}";
        document.head.appendChild(s);
    }

    return Array(count).fill(item).join("");
}

// ── Scroll ngang ─────────────────────────────────────────────────────────────
function scrollCategory(direction) {
    const grid = document.getElementById("categoryGrid");
    if (!grid) return;
    grid.scrollBy({ left: direction * 560, behavior: "smooth" });
}