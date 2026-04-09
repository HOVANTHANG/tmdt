var token = localStorage.getItem("token");

var size = 10;
async function loadInvoice(page) {
    var start = document.getElementById("start").value
    var end = document.getElementById("end").value
    var type = document.getElementById("type").value
    var trangthai = document.getElementById("trangthai").value
    var sort = document.getElementById("sort").value
    var url = 'http://localhost:8080/api/invoice/admin/find-all?page=' + page + '&size=' + size + '&sort=' + sort;
    if (start != "" && end != "") {
        url += '&from=' + start + '&to=' + end;
    }
    if (type != -1) {
        url += '&paytype=' + type;
    }
    if (trangthai != -1) {
        url += '&status=' + trangthai
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        })
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<tr>
                    <td>${list[i].id}</td>
                    <td>${list[i].createdTime}<br>${list[i].createdDate}</td>
                    <td>${list[i].address}</td>
                    <td>${formatmoney(list[i].totalAmount)}</td>
                    <td>${formatmoney(list[i].shipCost)}</td>
                    <td>${list[i].payType == 'MOMO'?'<span class="dathanhtoan">Đã thanh toán</span>':'<span class="chuathanhtoan">Thanh toán khi nhận hàng(COD)</span>'}</td>
                    <td>${list[i].statusInvoice}</td>
                    <td class="sticky-col">
                        <i onclick="loadDetailInvoice(${list[i].id})" data-bs-toggle="modal" data-bs-target="#modaldeail" class="fa fa-eye iconaction"></i>
                        <i onclick="openStatus(${list[i].id},'${list[i].statusInvoice}')" data-bs-toggle="modal" data-bs-target="#capnhatdonhang" class="fa fa-edit iconaction"></i><br>
                        <a target="_blank" href="/admin/in-don?id=${list[i].id}"><i class="fa fa-print iconaction"></i></a>
                    </td>
                </tr>`
    }
    document.getElementById("listinvoice").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadInvoice(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#listsp">${i}</a></li>`
    }
    document.getElementById("pageable").innerHTML = mainpage
}

async function loadDetailInvoice(id) {
    var url = 'http://localhost:8080/api/invoice-detail/admin/find-by-invoice?idInvoice='+id;
    const res = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await res.json();
    var main = ''
    for(i=0; i< list.length; i++){
        main += `<tr>
                    <td><img src="${list[i].product.imageBanner}" class="imgdetailacc"></td>
                    <td>
                        <a href="../detail?id=${list[i].product.id}">${list[i].product.name}</a><br>
                        <span>${list[i].productColor.name} / ${list[i].productStorage.ram} - ${list[i].productStorage.rom}</span><br>
                        <span>Mã sản phẩm: ${list[i].product.code}</span><br>
                        <span class="slmobile">SL: ${list[i].quantity}</span>
                    </td>
                    <td>${formatmoney(list[i].price)}</td>
                    <td class="sldetailacc">${list[i].quantity}</td>
                    <td class="pricedetailacc yls">${formatmoney(list[i].price * list[i].quantity)}</td>
                    <td class="d-flex">
                        <input id="imei${list[i].id}" style="max-width: 150px" value="${list[i].imei == null?'':list[i].imei}">
                        <button onclick="updateImei(${list[i].id})" class="btn btn-primary btn-sm"><i class="fa fa-check"></i></button>
                    </td>
                </tr>`
    }
    document.getElementById("listDetailinvoice").innerHTML = main

    var url = 'http://localhost:8080/api/invoice/admin/find-by-id?idInvoice='+id;
    const resp = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await resp.json();
    document.getElementById("ngaytaoinvoice").innerHTML = result.createdTime+" " + result.createdDate 
    document.getElementById("trangthaitt").innerHTML = result.payType=="MOMO"?"Đã thanh toán":"Thanh toán khi nhận hàng"
    document.getElementById("loaithanhtoan").innerHTML = result.payType=="MOMO"?"Thanh toán qua momo":"Thanh toán khi nhận hàng (COD)"
    document.getElementById("ttvanchuyen").innerHTML = result.statusInvoice
    document.getElementById("tennguoinhan").innerHTML = result.receiverName
    document.getElementById("addnhan").innerHTML = result.address
    document.getElementById("addnhan").innerHTML = result.address
    document.getElementById("phonenhan").innerHTML = result.phone
    document.getElementById("phonenhan").innerHTML = result.phone
    document.getElementById("ghichunh").innerHTML = result.note=="" ||result.note==null?'Không có ghi chú':result.note
}

function openStatus(idinvoice, idstatus) {
    document.getElementById("iddonhangupdate").value = idinvoice
    document.getElementById("trangthaiupdate").value = idstatus
}

async function updateStatus() {
    var trangthai = document.getElementById("trangthaiupdate").value
    var idinvoice = document.getElementById("iddonhangupdate").value
    var url = 'http://localhost:8080/api/invoice/admin/update-status?idInvoice=' + idinvoice + '&status=' + trangthai;
    const res = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (res.status < 300) {
        toastr.success("Cập nhật trạng thái đơn hàng thành công!");
        $("#capnhatdonhang").modal("hide")
        loadInvoice(0)
    }
    if (res.status == exceptionCode) {
        var result = await res.json()
        toastr.warning(result.defaultMessage);
    }
}

async function loadStatusUpdate() {
    var url = 'http://localhost:8080/api/invoice/admin/all-status';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        })
    });
    var list = await response.json();
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i]}">${list[i]}</option>`
    }
    document.getElementById("trangthaiupdate").innerHTML = main
}

async function updateImei(iddetail) {
    var imei = document.getElementById("imei"+iddetail).value;
    var url = `http://localhost:8080/api/invoice/admin/update-imei?detailId=${iddetail}&imei=${imei}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        })
    });
    if(response.status < 300){
        toastr.success("Cập nhật imei thành công");
    }
    else{
        if(response.status == exceptionCode){
            var result = await response.json();
            toastr.error(result.defaultMessage);
        }
        else{
            toastr.error("Có lỗi "+response.status+" xảy ra");
        }
    }
}

async function loadAllStatus() {
    var url = 'http://localhost:8080/api/invoice/admin/all-status';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        })
    });
    var list = await response.json();
    var main = '<option value="-1">--- Tất cả ---</option>';
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i]}">${list[i]}</option>`
    }
    document.getElementById("trangthai").innerHTML = main
}


async function loadDetailInvoicePrint() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var url = 'http://localhost:8080/api/invoice-detail/admin/find-by-invoice?idInvoice=' + id;
    const res = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await res.json();
    var main = ''
    var tongTienTam = 0;
    for (i = 0; i < list.length; i++) {
        tongTienTam = Number(tongTienTam) + Number(list[i].price * list[i].quantity);
        main += `<tr>
                    <td>${Number(i) + Number(1)}</td>
                    <td>${list[i].productName}</td>
                    <td>${list[i].productSize.sizeName}</td>
                    <td>${list[i].colorName}</td>
                    <td>${list[i].quantity}</td>
                    <td>${formatmoney(list[i].price)}</td>
                    <td>${formatmoney(list[i].price * list[i].quantity)}</td>
                </tr>`
    }
    document.getElementById("listDetailinvoice").innerHTML = main
    document.getElementById("tongtam").innerHTML = formatmoney(tongTienTam)
    document.getElementById("tongTientt").innerHTML = formatmoney(tongTienTam)

    var url = 'http://localhost:8080/api/invoice/admin/find-by-id?idInvoice=' + id;
    const resp = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await resp.json();
    document.getElementById("mahoadon").innerHTML = "#"+result.id
    document.getElementById("ngayTao").innerHTML = result.createdDate
    if(result.voucher != null){
        document.getElementById("giamgia").innerHTML = "- "+formatmoney(result.voucher.discount)
        document.getElementById("tongTientt").innerHTML = formatmoney(tongTienTam-result.voucher.discount)
    }
    if(result.receiverName != null){
        document.getElementById("tenkhachhang").innerHTML = `<p>Khách Hàng</p>
            <span>${result.receiverName}</span>`
    }

}

function searchInvoice(page = 0) {
    var q = document.getElementById("search").value.trim();
    if (q === "") {
        loadInvoice(0); // nếu rỗng thì load lại danh sách
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
        var list = result.content;
        var main = "";

        for (let i = 0; i < list.length; i++) {
            main += `<tr>
                <td>${list[i].id}</td>
                <td>${list[i].createdTime}<br>${list[i].createdDate}</td>
                <td>${list[i].address}</td>
                <td>${formatmoney(list[i].totalAmount)}</td>
                <td>${formatmoney(list[i].shipCost)}</td>
                <td>${list[i].payType == 'MOMO'
                    ? '<span class="dathanhtoan">Đã thanh toán</span>'
                    : '<span class="chuathanhtoan">Thanh toán khi nhận hàng(COD)</span>'}
                </td>
                <td>${list[i].statusInvoice}</td>
                <td class="sticky-col">
                    <i onclick="loadDetailInvoice(${list[i].id})"
                        data-bs-toggle="modal"
                        data-bs-target="#modaldeail"
                        class="fa fa-eye iconaction"></i>
                </td>
            </tr>`;
        }

        document.getElementById("listinvoice").innerHTML = main;
    });
}