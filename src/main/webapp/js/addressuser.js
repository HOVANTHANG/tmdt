async function loadAddressUser() {
    var url = 'http://localhost:8080/api/user-address/user/my-address';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await response.json();
    var main = '';
    for (i = 0; i < list.length; i++) {
        var defaultBadge = list[i].primaryAddres == true 
            ? '<span class="address-card-default"><i class="fas fa-check-circle"></i> Mặc định</span>' 
            : '';
        main += `<div class="address-card">
            <div class="address-card-header">
                <div>
                    <span class="address-card-name">${list[i].fullname}</span>
                    ${defaultBadge}
                </div>
                <div class="address-card-actions">
                    <button onclick="loadAddressUserById(${list[i].id})" data-bs-toggle="modal" data-bs-target="#modaladd" class="btn-action btn-edit"><i class="fas fa-pen"></i> Sửa</button>
                    <button onclick="deleteAddressUser(${list[i].id})" class="btn-action btn-delete"><i class="fas fa-trash"></i> Xóa</button>
                </div>
            </div>
            <div class="address-card-info">
                <div class="info-item">
                    <i class="fas fa-home"></i>
                    <span>${list[i].streetName}, ${list[i].wards.name}, ${list[i].wards.districts.name}, ${list[i].wards.districts.province.name}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-phone"></i>
                    <span>${list[i].phone}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>${list[i].createdDate}</span>
                </div>
            </div>
        </div>`
    }
    document.getElementById("listaddacc").innerHTML = main
}

async function loadAddressUserById(id) {
    var url = 'http://localhost:8080/api/user-address/user/findById?id=' + id;
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await response.json();
    document.getElementById("idadduser").value = result.id
    document.getElementById("fullnameadd").value = result.fullname
    document.getElementById("phoneadd").value = result.phone
    document.getElementById("stressadd").value = result.streetName
    document.getElementById("tinh").value = result.wards.districts.province.id
    if (result.primaryAddres == true) {
        document.getElementById("primaryadd").checked = true;
    } else {
        document.getElementById("primaryadd").checked = false;
    }
    loadHuyen(result.wards.districts.province.id)
    loadXa(result.wards.districts.id, result.wards.districts.province.id)
    document.getElementById("huyen").value = result.wards.districts.id
    document.getElementById("xa").value = result.wards.id
}

function clearData() {
    document.getElementById("idadduser").value = ""
    document.getElementById("fullnameadd").value = ""
    document.getElementById("phoneadd").value = ""
    document.getElementById("stressadd").value = ""
    document.getElementById("tinh").value = 0
    document.getElementById("primaryadd").checked = false;
    document.getElementById("huyen").innerHTML = ""
    document.getElementById("xa").innerHTML = ""
}


async function addAddressUser() {
    var id = document.getElementById("idadduser").value;
    var fullnameadd = document.getElementById("fullnameadd").value;
    var phoneadd = document.getElementById("phoneadd").value;
    var stressadd = document.getElementById("stressadd").value;
    var ward = document.getElementById("xa").value;
    var primaryadd = document.getElementById("primaryadd").checked;
    var addu = {
        "id": id,
        "fullname": fullnameadd,
        "phone": phoneadd,
        "streetName": stressadd,
        "primaryAddres": primaryadd,
        "wards": {
            id: ward
        }
    }
    var url = 'http://localhost:8080/api/user-address/user/create';
    if (id != "" && id != null) {
        url = 'http://localhost:8080/api/user-address/user/update';
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(addu)
    });
    if (response.status < 300) {
        swal({
                title: "Thông báo",
                text: "Thành công",
                type: "success"
            },
            function() {
                window.location.reload();
            });
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}


async function deleteAddressUser(id) {
    var con = confirm("Bạn chắc chắn muốn xóa địa chỉ này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/user-address/user/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa địa chỉ thành công!");
        await new Promise(r => setTimeout(r, 1000));
        window.location.reload();
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

var listAddUser = [];
async function loadAddressUserSelect() {
    var url = 'http://localhost:8080/api/user-address/user/my-address';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await response.json();
    var main = '';
    var addressUser = null
    for (i = 0; i < list.length; i++) {
        listAddUser.push(list[i]);
        var check = ''
        if (list[i].primaryAddres == true) {
            check = 'selected';
            addressUser = list[i];
        }
        main += `<option ${check} value="${list[i].id}">${list[i].fullname}, ${list[i].streetName}, ${list[i].wards.name}, ${list[i].wards.districts.name}, ${list[i].wards.districts.province.name}</option>`
    }
    document.getElementById("sodiachi").innerHTML = main;
    loadAddInfor();
}


/**
 * Điền thông tin địa chỉ vào form checkout và cập nhật phí vận chuyển
 */
async function loadAddInfor() {
    var val = document.getElementById("sodiachi").value;
    var address = null;

    for (var i = 0; i < listAddUser.length; i++) {
        if (listAddUser[i].id == val) {
            address = listAddUser[i];
            break;
        }
    }

    if (!address) return;

    // Điền thông tin vào các ô readonly
    document.getElementById("fullname").value    = address.fullname;
    document.getElementById("phone").value       = address.phone;
    document.getElementById("stressName").value  = address.streetName;

    // Tính phí vận chuyển (hàm định nghĩa trong checkout.js)
    await capNhatPhiShip(address);
}






// Các hàm layTinhShip / layHuyenShip / layXaShip đã được chuyển sang checkout.js
// để tránh trùng lặp. Gọi capNhatPhiShip(address) để tính phí vận chuyển.