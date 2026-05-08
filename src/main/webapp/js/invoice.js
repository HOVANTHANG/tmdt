var token = localStorage.getItem("token");
var reviewStar = 5;
var reviewImageUrls = [];
var editingReviewId = null;
var editingReviewType = null;

function formatmoney(amount) {
    return Number(amount || 0).toLocaleString("vi-VN") + " ₫";
}

function safeImage(url, fallback) {
    if (!url || String(url).trim() === "") {
        return fallback;
    }
    return url;
}

function getVariantDisplayName(variant) {
    if (!variant) return "";

    let text = "";

    if (variant.tier1value) {
        text += variant.tier1value;
    }

    if (variant.tier2value) {
        text += text ? " - " + variant.tier2value : variant.tier2value;
    }

    if (variant.tier3value) {
        text += text ? " - " + variant.tier3value : variant.tier3value;
    }

    return text || "Biến thể mặc định";
}

async function loadMyInvoice() {
    var url = "http://localhost:8080/api/invoice/user/find-by-user";

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: new Headers({
                "Authorization": "Bearer " + token
            })
        });

        if (!response.ok) {
            throw new Error("Không tải được đơn hàng");
        }

        var list = await response.json();
        var main = "";

        if (!list || list.length === 0) {
            main = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        Bạn chưa có đơn hàng nào
                    </td>
                </tr>
            `;
        } else {
            for (let i = 0; i < list.length; i++) {
                const item = list[i];

                main += `
                    <tr class="invoice-row" onclick="openInvoiceDetail(${item.id})">
                        <td>#${item.id}</td>

                        <td class="floatr">
                            ${item.createdTime || ""}<br>
                            ${item.createdDate || ""}
                        </td>

                        <td>${item.address || ""}</td>

                        <td class="floatr">
                            <span class="yls">
                                ${formatmoney(item.totalAmount)}
                            </span>
                        </td>

                        <td class="floatr">
                            <span class="yls">
                                ${formatmoney(item.shipCost)}
                            </span>
                        </td>

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
                `;
            }
        }

        document.getElementById("listinvoice").innerHTML = main;
        document.getElementById("sldonhang").innerHTML = (list ? list.length : 0) + " đơn hàng";

    } catch (e) {
        console.error("Lỗi loadMyInvoice:", e);
        toastr.error("Không tải được danh sách đơn hàng");
    }
}

async function openInvoiceDetail(invoiceId) {
    const token = localStorage.getItem("token");

    if (!token) {
        toastr.error("Bạn cần đăng nhập");
        window.location.href = "/dangnhap";
        return;
    }

    try {
        const invoiceRes = await fetch("http://localhost:8080/api/invoice/user/find-by-id?idInvoice=" + invoiceId, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!invoiceRes.ok) {
            throw new Error("Không tải được hóa đơn");
        }

        const invoice = await invoiceRes.json();

        const detailRes = await fetch("http://localhost:8080/api/invoice-detail/user/find-by-invoice?idInvoice=" + invoiceId, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!detailRes.ok) {
            throw new Error("Không tải được chi tiết hóa đơn");
        }

        const list = await detailRes.json();

        renderInvoiceDetail(invoice, list);

        new bootstrap.Modal(document.getElementById("invoiceDetailModal")).show();

    } catch (e) {
        console.error("Lỗi openInvoiceDetail:", e);
        toastr.error("Không tải được chi tiết đơn hàng");
    }
}

function renderInvoiceDetail(invoice, list) {
    document.getElementById("invoiceCodeText").innerText = "#" + (invoice.id || "");
    document.getElementById("invoiceStatusText").innerText = invoice.statusInvoice || "";
    document.getElementById("invoiceReceiverName").innerText = invoice.receiverName || "";
    document.getElementById("invoicePhone").innerText = invoice.phone || "";
    document.getElementById("invoiceAddress").innerText = invoice.address || "";
    document.getElementById("invoiceNote").innerText = invoice.note ? "Ghi chú: " + invoice.note : "";

    let grouped = {};
    let shopOrder = [];
    let tamTinh = 0;

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const product = item.product || {};

        let shopId = item.shopId || (product.shop ? product.shop.id : 0) || 0;
        let shopName = item.shopName || (product.shop ? product.shop.shopName : "Shop") || "Shop";
        let shopAvatar = item.shopAvatar || (product.shop ? product.shop.avatar : "/image/logo.ico") || "/image/logo.ico";

        if (!grouped[shopId]) {
            grouped[shopId] = {
                shopId: shopId,
                shopName: shopName,
                shopAvatar: shopAvatar,
                items: []
            };
            shopOrder.push(shopId);
        }

        grouped[shopId].items.push(item);
    }

    let html = "";

    for (let s = 0; s < shopOrder.length; s++) {
        const group = grouped[shopOrder[s]];

        html += `
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
                            </button>
                        ` : ""}
                    </div>
                </div>
        `;

        for (let i = 0; i < group.items.length; i++) {
            const item = group.items[i];
            const product = item.product || {};
            const variant = item.productVariant || {};
            const quantity = Number(item.quantity || 0);
            const price = Number(item.price || variant.price || 0);
            const image = safeImage(item.image || variant.image || product.imageBanner, "/image/product1.webp");
            const variantText = getVariantDisplayName(variant);

            tamTinh += quantity * price;

            html += `
                <div class="invoice-product-row">
                    <img src="${image}"
                         class="invoice-product-image"
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
                            </button>
                        ` : ""}

                        <button class="btn btn-sm btn-outline-primary mt-2" onclick="openModalMoTa(${item.id})">
                            Bảo hành
                        </button>
                    </div>

                    <div class="text-end">
                        <b>${formatmoney(price * quantity)}</b>
                    </div>
                </div>
            `;
        }

        html += `</div>`;
    }

    document.getElementById("invoiceProductList").innerHTML =
        html || `<div class="text-center text-muted p-4">Không có sản phẩm</div>`;

    document.getElementById("invoiceTamTinh").innerText = formatmoney(tamTinh);
    document.getElementById("invoiceShip").innerText = formatmoney(invoice.shipCost || 0);
    document.getElementById("invoiceTotal").innerText = formatmoney(tamTinh + Number(invoice.shipCost || 0));

    checkReviewedButtons(invoice, list);
}

async function checkReviewedButtons(invoice, list) {
    const token = localStorage.getItem("token");

    if (!token || !invoice || !list) {
        return;
    }

    for (let item of list) {
        try {
            const res = await fetch(
                "http://localhost:8080/api/review/user/my-product-review?invoiceDetailId=" + item.id,
                {
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!res.ok) continue;

            const review = await res.json();

            if (review && review.id) {
                const btn = document.getElementById("btnReviewProduct" + item.id);
                if (btn) {
                    btn.innerText = "Xem đánh giá";
                    btn.classList.add("reviewed");
                    btn.onclick = function () {
                        openEditProductReview(item.id, review);
                    };
                }
            }
        } catch (e) {
            console.error("Lỗi check product review:", e);
        }
    }

    const checkedShop = new Set();

    for (let item of list) {
        const shopId = item.shopId || (item.product && item.product.shop ? item.product.shop.id : null);

        if (!shopId || checkedShop.has(shopId)) continue;

        checkedShop.add(shopId);

        try {
            const res = await fetch(
                `http://localhost:8080/api/review/user/my-shop-review?invoiceId=${invoice.id}&shopId=${shopId}`,
                {
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!res.ok) continue;

            const review = await res.json();

            if (review && review.id) {
                const btn = document.getElementById("btnReviewShop" + invoice.id + "_" + shopId);
                if (btn) {
                    btn.innerText = "Xem đánh giá";
                    btn.classList.add("reviewed");
                    btn.onclick = function () {
                        openEditShopReview(invoice.id, shopId, review);
                    };
                }
            }
        } catch (e) {
            console.error("Lỗi check shop review:", e);
        }
    }
}

function openEditProductReview(invoiceDetailId, review) {
    editingReviewId = review.id;
    editingReviewType = "PRODUCT";

    document.getElementById("reviewTitle").innerText = "Xem / sửa đánh giá sản phẩm";
    document.getElementById("reviewType").value = "PRODUCT";
    document.getElementById("reviewTargetId").value = invoiceDetailId;
    document.getElementById("reviewInvoiceId").value = "";
    document.getElementById("reviewContent").value = review.content || "";

    reviewImageUrls = [];

    const input = document.getElementById("reviewImages");
    if (input) input.value = "";

    document.getElementById("reviewImageBox").style.display = "block";
    renderOldReviewImages(review.images || review.productCommentImages || []);

    setReviewStar(Number(review.star || 5));

    new bootstrap.Modal(document.getElementById("reviewModal")).show();
}

function openEditShopReview(invoiceId, shopId, review) {
    editingReviewId = review.id;
    editingReviewType = "SHOP";

    document.getElementById("reviewTitle").innerText = "Xem / sửa đánh giá shop";
    document.getElementById("reviewType").value = "SHOP";
    document.getElementById("reviewInvoiceId").value = invoiceId;
    document.getElementById("reviewTargetId").value = shopId;
    document.getElementById("reviewContent").value = review.content || "";

    reviewImageUrls = [];

    const input = document.getElementById("reviewImages");
    if (input) input.value = "";

    document.getElementById("reviewImagePreview").innerHTML = "";
    document.getElementById("reviewImageBox").style.display = "none";

    setReviewStar(Number(review.star || 5));

    new bootstrap.Modal(document.getElementById("reviewModal")).show();
}

function goShop(shopId) {
    window.open("/shop-detail?id=" + shopId, "_blank");
}

function setReviewStar(star) {
    reviewStar = star;

    const input = document.getElementById("reviewStarValue");
    if (input) {
        input.value = star;
    }

    const stars = document.querySelectorAll(".review-star-select i");
    stars.forEach((item, index) => {
        if (index < star) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

function openProductReview(invoiceDetailId) {
    editingReviewId = null;
    editingReviewType = null;

    document.getElementById("reviewTitle").innerText = "Đánh giá sản phẩm";
    document.getElementById("reviewType").value = "PRODUCT";
    document.getElementById("reviewTargetId").value = invoiceDetailId;
    document.getElementById("reviewInvoiceId").value = "";
    document.getElementById("reviewContent").value = "";

    reviewImageUrls = [];

    const input = document.getElementById("reviewImages");
    if (input) input.value = "";

    document.getElementById("reviewImagePreview").innerHTML = "";
    document.getElementById("reviewImageBox").style.display = "block";

    setReviewStar(5);

    new bootstrap.Modal(document.getElementById("reviewModal")).show();
}

function openShopReview(invoiceId, shopId) {
    editingReviewId = null;
    editingReviewType = null;

    document.getElementById("reviewTitle").innerText = "Đánh giá shop";
    document.getElementById("reviewType").value = "SHOP";
    document.getElementById("reviewInvoiceId").value = invoiceId;
    document.getElementById("reviewTargetId").value = shopId;
    document.getElementById("reviewContent").value = "";

    reviewImageUrls = [];

    const input = document.getElementById("reviewImages");
    if (input) input.value = "";

    document.getElementById("reviewImagePreview").innerHTML = "";
    document.getElementById("reviewImageBox").style.display = "none";

    setReviewStar(5);

    new bootstrap.Modal(document.getElementById("reviewModal")).show();
}

function previewReviewImages() {
    const input = document.getElementById("reviewImages");
    const preview = document.getElementById("reviewImagePreview");

    preview.innerHTML = "";

    if (!input.files || input.files.length === 0) {
        return;
    }

    if (input.files.length > 5) {
        toastr.warning("Chỉ được chọn tối đa 5 ảnh");
        input.value = "";
        return;
    }

    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];

        if (!file.type.startsWith("image/")) {
            toastr.warning("Chỉ được chọn file ảnh");
            input.value = "";
            preview.innerHTML = "";
            return;
        }

        const imgUrl = URL.createObjectURL(file);

        preview.innerHTML += `
            <img src="${imgUrl}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;margin:4px;">
        `;
    }
}

function renderOldReviewImages(images) {
    const preview = document.getElementById("reviewImagePreview");
    preview.innerHTML = "";

    if (!images || images.length === 0) {
        return;
    }

    for (let img of images) {
        let src = "";

        if (typeof img === "string") {
            src = img;
        } else {
            src = img.linkImage || img.image || img.url || "";
        }

        if (!src) continue;

        reviewImageUrls.push(src);

        preview.innerHTML += `
            <img src="${src}"
                 style="width:70px;height:70px;object-fit:cover;border-radius:8px;margin:4px;"
                 onerror="this.style.display='none'">
        `;
    }
}

async function uploadReviewImages() {
    const input = document.getElementById("reviewImages");

    if (!input || !input.files || input.files.length === 0) {
        return [];
    }

    if (input.files.length > 5) {
        throw new Error("Chỉ được chọn tối đa 5 ảnh");
    }

    const formData = new FormData();

    for (let i = 0; i < input.files.length; i++) {
        formData.append("file", input.files[i]);
    }

    const res = await fetch("http://localhost:8080/api/public/upload-multiple-file", {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        throw new Error("Upload ảnh thất bại");
    }

    return await res.json();
}

async function submitReview() {
    const token = localStorage.getItem("token");

    if (!token) {
        toastr.error("Bạn cần đăng nhập");
        window.location.href = "/dangnhap";
        return;
    }

    const type = document.getElementById("reviewType").value;
    const targetId = Number(document.getElementById("reviewTargetId").value);
    const invoiceId = Number(document.getElementById("reviewInvoiceId").value || 0);
    const content = document.getElementById("reviewContent").value.trim();

    let url = "";
    let method = editingReviewId ? "PUT" : "POST";
    let body = {};

    try {
        if (type === "PRODUCT") {
            const uploadedImages = await uploadReviewImages();

            let finalImages = [];

            if (uploadedImages && uploadedImages.length > 0) {
                finalImages = uploadedImages;
            } else if (editingReviewId && reviewImageUrls.length > 0) {
                finalImages = reviewImageUrls;
            }

            body = {
                invoiceDetailId: targetId,
                star: reviewStar,
                content: content,
                images: finalImages
            };

            url = editingReviewId
                ? "http://localhost:8080/api/review/user/product/" + editingReviewId
                : "http://localhost:8080/api/review/user/product";
        } else {
            body = {
                invoiceId: invoiceId,
                shopId: targetId,
                star: reviewStar,
                content: content
            };

            url = editingReviewId
                ? "http://localhost:8080/api/review/user/shop/" + editingReviewId
                : "http://localhost:8080/api/review/user/shop";
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            toastr.success(editingReviewId ? "Cập nhật đánh giá thành công" : "Đánh giá thành công");

            const modal = bootstrap.Modal.getInstance(document.getElementById("reviewModal"));
            if (modal) {
                modal.hide();
            }

            const invoiceIdCurrent = Number(document.getElementById("invoiceCodeText").innerText.replace("#", ""));
            if (invoiceIdCurrent) {
                openInvoiceDetail(invoiceIdCurrent);
            }

            return;
        }

        const text = await response.text();
        toastr.error(text || "Đánh giá thất bại");
    } catch (e) {
        console.error("Lỗi submitReview:", e);
        toastr.error(e.message || "Không thể kết nối server");
    }
}

async function cancelInvoice(id) {
    if (!confirm("Hủy đơn?")) return;

    var url = "http://localhost:8080/api/invoice/user/cancel-invoice?idInvoice=" + id;

    const res = await fetch(url, {
        method: "POST",
        headers: new Headers({
            "Authorization": "Bearer " + token
        })
    });

    if (res.status < 300) {
        toastr.success("Đã hủy");
        loadMyInvoice();
    } else {
        var result = await res.json();
        toastr.warning(result.defaultMessage || "Không thể hủy đơn");
    }
}

async function timKiemDonHang() {
    var id = document.getElementById("madonhang").value;
    var phone = document.getElementById("sodienthoai").value;

    var url = `http://localhost:8080/api/invoice/public/tim-kiem-don-hang?id=${id}&phone=${phone}`;

    const response = await fetch(url);
    var result = await response.json();

    if (response.status == exceptionCode) {
        toastr.warning(result.defaultMessage);
        return;
    }

    document.getElementById("listinvoice").innerHTML = `
        <tr onclick="openInvoiceDetail(${result.id})">
            <td>#${result.id}</td>
            <td>${result.createdTime || ""} ${result.createdDate || ""}</td>
            <td>${result.address || ""}</td>
            <td>${formatmoney(result.totalAmount)}</td>
            <td>${formatmoney(result.shipCost)}</td>
            <td>${result.payType || ""}</td>
            <td>${result.statusInvoice || ""}</td>
            <td></td>
        </tr>
    `;
}

function openModalMoTa(idDetail) {
    document.getElementById("ivdetail").value = idDetail;
    $("#modaldeail").modal("show");
}
