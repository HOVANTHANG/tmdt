// ==================== GLOBALS ====================

const BASE_URL = "http://localhost:8080";
const EXCEPTION_CODE = 417;

var token = localStorage.getItem("token");
var reviewStar = 5;
var reviewImageUrls = [];
var editingReviewId = null;
var editingReviewType = null;

// ==================== UTILITIES ====================

function formatmoney(amount) {
    return Number(amount || 0).toLocaleString("vi-VN") + " ₫";
}

function safeImage(url, fallback) {
    return (url && String(url).trim() !== "") ? url : fallback;
}

function getVariantDisplayName(variant) {
    if (!variant) return "";
    return [variant.tier1value, variant.tier2value, variant.tier3value]
        .filter(Boolean)
        .join(" - ") || "Biến thể mặc định";
}

/**
 * Wrapper fetch có Authorization header
 */
async function authFetch(url, options = {}) {
    const tk = localStorage.getItem("token");
    return fetch(url, {
        ...options,
        headers: {
            "Authorization": "Bearer " + tk,
            ...(options.headers || {})
        }
    });
}

// ==================== LOAD DANH SÁCH ĐƠN HÀNG ====================

async function loadMyInvoice() {
    try {
        const response = await authFetch(`${BASE_URL}/api/invoice/user/find-by-user`);

        if (!response.ok) throw new Error("Không tải được đơn hàng");

        const list = await response.json();

        const main = (!list || list.length === 0)
            ? `<tr><td colspan="8" class="text-center text-muted">Bạn chưa có đơn hàng nào</td></tr>`
            : list.map(item => `
                <tr class="invoice-row" onclick="openInvoiceDetail(${item.id})">
                    <td>#${item.id}</td>
                    <td class="floatr">${item.createdTime || ""}<br>${item.createdDate || ""}</td>
                    <td>${item.address || ""}</td>
                    <td class="floatr"><span class="yls">${formatmoney(item.totalAmount)}</span></td>
                    <td class="floatr"><span class="yls">${formatmoney(item.shipCost)}</span></td>
                    <td>
                        ${item.payType === "MOMO"
                    ? '<span class="dathanhtoan">Đã thanh toán</span>'
                    : '<span class="chuathanhtoan">COD</span>'}
                    </td>
                    <td>${item.statusInvoice || ""}</td>
                    <td>
                        ${(item.statusInvoice === "DANG_CHO_XAC_NHAN" || item.statusInvoice === "DA_XAC_NHAN") && item.payType === "COD"
                    ? `<i onclick="event.stopPropagation(); cancelInvoice(${item.id})" class="fa fa-trash-o huydon"></i>`
                    : ""}
                    </td>
                </tr>
            `).join("");

        document.getElementById("listinvoice").innerHTML = main;
        document.getElementById("sldonhang").innerHTML = (list ? list.length : 0) + " đơn hàng";

    } catch (e) {
        console.error("Lỗi loadMyInvoice:", e);
        toastr.error("Không tải được danh sách đơn hàng");
    }
}

// ==================== CHI TIẾT ĐƠN HÀNG ====================

async function openInvoiceDetail(invoiceId) {
    if (!localStorage.getItem("token")) {
        toastr.error("Bạn cần đăng nhập");
        window.location.href = "/dangnhap";
        return;
    }

    try {
        // Gọi song song 2 API
        const [invoiceRes, detailRes] = await Promise.all([
            authFetch(`${BASE_URL}/api/invoice/user/find-by-id?idInvoice=${invoiceId}`),
            authFetch(`${BASE_URL}/api/invoice-detail/user/find-by-invoice?idInvoice=${invoiceId}`)
        ]);

        if (!invoiceRes.ok) throw new Error("Không tải được hóa đơn");
        if (!detailRes.ok) throw new Error("Không tải được chi tiết hóa đơn");

        const [invoice, list] = await Promise.all([invoiceRes.json(), detailRes.json()]);

        renderInvoiceDetail(invoice, list);
        new bootstrap.Modal(document.getElementById("invoiceDetailModal")).show();

    } catch (e) {
        console.error("Lỗi openInvoiceDetail:", e);
        toastr.error("Không tải được chi tiết đơn hàng");
    }
}

function renderInvoiceDetail(invoice, list) {
    // Điền thông tin đơn hàng
    const fields = {
        invoiceCodeText: "#" + (invoice.id || ""),
        invoiceStatusText: invoice.statusInvoice || "",
        invoiceReceiverName: invoice.receiverName || "",
        invoicePhone: invoice.phone || "",
        invoiceAddress: invoice.address || "",
        invoiceNote: invoice.note ? "Ghi chú: " + invoice.note : ""
    };
    for (const [id, val] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    }

    // Nhóm sản phẩm theo shop
    const grouped = {};
    const shopOrder = [];
    let tamTinh = 0;

    for (const item of list) {
        const product = item.product || {};
        const shopId = item.shopId || product.shop?.id || 0;
        const shopName = item.shopName || product.shop?.shopName || "Shop";
        const shopAvatar = item.shopAvatar || product.shop?.avatar || "/image/logo.ico";

        if (!grouped[shopId]) {
            grouped[shopId] = { shopId, shopName, shopAvatar, items: [] };
            shopOrder.push(shopId);
        }
        grouped[shopId].items.push(item);
    }

    // Build HTML
    let html = shopOrder.map(sid => {
        const group = grouped[sid];

        const itemsHtml = group.items.map(item => {
            const product = item.product || {};
            const variant = item.productVariant || {};
            const quantity = Number(item.quantity || 0);
            const price = Number(item.price || variant.price || 0);
            const image = safeImage(item.image || variant.image || product.imageBanner, "/image/product1.webp");
            const variantText = getVariantDisplayName(variant);

            tamTinh += quantity * price;

            return `
                <div class="invoice-product-row">
                    <img src="${image}" class="invoice-product-image"
                         onerror="this.onerror=null; this.src='/image/product1.webp'">
                    <div style="flex:1">
                        <div class="invoice-product-name">${product.name || ""}</div>
                        <div class="invoice-product-variant">${variantText}</div>
                        <div>SL: ${quantity}</div>
                        <div class="invoice-product-price">${formatmoney(price)}</div>
                        ${invoice.statusInvoice === "DA_NHAN" ? `
                            <button class="invoice-review-btn"
                                    id="btnReviewProduct${item.id}"
                                    onclick="openProductReview(${item.id})">
                                Đánh giá sản phẩm
                            </button>` : ""}
                        <button class="btn btn-sm btn-outline-primary mt-2"
                                onclick="openModalMoTa(${item.id})">Bảo hành</button>
                    </div>
                    <div class="text-end"><b>${formatmoney(price * quantity)}</b></div>
                </div>`;
        }).join("");

        return `
            <div class="invoice-shop-card">
                <div class="invoice-shop-header">
                    <div class="invoice-shop-left">
                        <img src="${safeImage(group.shopAvatar, '/image/logo.ico')}"
                             class="invoice-shop-avatar"
                             onerror="this.onerror=null; this.src='/image/logo.ico'">
                        <div>
                            <div class="invoice-shop-name">${group.shopName}</div>
                            <div class="invoice-shop-sub">Nhà bán hàng</div>
                        </div>
                    </div>
                    <div class="invoice-shop-actions">
                        ${group.shopId ? `<button class="btn-view-shop-small" onclick="goShop(${group.shopId})">Xem shop</button>` : ""}
                        ${invoice.statusInvoice === "DA_NHAN" && group.shopId ? `
                            <button class="btn-review-shop-small"
                                    id="btnReviewShop${invoice.id}_${group.shopId}"
                                    onclick="openShopReview(${invoice.id}, ${group.shopId})">
                                Đánh giá shop
                            </button>` : ""}
                    </div>
                </div>
                ${itemsHtml}
            </div>`;
    }).join("");

    document.getElementById("invoiceProductList").innerHTML =
        html || `<div class="text-center text-muted p-4">Không có sản phẩm</div>`;

    document.getElementById("invoiceTamTinh").innerText = formatmoney(tamTinh);
    document.getElementById("invoiceShip").innerText = formatmoney(invoice.shipCost || 0);
    document.getElementById("invoiceTotal").innerText = formatmoney(tamTinh + Number(invoice.shipCost || 0));

    checkReviewedButtons(invoice, list);
}

// ==================== KIỂM TRA ĐÃ ĐÁNH GIÁ ====================

async function checkReviewedButtons(invoice, list) {
    if (!localStorage.getItem("token") || !invoice || !list) return;

    // Kiểm tra đánh giá sản phẩm — song song tất cả items
    await Promise.all(list.map(async item => {
        try {
            const res = await authFetch(
                `${BASE_URL}/api/review/user/my-product-review?invoiceDetailId=${item.id}`
            );
            if (!res.ok) return;

            const review = await res.json();
            if (!review?.id) return;

            const btn = document.getElementById("btnReviewProduct" + item.id);
            if (btn) {
                btn.innerText = "Xem đánh giá";
                btn.classList.add("reviewed");
                btn.onclick = () => openEditProductReview(item.id, review);
            }
        } catch (e) {
            console.error("Lỗi check product review:", e);
        }
    }));

    // Kiểm tra đánh giá shop — mỗi shop 1 lần, song song
    const checkedShops = new Set();
    const uniqueShops = list.reduce((acc, item) => {
        const shopId = item.shopId || item.product?.shop?.id;
        if (shopId && !checkedShops.has(shopId)) {
            checkedShops.add(shopId);
            acc.push(shopId);
        }
        return acc;
    }, []);

    await Promise.all(uniqueShops.map(async shopId => {
        try {
            const res = await authFetch(
                `${BASE_URL}/api/review/user/my-shop-review?invoiceId=${invoice.id}&shopId=${shopId}`
            );
            if (!res.ok) return;

            const review = await res.json();
            if (!review?.id) return;

            const btn = document.getElementById(`btnReviewShop${invoice.id}_${shopId}`);
            if (btn) {
                btn.innerText = "Xem đánh giá";
                btn.classList.add("reviewed");
                btn.onclick = () => openEditShopReview(invoice.id, shopId, review);
            }
        } catch (e) {
            console.error("Lỗi check shop review:", e);
        }
    }));
}

// ==================== REVIEW MODAL ====================

/**
 * Hàm nội bộ dùng chung để mở modal đánh giá
 */
function _openReviewModal({ title, type, targetId, invoiceId = "", content = "", star = 5, editId = null, editType = null, images = [], showImageBox = true }) {
    editingReviewId = editId;
    editingReviewType = editType;
    reviewImageUrls = [];

    document.getElementById("reviewTitle").innerText = title;
    document.getElementById("reviewType").value = type;
    document.getElementById("reviewTargetId").value = targetId;
    document.getElementById("reviewInvoiceId").value = invoiceId;
    document.getElementById("reviewContent").value = content;
    document.getElementById("reviewImageBox").style.display = showImageBox ? "block" : "none";

    const input = document.getElementById("reviewImages");
    if (input) input.value = "";

    if (images.length > 0) {
        renderOldReviewImages(images);
    } else {
        document.getElementById("reviewImagePreview").innerHTML = "";
    }

    setReviewStar(star);
    new bootstrap.Modal(document.getElementById("reviewModal")).show();
}

function openProductReview(invoiceDetailId) {
    _openReviewModal({
        title: "Đánh giá sản phẩm",
        type: "PRODUCT",
        targetId: invoiceDetailId,
        showImageBox: true
    });
}

function openShopReview(invoiceId, shopId) {
    _openReviewModal({
        title: "Đánh giá shop",
        type: "SHOP",
        targetId: shopId,
        invoiceId: invoiceId,
        showImageBox: false
    });
}

function openEditProductReview(invoiceDetailId, review) {
    _openReviewModal({
        title: "Xem / sửa đánh giá sản phẩm",
        type: "PRODUCT",
        targetId: invoiceDetailId,
        content: review.content || "",
        star: Number(review.star || 5),
        editId: review.id,
        editType: "PRODUCT",
        images: review.images || review.productCommentImages || [],
        showImageBox: true
    });
}

function openEditShopReview(invoiceId, shopId, review) {
    _openReviewModal({
        title: "Xem / sửa đánh giá shop",
        type: "SHOP",
        targetId: shopId,
        invoiceId: invoiceId,
        content: review.content || "",
        star: Number(review.star || 5),
        editId: review.id,
        editType: "SHOP",
        showImageBox: false
    });
}

function goShop(shopId) {
    window.open("/shop-detail?id=" + shopId, "_blank");
}

function setReviewStar(star) {
    reviewStar = star;

    const input = document.getElementById("reviewStarValue");
    if (input) input.value = star;

    document.querySelectorAll(".review-star-select i").forEach((el, index) => {
        el.classList.toggle("active", index < star);
    });
}

// ==================== ẢNH ĐÁNH GIÁ ====================

function previewReviewImages() {
    const input = document.getElementById("reviewImages");
    const preview = document.getElementById("reviewImagePreview");
    preview.innerHTML = "";

    if (!input.files?.length) return;

    if (input.files.length > 5) {
        toastr.warning("Chỉ được chọn tối đa 5 ảnh");
        input.value = "";
        return;
    }

    for (const file of input.files) {
        if (!file.type.startsWith("image/")) {
            toastr.warning("Chỉ được chọn file ảnh");
            input.value = "";
            preview.innerHTML = "";
            return;
        }
        preview.innerHTML += `<img src="${URL.createObjectURL(file)}"
            style="width:70px;height:70px;object-fit:cover;border-radius:8px;margin:4px;">`;
    }
}

function renderOldReviewImages(images) {
    const preview = document.getElementById("reviewImagePreview");
    preview.innerHTML = "";
    if (!images?.length) return;

    for (const img of images) {
        const src = typeof img === "string" ? img : (img.linkImage || img.image || img.url || "");
        if (!src) continue;
        reviewImageUrls.push(src);
        preview.innerHTML += `<img src="${src}"
            style="width:70px;height:70px;object-fit:cover;border-radius:8px;margin:4px;"
            onerror="this.style.display='none'">`;
    }
}

async function uploadReviewImages() {
    const input = document.getElementById("reviewImages");
    if (!input?.files?.length) return [];

    if (input.files.length > 5) throw new Error("Chỉ được chọn tối đa 5 ảnh");

    const formData = new FormData();
    for (const file of input.files) {
        formData.append("file", file);
    }

    const res = await fetch(`${BASE_URL}/api/public/upload-multiple-file`, {
        method: "POST",
        body: formData
    });

    if (!res.ok) throw new Error("Upload ảnh thất bại");
    return res.json();
}

// ==================== GỬI ĐÁNH GIÁ ====================

async function submitReview() {
    if (!localStorage.getItem("token")) {
        toastr.error("Bạn cần đăng nhập");
        window.location.href = "/dangnhap";
        return;
    }

    const type = document.getElementById("reviewType").value;
    const targetId = Number(document.getElementById("reviewTargetId").value);
    const invoiceId = Number(document.getElementById("reviewInvoiceId").value || 0);
    const content = document.getElementById("reviewContent").value.trim();
    const method = editingReviewId ? "PUT" : "POST";

    try {
        let url, body;

        if (type === "PRODUCT") {
            const uploadedImages = await uploadReviewImages();
            const finalImages = uploadedImages?.length > 0
                ? uploadedImages
                : (editingReviewId && reviewImageUrls.length > 0 ? reviewImageUrls : []);

            body = { invoiceDetailId: targetId, star: reviewStar, content, images: finalImages };
            url = editingReviewId
                ? `${BASE_URL}/api/review/user/product/${editingReviewId}`
                : `${BASE_URL}/api/review/user/product`;
        } else {
            body = { invoiceId, shopId: targetId, star: reviewStar, content };
            url = editingReviewId
                ? `${BASE_URL}/api/review/user/shop/${editingReviewId}`
                : `${BASE_URL}/api/review/user/shop`;
        }

        const response = await authFetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            toastr.success(editingReviewId ? "Cập nhật đánh giá thành công" : "Đánh giá thành công");
            bootstrap.Modal.getInstance(document.getElementById("reviewModal"))?.hide();

            const currentId = Number(document.getElementById("invoiceCodeText").innerText.replace("#", ""));
            if (currentId) openInvoiceDetail(currentId);
            return;
        }

        const text = await response.text();
        toastr.error(text || "Đánh giá thất bại");
    } catch (e) {
        console.error("Lỗi submitReview:", e);
        toastr.error(e.message || "Không thể kết nối server");
    }
}

// ==================== HỦY ĐƠN HÀNG ====================

async function cancelInvoice(id) {
    if (!confirm("Hủy đơn?")) return;

    try {
        const res = await authFetch(
            `${BASE_URL}/api/invoice/user/cancel-invoice?idInvoice=${id}`,
            { method: "POST" }
        );

        if (res.status < 300) {
            toastr.success("Đã hủy đơn hàng");
            loadMyInvoice();
        } else {
            const result = await res.json();
            toastr.warning(result.defaultMessage || "Không thể hủy đơn");
        }
    } catch (e) {
        console.error("Lỗi cancelInvoice:", e);
        toastr.error("Không thể kết nối server");
    }
}

// ==================== TÌM KIẾM ĐƠN HÀNG ====================

async function timKiemDonHang() {
    const id = document.getElementById("madonhang").value.trim();
    const phone = document.getElementById("sodienthoai").value.trim();

    if (!id || !phone) {
        toastr.warning("Vui lòng nhập mã đơn hàng và số điện thoại");
        return;
    }

    // Button loading state
    const btn = document.getElementById("btnTimDon");
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tìm...'; }

    try {
        const response = await fetch(
            `${BASE_URL}/api/invoice/public/tim-kiem-don-hang?id=${id}&phone=${phone}`
        );
        const result = await response.json();

        if (response.status === EXCEPTION_CODE) {
            toastr.warning(result.defaultMessage);
            // Show not-found empty state
            var ea = document.getElementById("orderResultArea");
            if (ea) ea.innerHTML = `
                <div class="tdk-empty">
                    <div class="tdk-empty-icon"><i class="fa-solid fa-circle-xmark" style="color:#fca5a5"></i></div>
                    <h3>Không tìm thấy đơn hàng</h3>
                    <p>${result.defaultMessage || 'Vui lòng kiểm tra lại mã đơn hàng và số điện thoại'}</p>
                </div>`;
            var tbl = document.getElementById("my-orders-table");
            if (tbl) tbl.style.display = 'none';
            return;
        }

        // Build status badge
        function payBadge(status) {
            if (!status) return '—';
            var s = status.toLowerCase();
            if (s.includes('chưa') || s.includes('chua')) return `<span class="status-badge status-pending">${status}</span>`;
            if (s.includes('đã') || s.includes('da')) return `<span class="status-badge status-paid">${status}</span>`;
            return `<span class="status-badge status-pending">${status}</span>`;
        }
        function shipBadge(status) {
            if (!status) return '—';
            var s = status.toLowerCase();
            if (s.includes('chưa') || s.includes('chua')) return `<span class="status-badge status-pending">${status}</span>`;
            if (s.includes('đang') || s.includes('dang')) return `<span class="status-badge status-shipping">${status}</span>`;
            if (s.includes('đã giao') || s.includes('hoàn')) return `<span class="status-badge status-done">${status}</span>`;
            if (s.includes('huỷ') || s.includes('huy')) return `<span class="status-badge status-cancel">${status}</span>`;
            return `<span class="status-badge status-pending">${status}</span>`;
        }

        // Hide empty state, show table
        var ea = document.getElementById("orderResultArea");
        if (ea) ea.innerHTML = '';
        var tbl = document.getElementById("my-orders-table");
        if (tbl) tbl.style.display = 'table';

        document.getElementById("listinvoice").innerHTML = `
            <tr onclick="openInvoiceDetail(${result.id})" style="cursor:pointer">
                <td><a class="order-id-link">#${result.id}</a></td>
                <td style="color:var(--tx2);font-size:13px">${result.createdTime || ""} ${result.createdDate || ""}</td>
                <td style="font-size:13px;max-width:200px">${result.address || "—"}</td>
                <td style="text-align:right;font-weight:700;color:#ef4444">${formatmoney(result.totalAmount)}</td>
                <td style="text-align:right">${formatmoney(result.shipCost)}</td>
                <td>${payBadge(result.payType)}</td>
                <td>${shipBadge(result.statusInvoice)}</td>
                <td><i class="fa-solid fa-chevron-right" style="color:var(--tx3);font-size:12px"></i></td>
            </tr>
        `;
        toastr.success("Tìm thấy đơn hàng #" + result.id);
    } catch (e) {
        console.error("Lỗi timKiemDonHang:", e);
        toastr.error("Không thể tìm kiếm đơn hàng");
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Tra cứu'; }
    }
}

// ==================== BẢO HÀNH ====================

function openModalMoTa(idDetail) {
    document.getElementById("ivdetail").value = idDetail;
    $("#modaldeail").modal("show");
}
