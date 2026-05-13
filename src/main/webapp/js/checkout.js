var token = localStorage.getItem("token");
var exceptionCode = 417;

var total = 0;           // Tạm tính (chưa gồm ship)
var phiShip = 0;         // Phí vận chuyển hiện tại
var discountVou = 0;     // Số tiền giảm từ voucher
var voucherId = null;
var voucherCode = null;
var soluongsp = 0;       // Tổng số lượng sản phẩm (dùng tính cân nặng)

// ==================== UTILITIES ====================

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

    if (tier1 && tier2) return `${tier1} / ${tier2}`;
    if (tier1) return tier1;
    if (tier2) return tier2;
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

// ==================== TÍNH TỔNG ====================

/**
 * Cập nhật hiển thị tổng tiền cuối cùng
 * Công thức: Tạm tính + Phí ship - Giảm giá voucher
 */
function capNhatTongTien() {
    var tongCuoi = Number(total) + Number(phiShip) - Number(discountVou);
    if (tongCuoi < 0) tongCuoi = 0;

    document.getElementById("totalAmount").innerHTML = formatmoneyCheck(total);
    document.getElementById("moneyDiscount").innerHTML = formatmoneyCheck(discountVou);
    document.getElementById("totalfi").innerHTML = formatmoneyCheck(tongCuoi);
}

// ==================== CART ====================

/**
 * Load cart cho trang thanh toán
 */
async function loadCartCheckOut() {
    if (token == null) {
        window.location.replace("login");
        return;
    }

    try {
        // Kiểm tra số lượng cart
        var urlCount = 'http://localhost:8080/api/cart/user/count-cart';
        const resCount = await fetch(urlCount, {
            method: 'GET',
            headers: new Headers({ 'Authorization': 'Bearer ' + token })
        });

        var count = await resCount.text();
        if (Number(count) === 0) {
            alert("Bạn chưa có sản phẩm nào trong giỏ hàng!");
            window.location.replace("giohang");
            return;
        }

        // Load danh sách cart
        var url = 'http://localhost:8080/api/cart/user/my-cart';
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({ 'Authorization': 'Bearer ' + token })
        });

        if (!response.ok) throw new Error("Không tải được giỏ hàng checkout");

        var list = await response.json();
        var main = '';
        total = 0;
        soluongsp = 0;

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
        capNhatTongTien();

    } catch (error) {
        console.error("Lỗi loadCartCheckOut:", error);
        toastr.error("Không tải được giỏ hàng thanh toán");
    }
}

// ==================== PHÍ VẬN CHUYỂN ====================

/**
 * Lấy thông tin tỉnh/thành phố từ GHN theo tên
 * @param {string} tenTinh - Tên tỉnh/thành phố
 * @returns {Object|null} - Đối tượng tỉnh từ GHN hoặc null nếu không tìm thấy
 */
async function layTinhShip(tenTinh) {
    try {
        const res = await fetch('http://localhost:8080/api/shipping/public/province', {});
        const data = await res.json();
        const provinces = data.data || [];

        // Tìm kiếm linh hoạt: tên tỉnh chứa hoặc bằng tên GHN
        const found = provinces.find(p =>
            tenTinh.toLowerCase().includes(p.ProvinceName.toLowerCase()) ||
            p.ProvinceName.toLowerCase().includes(tenTinh.toLowerCase())
        );

        if (!found) console.warn(`[Ship] Không tìm thấy tỉnh: "${tenTinh}"`);
        return found || null;
    } catch (error) {
        console.error("[Ship] Lỗi lấy danh sách tỉnh:", error);
        return null;
    }
}

/**
 * Lấy thông tin quận/huyện từ GHN theo tên
 * @param {string} tenHuyen - Tên quận/huyện
 * @param {number} provinceId - ProvinceID từ GHN
 * @returns {Object|null}
 */
async function layHuyenShip(tenHuyen, provinceId) {
    try {
        const res = await fetch(`http://localhost:8080/api/shipping/public/district?provinceId=${provinceId}`, {});
        const data = await res.json();
        const districts = data.data || [];

        const found = districts.find(d =>
            tenHuyen.toLowerCase().includes(d.DistrictName.toLowerCase()) ||
            d.DistrictName.toLowerCase().includes(tenHuyen.toLowerCase())
        );

        if (!found) console.warn(`[Ship] Không tìm thấy huyện: "${tenHuyen}"`);
        return found || null;
    } catch (error) {
        console.error("[Ship] Lỗi lấy danh sách huyện:", error);
        return null;
    }
}

/**
 * Lấy thông tin xã/phường từ GHN theo tên
 * @param {string} tenXa - Tên xã/phường
 * @param {number} districtId - DistrictID từ GHN
 * @returns {Object|null}
 */
async function layXaShip(tenXa, districtId) {
    try {
        const res = await fetch(`http://localhost:8080/api/shipping/public/wards?districtId=${districtId}`, {});
        const data = await res.json();
        const wards = data.data || [];

        const found = wards.find(w =>
            tenXa.toLowerCase().includes(w.WardName.toLowerCase()) ||
            w.WardName.toLowerCase().includes(tenXa.toLowerCase())
        );

        if (!found) console.warn(`[Ship] Không tìm thấy xã: "${tenXa}"`);
        return found || null;
    } catch (error) {
        console.error("[Ship] Lỗi lấy danh sách xã:", error);
        return null;
    }
}

/**
 * Tính phí vận chuyển dựa trên địa chỉ giao hàng
 * Gọi GHN API tuần tự: Tỉnh → Huyện → Xã → Tính phí
 *
 * @param {Object} address - Đối tượng địa chỉ user (có wards, districts, province)
 * @returns {number} - Phí vận chuyển (VNĐ), trả 0 nếu lỗi
 */
async function tinhPhiVanChuyen(address) {
    // Hiển thị trạng thái đang tính
    var elPhiShip = document.getElementById("phiship");
    if (elPhiShip) elPhiShip.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang tính...';

    try {
        var tenTinh = address.wards.districts.province.name;
        var tenHuyen = address.wards.districts.name;
        var tenXa = address.wards.name;

        // Bước 1: Lấy ProvinceID
        var tinh = await layTinhShip(tenTinh);
        if (!tinh) {
            throw new Error(`Không tìm thấy tỉnh "${tenTinh}" trong hệ thống GHN`);
        }

        // Bước 2: Lấy DistrictID
        var huyen = await layHuyenShip(tenHuyen, tinh.ProvinceID);
        if (!huyen) {
            throw new Error(`Không tìm thấy huyện "${tenHuyen}" trong hệ thống GHN`);
        }

        // Bước 3: Lấy WardCode
        var xa = await layXaShip(tenXa, huyen.DistrictID);
        if (!xa) {
            throw new Error(`Không tìm thấy xã "${tenXa}" trong hệ thống GHN`);
        }

        // Bước 4: Tính phí - cân nặng ước tính: mỗi sản phẩm ~0.5kg (min 100g)
        var weight = Math.max(100, Math.ceil(soluongsp * 500)); // đơn vị gram
        var urlPhi = `/api/shipping/tinh-phi?toDistrictId=${huyen.DistrictID}&toWardCode=${xa.WardCode}&weight=${weight}`;

        const resPhi = await fetch(urlPhi, {});
        if (!resPhi.ok) {
            throw new Error(`GHN API trả lỗi: ${resPhi.status}`);
        }

        const dataPhi = await resPhi.json();
        var phi = Number(dataPhi?.data?.total || 0);

        console.log(`[Ship] Phí vận chuyển đến ${tenXa}, ${tenHuyen}, ${tenTinh}: ${phi.toLocaleString('vi-VN')}đ`);
        return phi;

    } catch (error) {
        console.error("[Ship] Lỗi tính phí vận chuyển:", error);
        toastr.warning("Không tính được phí vận chuyển, áp dụng phí mặc định 30.000đ");
        return 30000; // Phí mặc định khi lỗi
    }
}

/**
 * Cập nhật phí vận chuyển khi user chọn địa chỉ
 * Được gọi từ addressuser.js khi địa chỉ thay đổi
 *
 * @param {Object} address - Đối tượng địa chỉ đã chọn
 */
async function capNhatPhiShip(address) {
    if (!address) return;

    // Tính phí mới
    var phiMoi = await tinhPhiVanChuyen(address);

    // Cập nhật biến toàn cục
    phiShip = phiMoi;

    // Hiển thị lên UI
    var elPhiShip = document.getElementById("phiship");
    if (elPhiShip) {
        elPhiShip.innerHTML = formatmoneyCheck(phiShip);
    }

    // Cập nhật tổng tiền
    capNhatTongTien();
}

// ==================== VOUCHER ====================

/**
 * Áp mã giảm giá
 */
async function loadVoucher() {
    var code = document.getElementById("codevoucher").value.trim();

    // Không gọi API nếu ô voucher trống
    if (!code) {
        document.getElementById("blockmessErr").style.display = 'none';
        document.getElementById("blockmess").style.display = 'none';
        voucherCode = null;
        voucherId = null;
        discountVou = 0;
        capNhatTongTien();
        return;
    }

    try {
        var url = 'http://localhost:8080/api/voucher/public/findByCode?code='
            + code + '&amount=' + (total + phiShip);

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
            capNhatTongTien();
            return;
        }

        if (response.status < 300) {
            voucherId = result.id;
            voucherCode = result.code;
            discountVou = result.discount || 0;

            document.getElementById("blockmessErr").style.display = 'none';
            document.getElementById("blockmess").style.display = 'block';
            capNhatTongTien();
        }
    } catch (error) {
        console.error("Lỗi loadVoucher:", error);
        toastr.error("Không kiểm tra được mã giảm giá");
    }
}

// ==================== CHECKOUT ====================

/**
 * Chọn phương thức checkout
 */
function checkout() {
    var con = confirm("Xác nhận đặt hàng!");
    if (con == false) return;

    var paytype = $('input[name=paytype]:checked').val();

    if (paytype == "momo") requestPayMentMomo();
    if (paytype == "cod") paymentCod();
}

/**
 * Tạo link thanh toán MoMo
 */
async function requestPayMentMomo() {
    try {
        var ghichu = document.getElementById("ghichudonhang").value;
        // Chuẩn hóa: nếu không có voucher thì lưu chuỗi rỗng thay vì "null"
        var maVoucher = voucherCode || "";

        window.localStorage.setItem('ghichudonhang', ghichu);
        window.localStorage.setItem('voucherCode', maVoucher);
        window.localStorage.setItem('shipCost', phiShip);
        window.localStorage.setItem('sodiachi', document.getElementById("sodiachi").value);

        var returnurl = 'http://localhost:8080/thanhcong';
        var urlinit = 'http://localhost:8080/api/urlpayment';

        var paymentDto = {
            "content": "Sellora - Thanh toán đơn hàng",
            "returnUrl": returnurl,
            "notifyUrl": returnurl,
            "codeVoucher": maVoucher,   // "" khi không dùng voucher
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
        toastr.error("Không tạo được link thanh toán MoMo");
    }
}

/**
 * Callback thanh toán MoMo thành công
 */
async function paymentMomo() {
    try {
        var uls = new URL(document.URL);
        var orderId = uls.searchParams.get("orderId");
        var requestId = uls.searchParams.get("requestId");
        var note = window.localStorage.getItem("ghichudonhang");

        // Lấy từ localStorage — đã được chuẩn hóa thành "" khi không có voucher
        var savedVoucher = window.localStorage.getItem("voucherCode") || "";

        var orderDto = {
            "payType": "MOMO",
            "userAddressId": window.localStorage.getItem("sodiachi"),
            "voucherCode": savedVoucher,
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
            toastr.success("Thanh toán MoMo thành công");
            return;
        }

        document.getElementById("thatbai").style.display = 'block';
        document.getElementById("thanhcong").style.display = 'none';
        document.getElementById("errormess").innerHTML =
            result?.defaultMessage || (res.status == exceptionCode ? "Thanh toán thất bại" : `Có lỗi xảy ra, mã lỗi: ${res.status}`);

    } catch (error) {
        console.error("Lỗi paymentMomo:", error);
        document.getElementById("thatbai").style.display = 'block';
        document.getElementById("thanhcong").style.display = 'none';
        document.getElementById("errormess").innerHTML = "Không thể kết nối tới server";
        toastr.error("Thanh toán MoMo thất bại");
    }
}

/**
 * Thanh toán COD
 */
async function paymentCod() {
    try {
        var note = document.getElementById("ghichudonhang").value;
        // Chuẩn hóa: nếu không có voucher thì gửi chuỗi rỗng thay vì null
        var maVoucher = voucherCode || "";

        var orderDto = {
            "payType": "COD",
            "userAddressId": document.getElementById("sodiachi").value,
            "voucherCode": maVoucher,
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
