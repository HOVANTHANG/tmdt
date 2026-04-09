var listFile = [];

var storagelist = [];

async function loadAProduct() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    if (id != null) {
        var url = 'http://localhost:8080/api/product/admin/findById?id=' + id;
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });
        var result = await response.json();
        console.log(result)
        document.getElementById("manhinh").value = result.screen
        document.getElementById("tensp").value = result.name
        document.getElementById("hedieuhanh").value = result.operaSystem
        document.getElementById("price").value = result.price
        linkbanner = result.imageBanner
        document.getElementById("imgpreview").src = result.imageBanner
        tinyMCE.get('editor').setContent(result.description)
        document.getElementById("khesim").value = result.sim
        document.getElementById("masp").value = result.code
        document.getElementById("camtruoc").value = result.frontCamera
        document.getElementById("cpu").value = result.cpu
        document.getElementById("danhmucsp").value = result.category.id
        document.getElementById("baomat").value = result.securityInfor
        document.getElementById("oldprice").value = result.oldPrice
        document.getElementById("hangsx").value = result.tradeMark.id
        document.getElementById("camsau").value = result.backCamera
        document.getElementById("chatlieu").value = result.material
        document.getElementById("tinhnangdacbiet").value = result.specialFeature
        document.getElementById("mangdd").value = result.mobileNetwork
        var phukien = result.accessory.split(",");
        console.log(phukien);
        $("#listdpar").val(phukien).change();;
        var main = ''
        for (i = 0; i < result.productImages.length; i++) {
            main += `<div id="imgdathem${result.productImages[i].id}" class="col-md-2 col-sm-4 col-6">
                        <img src="${result.productImages[i].linkImage}" class="image-uploaded">
                        <button onclick="deleteProductImage(${result.productImages[i].id})" class="btn btn-danger form-control">Xóa ảnh</button>
                    </div>`
        }
        document.getElementById("preview").innerHTML = main
        

        var mainstorage = ''
        var maincol = ''
        for (i = 0; i < result.productStorages.length; i++) {
            mainstorage += `<div class="singlebonho">
                ram: ${result.productStorages[i].ram} - Bộ nhớ trong: ${result.productStorages[i].rom} 
                <i onclick="deleteProductStorage(${result.productStorages[i].id})" class="fa fa-trash iconxoabn"></i>
                <i onclick="loadttbonho(${result.productStorages[i].id})" data-bs-toggle="modal" data-bs-target="#suabonhomodal" class="fa fa-edit iconedit"></i>
            </div>`
            result.productStorages[i].idst = result.productStorages[i].id
            result.productStorages[i].color = []
            storagelist.push(result.productStorages[i]);

            for(j=0; j<result.productStorages[i].productColors.length; j++){
                maincol += `<div class="singlebonho">
                <img src="${result.productStorages[i].productColors[j].image}" class="imgaddpro"> ${result.productStorages[i].productColors[j].name}, 
                giá bán: ${formatmoney(result.productStorages[i].productColors[j].price)}, Số lượng: ${result.productStorages[i].productColors[j].quantity}, 
                ram: ${result.productStorages[i].ram} - Bộ nhớ trong: ${result.productStorages[i].rom} 
                <span class="iconxoabn" onclick="deleteProductColor(${result.productStorages[i].productColors[j].id})"><i class="fa fa-trash"></i></span>
                <i onclick="loadttMausac(${result.productStorages[i].productColors[j].id},${result.productStorages[i].id})" data-bs-toggle="modal" data-bs-target="#suamausacmodal" class="fa fa-edit iconedit"></i>
            </div>`
            }

        }
        document.getElementById("listbonhotam").innerHTML = mainstorage
        document.getElementById("listmausacdathem").innerHTML = maincol
        setSelectStorage();
    }
}

var linkbanner = '';
async function saveProduct() {

    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");

    var url = 'http://localhost:8080/api/product/admin/create';
    if (id != null) {
        url = 'http://localhost:8080/api/product/admin/update';
    }

    var manhinh = document.getElementById("manhinh").value
    var tensp = document.getElementById("tensp").value
    var hedieuhanh = document.getElementById("hedieuhanh").value
    var phukien = $("#listdpar").val().toString();
    var khesim = document.getElementById("khesim").value
    var masp = document.getElementById("masp").value
    var camtruoc = document.getElementById("camtruoc").value
    var cpu = document.getElementById("cpu").value
    var danhmucsp = document.getElementById("danhmucsp").value
    var baomat = document.getElementById("baomat").value
    var hangsx = document.getElementById("hangsx").value
    var camsau = document.getElementById("camsau").value
    var chatlieu = document.getElementById("chatlieu").value
    var tinhnangdacbiet = document.getElementById("tinhnangdacbiet").value
    var mangdd = document.getElementById("mangdd").value
    var price = document.getElementById("price").value
    var oldprice = document.getElementById("oldprice").value
    if(price == null || price == ""){
        alert("giá tiền không được bỏ trống")
        return;
    }


document.getElementById("loading").style.display = 'block'
    var mota = tinyMCE.get('editor').getContent()
    await uploadFile(document.getElementById("anhdaidien"));
    var listLinkImg = await uploadMultipleFileNotResp();
    // await loadColor();

    var product = {
        "id": id,
        "code": masp,
        "name": tensp,
        "price": price,
        "oldPrice": oldprice,
        "imageBanner": linkbanner,
        "description": mota,
        "screen": manhinh,
        "frontCamera": camtruoc,
        "backCamera": camsau,
        "operaSystem": hedieuhanh,
        "cpu": cpu,
        "material": chatlieu,
        "accessory": phukien,
        "specialFeature": tinhnangdacbiet,
        "sim": khesim,
        "securityInfor": baomat,
        "mobileNetwork": mangdd,
        "tradeMarkId": hangsx,
        "categoryId": danhmucsp,
        "linkLinkImages": listLinkImg,
        "linkLinkImages": listLinkImg,
        "storage": storagelist,
    }
    console.log(product)
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(product)
    });
    var result = await response.json();
    console.log(result)

    if (response.status < 300) {
        swal({ title: "Thông báo", text: "thêm/sửa sản phẩm thành công", type: "success" },
            function() { window.location.href = 'product' });
    }
    else {
        if(response.status == exceptionCode){
            swal({title: "Thông báo",text: result.defaultMessage,type: "error"},
                function() { document.getElementById("loading").style.display = 'none' });
        }
        else{
            swal({title: "Thông báo",text: "thêm/sửa sản phẩm thất bại",type: "error"},
                function() { document.getElementById("loading").style.display = 'none' });
        }
    }
}


async function uploadMultipleFile(listF) {
    const formData = new FormData()
    for (i = 0; i < listF.length; i++) {
        formData.append("file", listF[i].files[0])
    }
    var urlUpload = 'http://localhost:8080/api/public/upload-multiple-file-order-response';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    return await res.json();
}

async function uploadMultipleFileNotResp() {
    const formData = new FormData()
    for (i = 0; i < listFile.length; i++) {
        formData.append("file", listFile[i])
    }
    var urlUpload = 'http://localhost:8080/api/public/upload-multiple-file';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    if (res.status < 300) {
        return await res.json();
    } else {
        return [];
    }
}


async function uploadFile(filePath) {
    const formData = new FormData()
    formData.append("file", filePath.files[0])
    var urlUpload = 'http://localhost:8080/api/public/upload-file';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    if (res.status < 300) {
        linkbanner = await res.text();
    }
}


async function loadAllCategorySelect() {
    var url = 'http://localhost:8080/api/category/public/findAll';
    const response = await fetch(url, {
    });
    var list = await response.json();
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].id}">${list[i].name}</option>`
    }
    document.getElementById("danhmucsp").innerHTML = main
}
async function loadAllTradeMarkSelect() {
    var url = 'http://localhost:8080/api/trademark/public/findAll';
    const response = await fetch(url, {
    });
    var list = await response.json();
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].id}">${list[i].name}</option>`
    }
    document.getElementById("hangsx").innerHTML = main
}

function loadInit() {
    $('input#choosefile').change(function() {
        var files = $(this)[0].files;
    });
    document.querySelector('#choosefile').addEventListener("change", previewImages);

    function previewImages() {
        var files = $(this)[0].files;
        for (i = 0; i < files.length; i++) {
            listFile.push(files[i]);
        }

        var preview = document.querySelector('#preview');

        for (i = 0; i < files.length; i++) {
            readAndPreview(files[i]);
        }

        function readAndPreview(file) {

            // if (!/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
            //     return alert(file.name + " is not an image");
            // }

            var reader = new FileReader(file);

            reader.addEventListener("load", function() {
                var div = document.createElement('div');
                div.className = 'col-lg-2 col-md-3 col-sm-6 col-6';
                div.style.height = '120px';
                div.style.paddingTop = '5px';
                div.marginTop = '100px';
                preview.appendChild(div);

                var img = document.createElement('img');
                img.src = this.result;
                img.style.height = '85px';
                img.style.width = '90%';
                img.className = 'image-upload';
                img.style.marginTop = '5px';
                div.appendChild(img);

                var button = document.createElement('button');
                button.style.height = '30px';
                button.style.width = '90%';
                button.innerHTML = 'xóa'
                button.className = 'btn btn-warning';
                div.appendChild(button);

                button.addEventListener("click", function() {
                    div.remove();
                    console.log(listFile.length)
                    for (i = 0; i < listFile.length; i++) {
                        if (listFile[i] === file) {
                            listFile.splice(i, 1);
                        }
                    }
                    console.log(listFile.length)
                });
            });

            reader.readAsDataURL(file);

        }

    }

}
function addStorage(){
    let ms = new Date().getTime()
    var rammd = document.getElementById("rammd").value;
    var rommd = document.getElementById("rommd").value;
    var ids = ms;
    var obj = {
        "ram":rammd,
        "rom":rommd,
        "idst":ids,
        "color":[]
    }
    storagelist.push(obj);
    document.getElementById("rammd").value = "";
    document.getElementById("rommd").value = "";
    setSelectStorage();
    setPreviewStorage();
}

function setSelectStorage(){
    var main = '';
    for(i=0; i< storagelist.length; i++){
        main += `<option value="${storagelist[i].idst}">${storagelist[i].ram}-${storagelist[i].rom}</option>`
    }
    document.getElementById("bonhomb").innerHTML = main;
}
function setPreviewStorage(){
    var main = '';
    for(i=0; i< storagelist.length; i++){
        main += `
        <div class="singlebonho">
            ram: ${storagelist[i].ram} - Bộ nhớ trong: ${storagelist[i].rom} <i onclick="deleteStorage(${i})" class="fa fa-trash iconxoabn"></i>
        </div>
        `
    }
    document.getElementById("listbonhotam").innerHTML = main;
}
function deleteStorage(id){
    storagelist.splice(id, 1);
    toastr.success("Xóa bộ nhớ thành công");
    setSelectStorage();
    setPreviewStorage();
    loadMauSac();
}

async function addMauSac(){
    var bonhomb = document.getElementById("bonhomb").value;
    let ms = new Date().getTime()
    var obj = {
        "idms":ms,
        "name":document.getElementById("maumd").value,
        "price":document.getElementById("giaban").value,
        "quantity":document.getElementById("soluong").value,
        "image":""
    }
    document.getElementById("btnaddmausac").disabled = true
    var imgurl = await uploadFileResponse(document.getElementById("chonanhmau"))
    console.log(imgurl);
    document.getElementById("btnaddmausac").disabled = false
    obj.image = imgurl;

    for(i=0; i< storagelist.length; i++){
        if(storagelist[i].idst == bonhomb){
            obj.ram = storagelist[i].ram;
            obj.rom = storagelist[i].rom;
            obj.idstorage = storagelist[i].idst;
            storagelist[i].color.push(obj);
        }
    }
    console.log(storagelist);
    loadMauSac();

}


async function uploadFileResponse(filePath) {
    const formData = new FormData()
    formData.append("file", filePath.files[0])
    var urlUpload = 'http://localhost:8080/api/public/upload-file';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    if (res.status < 300) {
        var linkbannesr = await res.text();
        return linkbannesr;
    }
    return "";
}

function loadMauSac(){
    var listcolor = [];
    for(i=0; i< storagelist.length; i++){
        listcolor = listcolor.concat(storagelist[i].color);
    }
    var main = ``;
    for(i=0; i<listcolor.length; i++){
        main += ` <div class="singlebonho">
        <img src="${listcolor[i].image}" class="imgaddpro"> ${listcolor[i].name}, giá bán: ${formatmoney(listcolor[i].price)}, Số lượng: ${listcolor[i].quantity}, ram: ${listcolor[i].ram} - Bộ nhớ trong: ${listcolor[i].rom} 
        <span onclick="deleteColor(${listcolor[i].idms}, ${listcolor[i].idstorage})" class="iconxoabn"><i class="fa fa-trash"></i></span>
    </div>`
    }
    document.getElementById("listmausac").innerHTML = main;
}

function deleteColor(idcolor, idStorage){
    for(i=0; i< storagelist.length; i++){
        if(storagelist[i].idst == idStorage){
            var colors = storagelist[i].color;
            for(j=0; j<colors.length; j++){
                if(colors[j].idms == idcolor){
                    colors.splice(j, 1);
                    toastr.success("Xóa màu sắc thành công");
                    loadMauSac();
                    return;
                }
            }
        }
    }
}

async function deleteProductStorage(id) {
    var con = confirm("Xác nhận xóa bộ nhớ này?")
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/product-storage/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("Xóa thành công!");
        storagelist = [];
        loadAProduct();
    }
    else{
        toastr.error("Không thể xóa!");
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}


async function deleteProductColor(id) {
    var con = confirm("Xác nhận xóa màu này?")
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/product-color/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("Xóa thành công!");
        storagelist = []
        loadAProduct();
    }
    else{
        toastr.error("Không thể xóa!");
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}


async function loadttbonho(id){
    var url = 'http://localhost:8080/api/product-storage/public/find-by-id?id=' + id;
    const response = await fetch(url, {
    });
    var result = await response.json();
    document.getElementById("idbonhomd").value = result.id
    document.getElementById("rambnho").value = result.ram
    document.getElementById("rombnho").value = result.rom
}

async function loadttMausac(id, idstorage){
    var url = 'http://localhost:8080/api/product-color/public/find-by-id?id=' + id;
    const response = await fetch(url, {
    });
    var result = await response.json();
    document.getElementById("idmausac").value = result.id
    document.getElementById("tenmausac").value = result.name
    document.getElementById("soluongupdate").value = result.quantity
    document.getElementById("giabanupdate").value = result.price
    document.getElementById("imgpremausac").src = result.image
    document.getElementById("linkimgmausac").value = result.image
    var main = '';
    for(i=0; i< storagelist.length; i++){
        var sel = '';
        if(storagelist[i].idst == idstorage){
            sel = 'selected'
        }
        main += `<option ${sel} value="${storagelist[i].idst}">${storagelist[i].ram}-${storagelist[i].rom}</option>`
    }
    document.getElementById("bonhoupdate").innerHTML = main;
}


async function updateProductStorage() {
    var id = document.getElementById("idbonhomd").value
    var ram = document.getElementById("rambnho").value
    var rom = document.getElementById("rombnho").value
    var obj = {
        "id":id,
        "ram":ram,
        "rom":rom
    }
    var url = 'http://localhost:8080/api/product-storage/admin/update';

    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(obj)
    });
    if (response.status < 300) {
        toastr.success("Cập nhật thành công!");
        storagelist = []
        loadAProduct();
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}



async function setImginput() {
    var filePath = document.getElementById("chonanhmauupdate");
    document.getElementById("btnupdatemausac").disabled = true
    const formData = new FormData()
    formData.append("file", filePath.files[0])
    var urlUpload = 'http://localhost:8080/api/public/upload-file';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    if (res.status < 300) {
        var linkbannerss = await res.text();
        document.getElementById("linkimgmausac").value = linkbannerss
        document.getElementById("btnupdatemausac").disabled = false
    }
    document.getElementById("btnupdatemausac").disabled = false
}


async function updateProductImage() {
    var id = document.getElementById("idmausac").value
    var name = document.getElementById("tenmausac").value
    var quantity = document.getElementById("soluongupdate").value
    var price = document.getElementById("giabanupdate").value
    var bonho = document.getElementById("bonhoupdate").value
    var image = document.getElementById("linkimgmausac").value
    var obj = {
        "id":id,
        "name":name,
        "quantity":quantity,
        "price":price,
        "image":image,
        "productStorage":{"id":bonho},
    }
    var url = 'http://localhost:8080/api/product-color/admin/update';

    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(obj)
    });
    if (response.status < 300) {
        toastr.success("Cập nhật thành công!");
        storagelist = []
        loadAProduct();
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}


var size = 8;
async function loadProduct(page, param) {
    param == null ? param = "" : param = param;
    var category = document.getElementById("danhmuc").value
    var trademark = document.getElementById("thuonghieu").value
    var url = 'http://localhost:8080/api/product/public/find-all-by-admin?page=' + page + '&size=' + size + '&search=' + param;
    if (category != "" && category != null) {
        url += '&category=' + category
    }
    if (trademark != "" && trademark != null) {
        url += '&trademark=' + trademark
    }

    const response = await fetch(url, {});
    var result = await response.json();
    var list = result.content;
    var totalPage = result.totalPages;

   var main = '';
   for (i = 0; i < list.length; i++) {

       // 👉 Tạo nhiều dòng tồn kho
       let stockDetail = "";
       if (list[i].productStorages) {
           list[i].productStorages.forEach(storage => {
               if (storage.productColors) {
                   storage.productColors.forEach(color => {
                       stockDetail += `${color.name} - ${storage.ram}GB/${storage.rom}GB : ${color.quantity}<br>`;
                   });
               }
           });
       }

       main += `<tr>
                   <td>#${list[i].id}</td>
                   <td><img src="${list[i].imageBanner}" style="width: 100px;"></td>
                   <td>${list[i].code}</td>
                   <td>${list[i].name}</td>
                   <td>${list[i].category.name}</td>
                   <td>${list[i].tradeMark.name}</td>
                   <td>${formatmoney(list[i].price)}</td>
                   <td>${list[i].createdTime}<br>${list[i].createdDate}</td>
                   <td>${list[i].quantitySold}</td>
                   <td>${stockDetail}</td> <!-- 👈 Cột tồn kho nhiều dòng -->
                   <td class="sticky-col">
                       <i onclick="deleteProduct(${list[i].id})" class="fa fa-trash-alt iconaction"></i>
                       <a href="addproduct?id=${list[i].id}"><i class="fa fa-edit iconaction"></i></a>
                       <br><i onclick="loadProductComment(${list[i].id})" data-bs-toggle="modal" data-bs-target="#modalcomment"
                              class="fa fa-comments iconaction"></i>
                   </td>
               </tr>`;

   }

    document.getElementById("listproduct").innerHTML = main;

    var mainpage = '';
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadProduct(${(Number(i) - 1)},${param})"
                         class="page-item">
                         <a class="page-link" href="#listsp">${i}</a>
                     </li>`
    }
    document.getElementById("pageable").innerHTML = mainpage;
}


async function deleteProduct(id) {
    var con = confirm("Bạn chắc chắn muốn xóa sản phẩm này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/product/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa sản phẩm thành công!");
        loadProduct(0,"")
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

async function deleteProductImage(id) {
    var con = confirm("Bạn chắc chắn muốn xóa ảnh sản phẩm này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/product-image/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa ảnh sản phẩm thành công!");
        document.getElementById("imgdathem"+id).style.display = 'none'
    }

}