var listFile = [];

var storagelist = [];

// ── Hiển thị badge trạng thái sản phẩm ──────────────────
function statusBadge(status) {
    if (status === 'APPROVED') {
        return `<span style="background:#dcfce7;color:#15803d;font-size:.72rem;font-weight:700;
                border-radius:6px;padding:3px 9px;white-space:nowrap;">
                <i class="fa-solid fa-circle-check" style="margin-right:3px;"></i>Đã duyệt</span>`;
    }
    if (status === 'REJECTED') {
        return `<span style="background:#fee2e2;color:#dc2626;font-size:.72rem;font-weight:700;
                border-radius:6px;padding:3px 9px;white-space:nowrap;"
                title="Sản phẩm bị từ chối — Hãy chỉnh sửa lại và liên hệ admin">
                <i class="fa-solid fa-circle-xmark" style="margin-right:3px;"></i>Bị từ chối</span>`;
    }
    // PENDING hoặc null
    return `<span style="background:#fef9c3;color:#a16207;font-size:.72rem;font-weight:700;
            border-radius:6px;padding:3px 9px;white-space:nowrap;">
            <i class="fa-solid fa-clock" style="margin-right:3px;"></i>Chờ duyệt</span>`;
}



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
        document.getElementById("hangsx").value = result.tradeMark ? result.tradeMark.id : ""
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


        let generatedVariants = [];

        if (result.productVariants && result.productVariants.length > 0) {
            generatedVariants = result.productVariants.map(v => ({
                tier1name: v.tier1name,
                tier1value: v.tier1value,
                tier2name: v.tier2name,
                tier2value: v.tier2value,
                price: v.price,
                quantity: v.quantity,
                image: v.image
            }));

            renderVariants(); // gọi lại UI của bạn
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

    var url = 'http://localhost:8080/api/product/seller/create';
    if (id != null) {
        url = 'http://localhost:8080/api/product/seller/update';
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
    if (price == null || price == "") {
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
        "tradeMarkId": hangsx,
        "categoryId": danhmucsp,
        "linkLinkImages": listLinkImg,
        "variants": generatedVariants
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
            function () { window.location.href = 'product' });
    }
    else {
        if (response.status == exceptionCode) {
            swal({ title: "Thông báo", text: result.defaultMessage, type: "error" },
                function () { document.getElementById("loading").style.display = 'none' });
        }
        else {
            swal({ title: "Thông báo", text: "thêm/sửa sản phẩm thất bại", type: "error" },
                function () { document.getElementById("loading").style.display = 'none' });
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
    var main = '<option value="">-- Không có thương hiệu --</option>';
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].id}">${list[i].name}</option>`
    }
    document.getElementById("hangsx").innerHTML = main
}

function loadInit() {
    $('input#choosefile').change(function () {
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

            reader.addEventListener("load", function () {
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

                button.addEventListener("click", function () {
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
async function loadProduct(page, param = "") {
    var category  = document.getElementById("danhmuc").value;
    var trademark = document.getElementById("thuonghieu").value;
    var size = 10;

    // Hiển thị trạng thái loading
    document.getElementById("listproduct").innerHTML =
        `<tr><td colspan="9" class="td-state"><i class="fa-solid fa-spinner fa-spin"></i><span>Đang tải dữ liệu...</span></td></tr>`;

    var url = 'http://localhost:8080/api/product/seller/my-shop-products?page=' + page + '&size=' + size;
    if (param != null && param.trim() !== "") url += '&search=' + encodeURIComponent(param);
    if (category)  url += '&category='  + category;
    if (trademark) url += '&trademark=' + trademark;

    try {
        const response = await fetch(url, {
            headers: new Headers({ 'Authorization': 'Bearer ' + token })
        });

        const result        = await response.json();
        const list          = result.content   || [];
        const totalPage     = result.totalPages || 0;
        const totalElements = result.totalElements || list.length;

        // Empty state
        if (list.length === 0) {
            document.getElementById("listproduct").innerHTML =
                `<tr><td colspan="9" class="td-state">
                    <i class="fa-solid fa-box-open"></i>
                    <span>Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu!</span>
                </td></tr>`;
            document.getElementById("pageable").innerHTML = '';
            if (typeof updateStats === 'function') updateStats([], 0);
            return;
        }

        let main = '';
        for (let i = 0; i < list.length; i++) {
            const p = list[i];

            // Tồn kho chi tiết từng biến thể
            let stockHtml = '';
            const variants = p.productVariants || [];
            if (variants.length > 0) {
                variants.forEach(v => {
                    const name = [v.tier1value, v.tier2value].filter(Boolean).join(' / ') || 'Mặc định';
                    const qty  = v.quantity || 0;
                    const color = qty > 0 ? 'var(--p)' : '#ef4444';
                    stockHtml += `<div class="variant-stock-row">
                        <span class="variant-stock-name">${name}</span>
                        <span class="variant-stock-qty" style="color:${color};">${qty}</span>
                    </div>`;
                });
            } else {
                stockHtml = `<span style="font-size:11px;color:var(--tx3);">—</span>`;
            }

            // Ảnh
            const imgHtml = p.imageBanner
                ? `<img src="${p.imageBanner}" class="product-thumb" alt="" loading="lazy" onerror="this.style.display='none'">`
                : `<div class="product-thumb-placeholder"><i class="fa-solid fa-image"></i></div>`;

            main += `
            <tr>
                <td><span class="row-id">#${p.id}</span></td>
                <td>${imgHtml}</td>
                <td>
                    <div class="p-name" title="${(p.name || '').replace(/"/g,'&quot;')}">${p.name || '—'}</div>
                    <div class="p-code">${p.code || ''}</div>
                </td>
                <td><span class="badge-cat" title="${p.category ? p.category.name : ''}">${p.category ? p.category.name : '—'}</span></td>
                <td><span class="badge-brand" title="${p.tradeMark ? p.tradeMark.name : ''}">${p.tradeMark ? p.tradeMark.name : '—'}</span></td>
                <td><span class="col-date">${p.createdDate || ''}</span></td>
                <td style="text-align:center;">${stockHtml}</td>
                <td style="text-align:center;">${statusBadge(p.status)}</td>
                <td>
                    <div class="tbl-actions">
                        <button onclick="deleteProduct(${p.id})" class="btn-tbl btn-tbl-delete" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                        <a href="addproduct?id=${p.id}" class="btn-tbl btn-tbl-edit" title="Chỉnh sửa">
                            <i class="fa-solid fa-pen"></i>
                        </a>
                        <button onclick="loadProductComment(${p.id})"
                                data-bs-toggle="modal" data-bs-target="#modalcomment"
                                class="btn-tbl btn-tbl-comment" title="Bình luận">
                            <i class="fa-solid fa-comments"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        }

        document.getElementById("listproduct").innerHTML = main;

        // Cập nhật stats
        if (typeof updateStats === 'function') updateStats(list, totalElements);

        // Phân trang
        let mainpage = '';
        for (let i = 0; i < totalPage; i++) {
            mainpage += `<li class="page-item ${i === page ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0)"
                   onclick="loadProduct(${i}, '${param.replace(/'/g, "\\'")}')">
                    ${i + 1}
                </a>
            </li>`;
        }
        document.getElementById("pageable").innerHTML = mainpage;

    } catch (error) {
        console.error(error);
        document.getElementById("listproduct").innerHTML =
            `<tr><td colspan="9" class="td-state">
                <i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i>
                <span>Không tải được danh sách sản phẩm. Vui lòng thử lại.</span>
            </td></tr>`;
    }
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
        loadProduct(0, "")
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
        document.getElementById("imgdathem" + id).style.display = 'none'
    }

}