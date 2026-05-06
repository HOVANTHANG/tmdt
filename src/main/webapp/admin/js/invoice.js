var token = localStorage.getItem("token");
var size = 10;

/* =========================
   HELPERS
========================= */
function getVariantDisplayName(variant) {
    if (!variant) return "Mặc định";

    const tier1 = variant.tier1value || "";
    const tier2 = variant.tier2value || "";

    if (tier1 && tier2) return `${tier1} / ${tier2}`;
    if (tier1) return tier1;
    if (tier2) return tier2;

    return "Mặc định";
}

function getVariantImage(product, variant) {
    if (variant && variant.image && variant.image.trim() !== "") {
        return variant.image;
    }
    if (product && product.imageBanner && product.imageBanner.trim() !== "") {
        return product.imageBanner;
    }
    return "image/product1.webp";
}

/* =========================
   LOAD LIST INVOICE
========================= */
async function loadInvoice(page) {
    var start = document.getElementById("start").value;
    var end = document.getElementById("end").value;
    var type = document.getElementById("type").value;
    var trangthai = document.getElementById("trangthai").value;
    var sort = document.getElementById("sort").value;

    var url = 'http://localhost:8080/api/invoice/admin/find-all?page=' + page + '&size=' + size + '&sort=' + sort;

    if (start !== "" && end !== "") {
        url += '&from=' + start + '&to=' + end;
    }
    if (type != -1) {
        url += '&paytype=' + type;
    }
    if (trangthai != -1) {
        url += '&status=' + trangthai;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        const result = await response.json();
        const list = result.content || [];
        const totalPage = result.totalPages || 0;

        let main = '';
        for (let i = 0; i < list.length; i++) {
            main += `
                <tr>
                    <td>${list[i].id}</td>
                    <td>${list[i].createdTime || ''}<br>${list[i].createdDate || ''}</td>
                    <td>${list[i].address || ''}</td>
                    <td>${formatmoney(list[i].totalAmount || 0)}</td>
                    <td>${formatmoney(list[i].shipCost || 0)}</td>
                    <td>
                        ${list[i].payType === 'MOMO'
                    ? '<span class="dathanhtoan">Đã thanh toán</span>'
                    : '<span class="chuathanhtoan">Thanh toán khi nhận hàng (COD)</span>'}
                    </td>
                    <td>${list[i].statusInvoice || ''}</td>
                    <td class="sticky-col">
                        <i onclick="loadDetailInvoice(${list[i].id})"
                           data-bs-toggle="modal"
                           data-bs-target="#modaldeail"
                           class="fa fa-eye iconaction"></i>

                        <i onclick="openStatus(${list[i].id},'${list[i].statusInvoice}')"
                           data-bs-toggle="modal"
                           data-bs-target="#capnhatdonhang"
                           class="fa fa-edit iconaction"></i>
                        <br>

                        <a target="_blank" href="/admin/in-don?id=${list[i].id}">
                            <i class="fa fa-print iconaction"></i>
                        </a>
                    </td>
                </tr>
            `;
        }

        document.getElementById("listinvoice").innerHTML = main;

        let mainpage = '';
        for (let i = 1; i <= totalPage; i++) {
            mainpage += `
                <li onclick="loadInvoice(${Number(i) - 1})" class="page-item">
                    <a class="page-link" href="#listsp">${i}</a>
                </li>
            `;
        }
        document.getElementById("pageable").innerHTML = mainpage;
    } catch (error) {
        console.error("Lỗi loadInvoice:", error);
        toastr.error("Không tải được danh sách hóa đơn");
    }
}

/* =========================
   LOAD DETAIL INVOICE
========================= */
async function loadDetailInvoice(id) {
    try {
        var url = 'http://localhost:8080/api/invoice-detail/admin/find-by-invoice?idInvoice=' + id;
        const res = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        const list = await res.json();
        let main = '';
        let currentShopId = null;

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const product = item.product || {};
            const variant = item.productVariant || {};

            const image = safeImage(
                item.image || variant.image || product.imageBanner,
                "/image/product1.webp"
            );

            const shopAvatar = safeImage(
                item.shopAvatar,
                "/image/logo.ico"
            );

            const shopId = item.shopId || 0;
            const shopName = item.shopName || "Shop";

            const variantText = getVariantDisplayName(variant);
            const price = Number(item.price || variant.price || 0);
            const quantity = Number(item.quantity || 0);

            if (currentShopId !== shopId) {
                currentShopId = shopId;

                main += `
                    <tr class="shop-row">
                        <td colspan="5">
                            <div class="shop-header">
                                <div class="shop-left">
                                    <img src="${shopAvatar}"
                                         class="shop-avatar"
                                         onerror="this.onerror=null; this.src='/image/logo.ico'">

                                    <div>
                                        <div class="shop-name">${shopName}</div>
                                        <div class="shop-status">Nhà bán hàng</div>
                                    </div>
                                </div>

                                ${shopId
                        ? `<button class="btn-view-shop" onclick="goShop(${shopId})">Xem shop</button>`
                        : ""
                    }
                            </div>
                        </td>
                    </tr>
                `;
            }

            main += `
                <tr>
                    <td>
                        <img src="${image}"
                             class="imgdetailacc"
                             onerror="this.onerror=null; this.src='/image/product1.webp'">
                    </td>

                    <td>
                        <a class="product-link" href="../detail?id=${product.id || ''}">
                            ${product.name || ''}
                        </a>
                        <br>

                        <span class="variant-text">${variantText}</span>
                        <br>

                        <span class="product-code">Mã sản phẩm: ${product.code || ''}</span>
                        <br>

                        <span class="slmobile">SL: ${quantity}</span>
                    </td>

                    <td>${formatmoney(price)}</td>

                    <td class="sldetailacc">${quantity}</td>

                    <td class="pricedetailacc yls">${formatmoney(price * quantity)}</td>
                </tr>
            `;
        }

        document.getElementById("listDetailinvoice").innerHTML = main;

        var urlInvoice = 'http://localhost:8080/api/invoice/admin/find-by-id?idInvoice=' + id;
        const resp = await fetch(urlInvoice, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        const result = await resp.json();

        document.getElementById("ngaytaoinvoice").innerHTML =
            (result.createdTime || '') + " " + (result.createdDate || '');

        document.getElementById("trangthaitt").innerHTML =
            result.payType === "MOMO" ? "Đã thanh toán" : "Thanh toán khi nhận hàng";

        document.getElementById("loaithanhtoan").innerHTML =
            result.payType === "MOMO"
                ? "Thanh toán qua momo"
                : "Thanh toán khi nhận hàng (COD)";

        document.getElementById("ttvanchuyen").innerHTML = result.statusInvoice || '';
        document.getElementById("tennguoinhan").innerHTML = result.receiverName || '';
        document.getElementById("addnhan").innerHTML = result.address || '';
        document.getElementById("phonenhan").innerHTML = result.phone || '';
        document.getElementById("ghichunh").innerHTML =
            result.note === "" || result.note == null ? 'Không có ghi chú' : result.note;

    } catch (error) {
        console.error("Lỗi loadDetailInvoice:", error);
        toastr.error("Không tải được chi tiết hóa đơn");
    }
}

function safeImage(url, fallback) {
    if (!url || String(url).trim() === "") {
        return fallback;
    }
    return url;
}

function goShop(shopId) {
    window.open("/shop-detail?id=" + shopId, "_blank");
}

/* =========================
   STATUS UPDATE
========================= */
function openStatus(idinvoice, idstatus) {
    document.getElementById("iddonhangupdate").value = idinvoice;
    document.getElementById("trangthaiupdate").value = idstatus;
}

async function updateStatus() {
    var trangthai = document.getElementById("trangthaiupdate").value;
    var idinvoice = document.getElementById("iddonhangupdate").value;
    var url = 'http://localhost:8080/api/invoice/admin/update-status?idInvoice=' + idinvoice + '&status=' + trangthai;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        if (res.status < 300) {
            toastr.success("Cập nhật trạng thái đơn hàng thành công!");
            $("#capnhatdonhang").modal("hide");
            loadInvoice(0);
            return;
        }

        if (res.status == exceptionCode) {
            var result = await res.json();
            toastr.warning(result.defaultMessage);
        }
    } catch (error) {
        console.error("Lỗi updateStatus:", error);
        toastr.error("Không thể cập nhật trạng thái đơn hàng");
    }
}

async function loadStatusUpdate() {
    var url = 'http://localhost:8080/api/invoice/admin/all-status';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        var list = await response.json();
        var main = '';

        for (let i = 0; i < list.length; i++) {
            main += `<option value="${list[i]}">${list[i]}</option>`;
        }
        document.getElementById("trangthaiupdate").innerHTML = main;
    } catch (error) {
        console.error("Lỗi loadStatusUpdate:", error);
    }
}

async function loadAllStatus() {
    var url = 'http://localhost:8080/api/invoice/admin/all-status';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        var list = await response.json();
        var main = '<option value="-1">--- Tất cả ---</option>';

        for (let i = 0; i < list.length; i++) {
            main += `<option value="${list[i]}">${list[i]}</option>`;
        }
        document.getElementById("trangthai").innerHTML = main;
    } catch (error) {
        console.error("Lỗi loadAllStatus:", error);
    }
}


/* =========================
   PRINT INVOICE
========================= */
async function loadDetailInvoicePrint() {
    try {
        var uls = new URL(document.URL);
        var id = uls.searchParams.get("id");

        var url = 'http://localhost:8080/api/invoice-detail/admin/find-by-invoice?idInvoice=' + id;
        const res = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        const list = await res.json();
        let main = '';
        let tongTienTam = 0;

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const product = item.product || {};
            const variant = item.productVariant || {};
            const quantity = Number(item.quantity || 0);
            const price = Number(item.price || variant.price || 0);
            const variantText = getVariantDisplayName(variant);

            tongTienTam += price * quantity;

            main += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${product.name || ''}</td>
                    <td>${variantText}</td>
                    <td>${quantity}</td>
                    <td>${formatmoney(price)}</td>
                    <td>${formatmoney(price * quantity)}</td>
                </tr>
            `;
        }

        document.getElementById("listDetailinvoice").innerHTML = main;
        document.getElementById("tongtam").innerHTML = formatmoney(tongTienTam);
        document.getElementById("tongTientt").innerHTML = formatmoney(tongTienTam);

        var urlInvoice = 'http://localhost:8080/api/invoice/admin/find-by-id?idInvoice=' + id;
        const resp = await fetch(urlInvoice, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        const result = await resp.json();
        document.getElementById("mahoadon").innerHTML = "#" + result.id;
        document.getElementById("ngayTao").innerHTML = result.createdDate || '';

        if (result.voucher != null) {
            document.getElementById("giamgia").innerHTML = "- " + formatmoney(result.voucher.discount || 0);
            document.getElementById("tongTientt").innerHTML = formatmoney(tongTienTam - (result.voucher.discount || 0));
        }

        if (result.receiverName != null) {
            document.getElementById("tenkhachhang").innerHTML = `
                <p>Khách Hàng</p>
                <span>${result.receiverName}</span>
            `;
        }
    } catch (error) {
        console.error("Lỗi loadDetailInvoicePrint:", error);
        toastr.error("Không tải được hóa đơn in");
    }
}

/* =========================
   SEARCH INVOICE
========================= */
function searchInvoice(page = 0) {
    var q = document.getElementById("search").value.trim();
    if (q === "") {
        loadInvoice(0);
        return;
    }

    var url = `http://localhost:8080/api/invoice/admin/search?q=${q}&page=${page}&size=${size}`;

    fetch(url, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
        .then(res => res.json())
        .then(result => {
            var list = result.content || [];
            var main = "";

            for (let i = 0; i < list.length; i++) {
                main += `
                <tr>
                    <td>${list[i].id}</td>
                    <td>${list[i].createdTime || ''}<br>${list[i].createdDate || ''}</td>
                    <td>${list[i].address || ''}</td>
                    <td>${formatmoney(list[i].totalAmount || 0)}</td>
                    <td>${formatmoney(list[i].shipCost || 0)}</td>
                    <td>
                        ${list[i].payType == 'MOMO'
                        ? '<span class="dathanhtoan">Đã thanh toán</span>'
                        : '<span class="chuathanhtoan">Thanh toán khi nhận hàng (COD)</span>'}
                    </td>
                    <td>${list[i].statusInvoice || ''}</td>
                    <td class="sticky-col">
                        <i onclick="loadDetailInvoice(${list[i].id})"
                           data-bs-toggle="modal"
                           data-bs-target="#modaldeail"
                           class="fa fa-eye iconaction"></i>
                    </td>
                </tr>
            `;
            }

            document.getElementById("listinvoice").innerHTML = main;
        })
        .catch(error => {
            console.error("Lỗi searchInvoice:", error);
            toastr.error("Không tìm kiếm được hóa đơn");
        });
}