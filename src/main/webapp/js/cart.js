var idVariantCart = -1;

/**
 * Format tiền VNĐ
 */
function formatmoney(money) {
    return Number(money || 0).toLocaleString("vi-VN") + " ₫";
}

/**
 * Lấy tên biến thể để hiển thị
 * Ví dụ:
 * - Đen / 128GB
 * - XL
 * - Thùng 24 lon
 */
function getVariantDisplayName(variant) {
    if (!variant) return "Mặc định";

    const tier1 = variant.tier1value || "";
    const tier2 = variant.tier2value || "";

    if (tier1 && tier2) {
        return `${tier1} / ${tier2}`;
    }
    if (tier1) {
        return tier1;
    }
    if (tier2) {
        return tier2;
    }

    return "Mặc định";
}

/**
 * Lấy ảnh hiển thị ưu tiên ảnh biến thể, nếu không có thì dùng ảnh banner sản phẩm
 */
function getCartItemImage(product, variant) {
    if (variant && variant.image && variant.image.trim() !== "") {
        return variant.image;
    }
    if (product && product.imageBanner && product.imageBanner.trim() !== "") {
        return product.imageBanner;
    }
    return "image/product1.webp";
}

/**
 * Thêm vào giỏ hàng từ trang chi tiết
 * Yêu cầu biến global idVariantCart phải được gán khi chọn biến thể
 */
async function addCart(type) {
    if (idVariantCart < 1) {
        toastr.warning("Bạn chưa chọn biến thể");
        return;
    }

    if (token == null) {
        toastr.warning("Hãy đăng nhập để thực hiện chức năng này");
        return;
    }

    // Đọc số lượng từ input trên trang detail (nếu có), mặc định là 1
    const qtyInput = document.getElementById("qtyInput");
    const quantity = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

    const url = "http://localhost:8080/api/cart/user/add-cart?productVariantId=" + idVariantCart + "&quantity=" + quantity;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: new Headers({
                "Authorization": "Bearer " + token
            })
        });

        if (response.status < 300) {
            toastr.success("Thêm giỏ hàng thành công! (x" + quantity + ")");
            if (typeof countCart === "function") {
                countCart();
            }

            if (type === "MUANGAY") {
                window.location.href = "giohang";
            }
        } else {
            let message = "Thêm giỏ hàng thất bại!";
            try {
                const result = await response.json();
                if (result && result.message) {
                    message = result.message;
                }
            } catch (e) { }
            // Try reading as text if json fails
            try {
                if (message === "Thêm giỏ hàng thất bại!") {
                    message = await response.text() || message;
                }
            } catch (e) { }
            toastr.error(message);
        }
    } catch (error) {
        console.error("Lỗi addCart:", error);
        toastr.error("Không thể kết nối tới server!");
    }
}

/**
 * Load toàn bộ giỏ hàng
 */
async function loadAllCart() {
    if (token == null) {
        window.location.href = "dangnhap";
        return;
    }

    const url = "http://localhost:8080/api/cart/user/my-cart";

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: new Headers({
                "Authorization": "Bearer " + token
            })
        });

        if (!response.ok) {
            throw new Error("Không tải được giỏ hàng");
        }

        const list = await response.json();
        let main = "";
        let totalAmount = 0;
        let totalCart = 0;

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const product = item.product || {};
            const variant = item.productVariant || {};

            const quantity = Number(item.quantity || 0);
            const price = Number(variant.price || product.price || 0);
            const itemTotal = price * quantity;
            const image = getCartItemImage(product, variant);
            const variantName = getVariantDisplayName(variant);

            totalAmount += itemTotal;
            totalCart += quantity;

            main += `
                <tr>
                    <td>
                        <div class="cart-product-cell">
                            <a href="detail?id=${product.id || ''}" class="cart-img-wrap">
                                <img src="${image}" alt="${product.name || ''}"
                                     onerror="this.src='image/product1.webp'">
                            </a>
                            <div class="cart-product-info">
                                <a href="detail?id=${product.id || ''}" class="cart-product-name">
                                    ${product.name || ''}
                                </a>
                                <span class="cart-variant-badge">${variantName}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="cart-price">${formatmoney(price)}</span>
                    </td>
                    <td>
                        <div class="qty-control">
                            <button onclick="upDownQuantity(${item.id}, 'UP')" class="qty-btn">+</button>
                            <input value="${quantity}" class="qty-input" readonly>
                            <button onclick="upDownQuantity(${item.id}, 'DOWN')" class="qty-btn">−</button>
                        </div>
                    </td>
                    <td>
                        <div class="cart-total-cell">
                            <div class="cart-item-total">${formatmoney(itemTotal)}</div>
                            <button onclick="removeCart(${item.id})" class="cart-delete-btn">
                                <i class="fa-solid fa-trash"></i> Xóa
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }

        if (list.length === 0) {
            main = `<tr><td colspan="4">
                <div class="cart-empty">
                    <div class="cart-empty-icon"><i class="fa-solid fa-cart-shopping"></i></div>
                    <h3>Giỏ hàng của bạn đang trống</h3>
                    <p>Hãy thêm sản phẩm vào giỏ để tiến hành thanh toán</p>
                    <a href="product" class="cart-empty-btn">
                        <i class="fa-solid fa-bag-shopping"></i> Mua sắm ngay
                    </a>
                </div>
            </td></tr>`;
        }

        document.getElementById("listcartDes").innerHTML = main;
        const totalFormatted = formatmoney(totalAmount);
        document.getElementById("tonggiatien").innerHTML = totalFormatted;
        document.getElementById("soluonggiohang").innerHTML = totalCart;
        // Sync total to summary panel
        var fin = document.getElementById("totalFinal");
        if (fin) fin.innerHTML = totalFormatted;

    } catch (error) {
        console.error("Lỗi loadAllCart:", error);
        toastr.error("Không tải được giỏ hàng");
        document.getElementById("listcartDes").innerHTML =
            `<tr><td colspan="4">
                <div class="cart-empty">
                    <div class="cart-empty-icon"><i class="fa-solid fa-circle-exclamation"></i></div>
                    <h3>Không tải được giỏ hàng</h3>
                    <p>Vui lòng thử lại sau</p>
                </div>
            </td></tr>`;
    }
}

/**
 * Xóa 1 dòng giỏ hàng
 */
async function removeCart(id) {
    const con = confirm("Bạn muốn xóa sản phẩm này khỏi giỏ hàng?");
    if (con === false) {
        return;
    }

    const url = "http://localhost:8080/api/cart/user/delete?id=" + id;

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: new Headers({
                "Authorization": "Bearer " + token
            })
        });

        if (response.status < 300) {
            toastr.success("Đã xóa sản phẩm khỏi giỏ hàng");
            loadAllCart();
            if (typeof countCart === "function") {
                countCart();
            }
        } else {
            toastr.error("Xóa sản phẩm thất bại");
        }
    } catch (error) {
        console.error("Lỗi removeCart:", error);
        toastr.error("Không thể kết nối tới server");
    }
}

/**
 * Tăng / giảm số lượng sản phẩm trong giỏ
 */
async function upDownQuantity(id, type) {
    let url = "http://localhost:8080/api/cart/user/down-cart?id=" + id;
    if (type === "UP") {
        url = "http://localhost:8080/api/cart/user/up-cart?id=" + id;
    }

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: new Headers({
                "Authorization": "Bearer " + token
            })
        });

        if (response.status < 300) {
            loadAllCart();
            if (typeof countCart === "function") {
                countCart();
            }
        } else {
            toastr.error("Không thể cập nhật số lượng");
        }
    } catch (error) {
        console.error("Lỗi upDownQuantity:", error);
        toastr.error("Không thể kết nối tới server");
    }
}