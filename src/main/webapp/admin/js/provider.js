var token = localStorage.getItem("token");
async function loadProvider() {
    var url = 'http://localhost:8080/api/provider/admin/all'
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
    var list = await response.json();
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += ` <tr>
                    <td>#${list[i].id}</td>
                    <td>${list[i].name}</td>
                    <td>${list[i].address}</td>
                    <td>${list[i].phoneNumber}</td>
                    <td>${list[i].email}</td>
                    <td>${list[i].isActive == true?`<span class="badge bg-success text-white">Đang hoạt động</span>`:`<span class="badge bg-danger text-white">Ngừng hoạt động</span>`}</td>
                    <td class="sticky-col">
                        <i onclick="deleteProvider(${list[i].id})" class="fa fa-trash-alt iconaction"></i>
                        <a href="add-provider?id=${list[i].id}"><i class="fa fa-edit iconaction"></i></a>
                    </td>
                </tr>`
    }
    document.getElementById("listprovider").innerHTML = main
}

async function loadProviderSelect() {
    var url = 'http://localhost:8080/api/provider/admin/all'
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
    var list = await response.json();
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].id}">${list[i].name}</option>`
    }
    document.getElementById("provider").innerHTML = main
}

async function saveProvider() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var url = 'http://localhost:8080/api/provider/admin/create';
    if(id != null){
        url = 'http://localhost:8080/api/provider/admin/update?id='+id;
    }
    var payload = {
        "id": id,
        "name": document.getElementById("name").value,
        "address": document.getElementById("address").value,
        "phoneNumber": document.getElementById("phoneNumber").value,
        "email": document.getElementById("email").value,
        "isActive": document.getElementById("isActive").checked,
    }

    const response = await fetch(url, {
        method: id == null?'POST':'PUT',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(payload)
    });
    if (response.status < 300) {
        swal({
                title: "Thông báo",
                text: id == null?"Thêm nhà cung cấp thành công":"Cập nhật nhà cung cấp thành công",
                type: "success"
            },
            function() {
                window.location.replace('provider')
            });
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

async function loadAProvider() {
    var id = window.location.search.split('=')[1];
    if (id != null) {
        var url = 'http://localhost:8080/api/provider/admin/findById?id=' + id;
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token,
            }),
        });
        var result = await response.json();
        document.getElementById("name").value = result.name
        document.getElementById("address").value = result.address
        document.getElementById("phoneNumber").value = result.phoneNumber
        document.getElementById("email").value = result.email
        document.getElementById("isActive").checked = result.isActive
    }
}


async function deleteProvider(id) {
    var con = confirm("Xác nhận xóa nhà cung cấp này?")
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/provider/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa nhà cung cấp thành công!");
        loadProvider(0);
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}