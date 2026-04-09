var token = localStorage.getItem("token");
var exceptionCode = 417;
async function checkroleUser() {
    var token = localStorage.getItem("token");
    var url = 'http://localhost:8080/api/user/check-role-user';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status > 300) {
        window.location.replace('login')
    }
}


var total = 0;
var listSize = [];
var giamgia = 0;
async function loadCartCheckOut() {
    var url = 'http://localhost:8080/api/cart/user/count-cart' ;
    const res = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var count = await res.text();
    if(count == 0){
        alert("Bạn chưa có sản phẩm nào trong giỏ hàng!");
        window.location.replace("giohang");
    }

    var url = 'http://localhost:8080/api/cart/user/my-cart' ;
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await response.json();
    var main = ''
    for (i = 0; i < list.length; i++) {
        soluongsp = Number(soluongsp)+list[i].quantity;
        total += Number(list[i].quantity * list[i].productColor.price);
        main += `<div class="row">
                    <div class="col-lg-2 col-md-3 col-sm-3 col-3 colimgcheck">
                        <img src="${list[i].product.imageBanner}" class="procheckout">
                        <span class="slpro">${list[i].quantity}</span>
                    </div>
                    <div class="col-lg-7 col-md-6 col-sm-6 col-6">
                        <span class="namecheck">${list[i].product.name}</span>
                        <span class="colorcheck">${list[i].productColor.name} / ${list[i].productStorage.ram} - ${list[i].productStorage.rom}</span>
                    </div>
                    <div class="col-lg-3 col-md-3 col-sm-3 col-3 pricecheck">
                        <span>${formatmoneyCheck(list[i].quantity * list[i].productColor.price)}</span>
                    </div>
                </div>`
    }
    document.getElementById("listproductcheck").innerHTML = main;
    document.getElementById("totalAmount").innerHTML = formatmoneyCheck(total);
    document.getElementById("totalfi").innerHTML = formatmoneyCheck(total);
}

function formatmoneyCheck(money) {
    const VND = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    return VND.format(money);
}

var voucherId = null;
var voucherCode = null;
var discountVou = 0;
async function loadVoucher() {
    var code = document.getElementById("codevoucher").value
    var url = 'http://localhost:8080/api/voucher/public/findByCode?code=' + code + '&amount=' + (total - Number(20000));
    const response = await fetch(url, {});
    var result = await response.json();
    if (response.status == exceptionCode) {
        var mess = result.defaultMessage
        document.getElementById("messerr").innerHTML = mess;
        document.getElementById("blockmessErr").style.display = 'block';
        document.getElementById("blockmess").style.display = 'none';
        voucherCode = null;
        voucherId = null;
        discountVou = 0;
        document.getElementById("moneyDiscount").innerHTML = formatmoneyCheck(0);
        document.getElementById("totalfi").innerHTML = formatmoneyCheck(total);
    }
    if (response.status < 300) {
        voucherId = result.id;
        voucherCode = result.code;
        discountVou = result.discount;
        document.getElementById("blockmessErr").style.display = 'none';
        document.getElementById("blockmess").style.display = 'block';
        document.getElementById("moneyDiscount").innerHTML = formatmoneyCheck(result.discount);
        document.getElementById("totalfi").innerHTML = formatmoneyCheck(total - discountVou);
    }

}

function checkout() {
    var con = confirm("Xác nhận đặt hàng!");
    if (con == false) {
        return;
    }
    var paytype = $('input[name=paytype]:checked').val()
    if (paytype == "momo") {
        requestPayMentMomo()
    }
    if (paytype == "cod") {
        paymentCod();
    }
}

async function requestPayMentMomo() {
    var ghichu = document.getElementById("ghichudonhang").value;
    window.localStorage.setItem('ghichudonhang', ghichu);
    window.localStorage.setItem('voucherCode', voucherCode);
    window.localStorage.setItem('shipCost', phiShip);
    window.localStorage.setItem('sodiachi', document.getElementById("sodiachi").value);
    var returnurl = 'http://localhost:8080/thanhcong';

    var urlinit = 'http://localhost:8080/api/urlpayment';
    var paymentDto = {
        "content": "Bảo ngọc mobile",
        "returnUrl": returnurl,
        "notifyUrl": returnurl,
        "codeVoucher": voucherCode,
        "shipCost": phiShip,
    }
    console.log(paymentDto)
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

}

async function paymentMomo() {
    var uls = new URL(document.URL)
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
        "shipCost":  window.localStorage.getItem("shipCost"),
    }
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
    var result = await res.json();
    if (res.status < 300) {
        document.getElementById("thanhcong").style.display = 'block'
    }
    if (res.status == exceptionCode) {
        document.getElementById("thatbai").style.display = 'block'
        document.getElementById("thanhcong").style.display = 'none'
        document.getElementById("errormess").innerHTML = result.defaultMessage
    }

}



async function paymentCod() {
    var note = document.getElementById("ghichudonhang").value;
    var orderDto = {
        "payType": "COD",
        "userAddressId": document.getElementById("sodiachi").value,
        "voucherCode": voucherCode,
        "note": note,
        "shipCost": phiShip,
    }
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
            },
            function() {
                window.location.replace("taikhoan#invoice")
            });
    }
}