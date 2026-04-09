var token = localStorage.getItem("token");
var size = 10;
async function loadTrademark(page, param) {
    if (param == null) {
        param = "";
    }
    var url = 'http://localhost:8080/api/trademark/public/search?page=' + page + '&size=' + size + '&q=' + param;
    const response = await fetch(url, {
        method: 'GET'
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;

    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<tr>
                    <td>${list[i].id}</td>
                    <td>${list[i].name}</td>
                    <td class="sticky-col">
                        <i onclick="deleteTrademark(${list[i].id})" class="fa fa-trash-alt iconaction"></i>
                        <a data-bs-toggle="modal" data-bs-target="#addtk" href="#" onclick="loadATrademark(${list[i].id})"><i class="fa fa-edit iconaction"></i></a>
                    </td>
                </tr>`
    }
    document.getElementById("listtrademark").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadTrademark(${(Number(i) - 1)},${param})" class="page-item"><a class="page-link" href="#listsp">${i}</a></li>`
    }
    document.getElementById("pageable").innerHTML = mainpage
}


async function loadATrademark(id) {
    var url = 'http://localhost:8080/api/trademark/admin/findById?id=' + id;
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await response.json();
    document.getElementById("idtrademark").value = result.id
    document.getElementById("trademarkname").value = result.name
}

function clearData(){
    document.getElementById("idtrademark").value = ""
    document.getElementById("trademarkname").value = ""
}


async function saveTrademark() {
    var id = document.getElementById("idtrademark").value
    var name = document.getElementById("trademarkname").value

    var url = 'http://localhost:8080/api/trademark/admin/create';
    if (id != "" && id != null) {
        url = 'http://localhost:8080/api/trademark/admin/update';
    }
    var trademark = {
        "id": id,
        "name": name,
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(trademark)
    });
    if (response.status < 300) {
        toastr.success("thêm/sửa thương hiệu thành công!");
        loadTrademark(0,"");
        $("#addtk").modal('hide');
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

async function deleteTrademark(id) {
    var con = confirm("Bạn chắc chắn muốn xóa thương hiệu này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/trademark/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa thương hiệu thành công!");
        loadTrademark(0,"");
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

async function loadTrademarkProduct() {
    var url = 'http://localhost:8080/api/trademark/public/findAll';
    const response = await fetch(url, {
        method: 'GET'
    });
    var list = await response.json();

    var main = '<option value="">Tất cả thương hiệu</option>';
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].id}">${list[i].name}</option>`
    }
    document.getElementById("thuonghieu").innerHTML = main
}