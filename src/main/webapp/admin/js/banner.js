var token = localStorage.getItem("token");
var size = 10;
async function loadBanner(page, param) {
    if (param == null) {
        param = "";
    }
    var url = 'http://localhost:8080/api/banner/public/search?page=' + page + '&size=' + size + '&q=' + param;
    const response = await fetch(url, {
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;

    var main = '';
    for (i = 0; i < list.length; i++) {
        main += ` <tr>
        <td>#${list[i].id}</td>
        <td><img src="${list[i].image}" style="width: 100px;"></td>
        <td>${list[i].bannerType}</td>
        <td>${list[i].pageName}</td>
        <td>${list[i].linkWeb}</td>
        <td>${list[i].idProduct}</td>
        <td class="sticky-col">
            <i onclick="deleteBanner(${list[i].id})" class="fa fa-trash-alt iconaction"></i>
            <a onclick="loadABanner(${list[i].id})" href="#" data-bs-toggle="modal" data-bs-target="#addtk"><i class="fa fa-edit iconaction"></i></a>
        </td>
    </tr>`
    }
    document.getElementById("listbanner").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadBanner(${(Number(i) - 1)},${param})" class="page-item"><a class="page-link" href="#listsp">${i}</a></li>`
    }
    document.getElementById("pageable").innerHTML = mainpage
}


async function loadABanner(id) {
    var url = 'http://localhost:8080/api/banner/admin/findById?id=' + id;
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await response.json();
    document.getElementById("idbanner").value = result.id
    document.getElementById("tentrang").value = result.pageName
    document.getElementById("idsanpham").value = result.idProduct
    document.getElementById("linkweb").value = result.linkWeb
    document.getElementById("bannerType").value = result.bannerType
    document.getElementById("imgbannerpre").src = result.image
    linkImage = result.image
}

function clearData(){
    document.getElementById("idbanner").value = ""
    document.getElementById("tentrang").value = ""
    document.getElementById("idsanpham").value = ""
    document.getElementById("linkweb").value = ""
    document.getElementById("imgbannerpre").src = ""
    var linkImage = ''
}


var linkImage = ''
async function saveBanner() {
    document.getElementById("loading").style.display = 'block'
    var id = document.getElementById("idbanner").value
    var pageName = document.getElementById("tentrang").value
    var idProduct = document.getElementById("idsanpham").value
    var linkWeb = document.getElementById("linkweb").value
    var bannerType = document.getElementById("bannerType").value


    const filePath = document.getElementById('chonfileanh')
    const formData = new FormData()
    formData.append("file", filePath.files[0])
    var urlUpload = 'http://localhost:8080/api/public/upload-file';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    if (res.status < 300) {
        linkImage = await res.text();
    }

    var url = 'http://localhost:8080/api/banner/admin/create';
    if (id != "" && id != null) {
        url = 'http://localhost:8080/api/banner/admin/update';
    }
    var banner = {
        "id": id,
        "pageName": pageName,
        "idProduct": idProduct,
        "linkWeb": linkWeb,
        "image": linkImage,
        "bannerType": bannerType,
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(banner)
    });
    if (response.status < 300) {
        toastr.success("thêm/sửa banner thành công!");
        loadBanner(0,"");
        $("#addtk").modal('hide');
        clearData();
        document.getElementById("loading").style.display = 'none'
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
    document.getElementById("loading").style.display = 'none'
}

async function deleteBanner(id) {
    var con = confirm("Bạn chắc chắn muốn xóa banner này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/banner/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa banner thành công!");
        loadBanner(0,"");
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

async function loadCategoryProduct() {
    var url = 'http://localhost:8080/api/category/public/findAll';
    const response = await fetch(url, {
        method: 'GET'
    });
    var list = await response.json();

    var main = '<option value="">Tất cả danh mục</option>';
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].id}">${list[i].name}</option>`
    }
    document.getElementById("danhmuc").innerHTML = main
}