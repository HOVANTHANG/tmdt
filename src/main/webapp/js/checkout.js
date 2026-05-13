var token = localStorage.getItem("token");
var exceptionCode = 417;

var total = 0;
var giamgia = 0;
var voucherId = null;
var voucherCode = null;
var discountVou = 0;

/**
 * Kiểm tra user đã đăng nhập
 */
async function checkroleUser() {
    var token = localStorage.getItem("token");
    var url = 'http://localhost:8080/api/user/check-role-user';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        if (response.status > 300) {
            window.location.replace('login');
        }
    } catch (error) {
        console.error("Lỗi checkroleUser:", error);
        window.location.replace('login');
    }
}

/**
 * Format tiền VNĐ
 */
function formatmoneyCheck(money) {
    const VND = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    });
    return VND.format(Number(money || 0));
}

/**
 * Lấy tên biến thể để hiển thị
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
 * Ảnh hiển thị của item checkout
 */
function getCheckoutImage(product, variant) {
    if (variant && variant.image && variant.image.trim() !== "") {
        return variant.image;
    }
    if (product && product.imageBanner && product.imageBanner.trim() !== "") {
        return product.imageBanner;
    }
    return "image/product1.webp";
}

/**
 * Load cart cho trang thanh toán
 */
async function loadCartCheckOut() {
    if (token == null) {
        window.location.replace("login");
        return;
    }

    try {
        // kiểm tra số lượng cart
        var urlCount = 'http://localhost:8080/api/cart/user/count-cart';
        const resCount = await fetch(urlCount, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        var count = await resCount.text();
        if (Number(count) === 0) {
            alert("Bạn chưa có sản phẩm nào trong giỏ hàng!");
            window.location.replace("giohang");
            return;
        }

        // load cart detail
        var url = 'http://localhost:8080/api/cart/user/my-cart';
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        if (!response.ok) {
            throw new Error("Không tải được giỏ hàng checkout");
        }

        var list = await response.json();
        var main = '';
        total = 0;
        var soluongsp = 0;

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const product = item.product || {};
            const variant = item.productVariant || {};

            const quantity = Number(item.quantity || 0);
            const price = Number(variant.price || product.price || 0);
            const image = getCheckoutImage(product, variant);
            const variantName = getVariantDisplayName(variant);

            soluongsp += quantity;
            total += quantity * price;

            main += `
                <div class="row mb-3 align-items-center">
                    <div class="col-lg-2 col-md-3 col-sm-3 col-3 colimgcheck">
                        <div style="position: relative;">
                            <img src="${image}" class="procheckout" onerror="this.src='image/product1.webp'">
                            <span class="slpro">${quantity}</span>
                        </div>
                    </div>
                    <div class="col-lg-7 col-md-6 col-sm-6 col-6">
                        <span class="namecheck">${product.name || ""}</span>
                        <span class="colorcheck">${variantName}</span>
                    </div>
                    <div class="col-lg-3 col-md-3 col-sm-3 col-3 pricecheck">
                        <span>${formatmoneyCheck(quantity * price)}</span>
                    </div>
                </div>
            `;
        }

        document.getElementById("listproductcheck").innerHTML = main;
        document.getElementById("totalAmount").innerHTML = formatmoneyCheck(total);
        document.getElementById("totalfi").innerHTML = formatmoneyCheck(total + phiShip);

    } catch (error) {
        console.error("Lỗi loadCartCheckOut:", error);
        toastr.error("Không tải được giỏ hàng thanh toán");
    }
}

/**
 * Áp mã giảm giá
 */
async function loadVoucher() {
    var code = document.getElementById("codevoucher").value;

    try {
        var url = 'http://localhost:8080/api/voucher/public/findByCode?code='
            + code + '&amount=' + (total - Number(20000));

        const response = await fetch(url, {});
        var result = await response.json();

        if (response.status == exceptionCode) {
            var mess = result.defaultMessage;
            document.getElementById("messerr").innerHTML = mess;
            document.getElementById("blockmessErr").style.display = 'block';
            document.getElementById("blockmess").style.display = 'none';

            voucherCode = null;
            voucherId = null;
            discountVou = 0;

            document.getElementById("moneyDiscount").innerHTML = formatmoneyCheck(0);
            document.getElementById("totalfi").innerHTML = formatmoneyCheck(total);
            return;
        }

        if (response.status < 300) {
            voucherId = result.id;
            voucherCode = result.code;
            discountVou = result.discount || 0;

            document.getElementById("blockmessErr").style.display = 'none';
            document.getElementById("blockmess").style.display = 'block';
            document.getElementById("moneyDiscount").innerHTML = formatmoneyCheck(discountVou);
            document.getElementById("totalfi").innerHTML = formatmoneyCheck(total - discountVou);
        }
    } catch (error) {
        console.error("Lỗi loadVoucher:", error);
        toastr.error("Không kiểm tra được mã giảm giá");
    }
}

/**
 * Chọn phương thức checkout
 */
function checkout() {
    var con = confirm("Xác nhận đặt hàng!");
    if (con == false) {
        return;
    }

    var paytype = $('input[name=paytype]:checked').val();

    if (paytype == "momo") {
        requestPayMentMomo();
    }

    if (paytype == "cod") {
        paymentCod();
    }
}

/**
 * Tạo link thanh toán momo
 */
async function requestPayMentMomo() {
    try {
        var ghichu = document.getElementById("ghichudonhang").value;

        window.localStorage.setItem('ghichudonhang', ghichu);
        window.localStorage.setItem('voucherCode', voucherCode);
        window.localStorage.setItem('shipCost', phiShip);
        window.localStorage.setItem('sodiachi', document.getElementById("sodiachi").value);

        var returnurl = 'http://localhost:8080/thanhcong';
        var urlinit = 'http://localhost:8080/api/urlpayment';

        var paymentDto = {
            "content": "Sellora - Thanh toán đơn hàng",
            "returnUrl": returnurl,
            "notifyUrl": returnurl,
            "codeVoucher": voucherCode,
            "shipCost": phiShip
        };

        const res = await fetch(urlinit, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(paymentDto)
        });

        var result = await res.json();

        if (res.status < 300) {
            window.open(result.url, '_blank');
        }

        if (res.status == exceptionCode) {
            toastr.warning(result.defaultMessage);
        }
    } catch (error) {
        console.error("Lỗi requestPayMentMomo:", error);
        toastr.error("Không tạo được link thanh toán momo");
    }
}

/**
 * Callback thanh toán momo thành công
 */
async function paymentMomo() {
    try {
        var uls = new URL(document.URL);
        var orderId = uls.searchParams.get("orderId");
        var requestId = uls.searchParams.get("requestId");
        var note = window.localStorage.getItem("ghichudonhang");

        var orderDto = {
            "payType": "MOMO",
            "userAddressId": window.localStorage.getItem("sodiachi"),
            "voucherCode": window.localStorage.getItem("voucherCode"),
            "note": note,
            "requestIdMomo": requestId,
            "orderIdMomo": orderId,
            "shipCost": window.localStorage.getItem("shipCost")
        };

        var url = 'http://localhost:8080/api/invoice/user/create';
        var token = localStorage.getItem("token");

        const res = await fetch(url, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(orderDto)
        });

        const raw = await res.text();
        let result = null;

        try {
            result = raw ? JSON.parse(raw) : null;
        } catch (e) {
            result = null;
        }

        if (res.status < 300) {
            document.getElementById("thanhcong").style.display = 'block';
            document.getElementById("thatbai").style.display = 'none';
            toastr.success("Thanh toán momo thành công");
            return;
        }

        if (res.status == exceptionCode) {
            document.getElementById("thatbai").style.display = 'block';
            document.getElementById("thanhcong").style.display = 'none';
            document.getElementById("errormess").innerHTML =
                result?.defaultMessage || "Thanh toán thất bại";
            return;
        }

        document.getElementById("thatbai").style.display = 'block';
        document.getElementById("thanhcong").style.display = 'none';
        document.getElementById("errormess").innerHTML =
            result?.defaultMessage || ("Có lỗi xảy ra, mã lỗi: " + res.status);

    } catch (error) {
        console.error("Lỗi paymentMomo:", error);
        document.getElementById("thatbai").style.display = 'block';
        document.getElementById("thanhcong").style.display = 'none';
        document.getElementById("errormess").innerHTML = "Không thể kết nối tới server";
        toastr.error("Thanh toán momo thất bại");
    }
}

/**
 * Thanh toán COD
 */
async function paymentCod() {
    try {
        var note = document.getElementById("ghichudonhang").value;

        var orderDto = {
            "payType": "COD",
            "userAddressId": document.getElementById("sodiachi").value,
            "voucherCode": voucherCode,
            "note": note,
            "shipCost": phiShip
        };

        var url = 'http://localhost:8080/api/invoice/user/create';
        var token = localStorage.getItem("token");

        const res = await fetch(url, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(orderDto)
        });

        if (res.status < 300) {
            swal({
                title: "Thông báo",
                text: "Đặt hàng thành công!",
                type: "success"
            }, function () {
                window.location.replace("taikhoan#invoice");
            });
        } else {
            try {
                const result = await res.json();
                toastr.error(result.defaultMessage || "Đặt hàng thất bại");
            } catch (e) {
                toastr.error("Đặt hàng thất bại");
            }
        }
    } catch (error) {
        console.error("Lỗi paymentCod:", error);
        toastr.error("Không thể đặt hàng");
    }
}







