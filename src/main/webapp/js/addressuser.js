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
        main += `<div class="row singleadd">
        <div class="col-lg-11 col-md-11 col-sm-12 col-12">
            <table class="table tableadd">
                <tr class="trthead">
                    <td class="tdleft">Họ tên:</td>
                    <td class="tdright">${list[i].fullname}
                        <span class="addressdef">${list[i].primaryAddres == true ?'<i class="fa fa-check-circle"></i> Địa chỉ mặc định':''}</span>
                    </td>
                </tr>
                <tr>
                    <td class="tdleft">Địa chỉ:</td>
                    <td class="tdright">${list[i].streetName}, ${list[i].wards.name}, ${list[i].wards.districts.name},<br> ${list[i].wards.districts.province.name}</td>
                </tr>
                <tr>
                    <td class="tdleft">Số điện thoại:</td>
                    <td class="tdright">${list[i].phone}</td>
                </tr>
                <tr>
                    <td class="tdleft">Ngày tạo:</td>
                    <td class="tdright">${list[i].createdDate}</td>
                </tr>
            </table>
        </div>
        <div class="col-lg-1 col-md-1 col-sm-12 col-12">
            <span onclick="loadAddressUserById(${list[i].id})" data-bs-toggle="modal" data-bs-target="#modaladd" class="actionacc acsua">Sửa</span>
            <span onclick="deleteAddressUser(${list[i].id})" class="actionacc acdel">Xóa</span>
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


var soluongsp = 0;
var phiShip = 0
async function loadAddInfor() {
    var val = document.getElementById("sodiachi").value;
    var address = null;
    for (i = 0; i < listAddUser.length; i++) {
        if (listAddUser[i].id == val) {
            address = listAddUser[i];
            break;
        }
    }
    document.getElementById("fullname").value = address.fullname
    document.getElementById("phone").value = address.phone
    document.getElementById("stressName").value = address.streetName
    var prov = address.wards.name + ", " + address.wards.districts.name + ", " + address.wards.districts.province.name
    var province = `<option>${prov}</option>`

    // tính phí ship
    if(address != null){
        total = Number(total) - Number(phiShip)
        var province = await loadTinhShip(address.wards.districts.province.name)
        console.log(province)

        var district = await loadHuyenShip(address.wards.districts.name, province.ProvinceID);
        console.log(district)

        var ward = await loadXaShip(address.wards.name, district.DistrictID);
        console.log(ward)
        var weight = Math.ceil(soluongsp * 0.5);
        var url = '/api/shipping/tinh-phi?toDistrictId='+district.DistrictID+'&toWardCode='+ward.WardCode+'&weight='+weight
        const res = await fetch(url, {});
        var result = await res.json();
        phiShip = result.data.total;
        document.getElementById("phiship").innerHTML = formatmoney(phiShip)
        total = Number(total) + Number(phiShip)
        document.getElementById("totalfi").innerHTML = formatmoneyCheck(total);
    }
}






async function loadTinhShip(tentinh){
    var respon = await fetch('http://localhost:8080/api/shipping/public/province', {});
    var provinces = await respon.json();
    var province = null;
    for(var i=0; i< provinces.data.length; i++){
        if(tentinh.toLowerCase().includes(provinces.data[i].ProvinceName.toLowerCase())){
            province = provinces.data[i];
        }
    }
    return province
}
async function loadHuyenShip(tenhuyen, ProvinceID){
    var respon = await fetch('http://localhost:8080/api/shipping/public/district?provinceId='+ProvinceID, {});
    var districts = await respon.json();
    var district = null;
    for(var i=0; i< districts.data.length; i++){
        if(tenhuyen.toLowerCase().includes(districts.data[i].DistrictName.toLowerCase())){
            district = districts.data[i];
        }
    }
    return district
}

async function loadXaShip(tenxa, DistrictID){
    var respon = await fetch('http://localhost:8080/api/shipping/public/wards?districtId='+DistrictID, {});
    var wards = await respon.json();
    var ward = null;
    for(var i=0; i< wards.data.length; i++){
        if(tenxa.toLowerCase().includes(wards.data[i].WardName.toLowerCase())){
            ward = wards.data[i];
        }
    }
    return ward
}