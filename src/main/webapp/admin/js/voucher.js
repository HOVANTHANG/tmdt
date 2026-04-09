var token = localStorage.getItem("token");
var size = 10;
async function loadVoucher(page, start, end) {
    var url = 'http://localhost:8080/api/voucher/admin/findAll-page?page=' + page + '&size=' + size;
    if (start != null && start != "" && end != null && end != "" && start != 'null' && end != 'null') {
        url += '&start=' + start + '&end=' + end
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<tr>
                    <td>${list[i].id}</td>
                    <td>${list[i].code}</td>
                    <td>${list[i].name}</td>
                    <td>${formatmoney(list[i].minAmount)}</td>
                    <td>${formatmoney(list[i].discount)}</td>
                    <td>${list[i].startDate}</td>
                    <td>${list[i].endDate}</td>
                    <td>${list[i].block == true ? '<span class="locked">Đã khóa</span>':'<span class="actived">Đang hoạt động</span>'}</td>
                    <td class="sticky-col">
                        <i onclick="deleteVoucher(${list[i].id})" class="fa fa-trash iconaction"></i><br>
                        <a href="addvoucher?id=${list[i].id}"><i class="fa fa-edit iconaction"></i></a>
                    </td>
                </tr>`
    }
    document.getElementById("listvoucher").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadVoucher(${(Number(i) - 1)},'${start}','${end}')" class="page-item"><a class="page-link" href="#listsp">${i}</a></li>`
    }
    document.getElementById("pageable").innerHTML = mainpage
}


async function filter() {
    var start = document.getElementById("start").value
    var end = document.getElementById("end").value
    if (start != "" && end != "") {
        loadVoucher(0, start, end);
    }
}


async function loadAVoucher() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    if (id != null) {
        var url = 'http://localhost:8080/api/voucher/admin/findById?id=' + id;
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });
        var result = await response.json();
        document.getElementById("code").value = result.code
        document.getElementById("namevoucher").value = result.name
        document.getElementById("minamount").value = result.minAmount
        document.getElementById("discount").value = result.discount
        document.getElementById("from").value = result.startDate
        document.getElementById("to").value = result.endDate
        result.block == true ? document.getElementById("lockvoucher").checked = true : false;
    }
}

async function saveVoucher() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var code = document.getElementById("code").value
    var namevoucher = document.getElementById("namevoucher").value
    var minamount = document.getElementById("minamount").value
    var discount = document.getElementById("discount").value
    var from = document.getElementById("from").value
    var to = document.getElementById("to").value
    var lockvoucher = document.getElementById("lockvoucher").checked

    var url = 'http://localhost:8080/api/voucher/admin/create';
    if (id != null) {
        url = 'http://localhost:8080/api/voucher/admin/update';
    }
    var voucher = {
        "id": id,
        "code": code,
        "name": namevoucher,
        "discount": discount,
        "minAmount": minamount,
        "startDate": from,
        "endDate": to,
        "block": lockvoucher
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(voucher)
    });
    if (response.status < 300) {
        swal({
                title: "Thông báo",
                text: "thêm/sửa voucher thành công!",
                type: "success"
            },
            function() {
                window.location.href = 'voucher'
            });
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

async function deleteVoucher(id) {
    var con = confirm("Bạn chắc chắn muốn xóa voucher này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/voucher/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa voucher thành công!");
        loadVoucher(null,document.getElementById("start").value, document.getElementById("end").value)
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}