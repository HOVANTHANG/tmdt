var token = localStorage.getItem("token");
var size = 10;
async function loadCategory(page, param) {
    if (param == null) {
        param = "";
    }
    var url = 'http://localhost:8080/api/category/public/search?page=' + page + '&size=' + size + '&q=' + param;
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
                    <td>${list[i].categoryType}</td>
                    <td class="sticky-col">
                        <div class="act-group">
                            <button onclick="deleteCategory(${list[i].id})" class="btn-act btn-act-red" data-tip="Xóa">
                                <i class="fa fa-trash-alt"></i>
                            </button>
                            <a class="btn-act btn-act-teal" data-bs-toggle="modal" data-bs-target="#addtk" href="#" onclick="loadACategory(${list[i].id})" data-tip="Sửa">
                                <i class="fa fa-edit"></i>
                            </a>
                        </div>
                    </td>
                </tr>`
    }
    document.getElementById("listcategory").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadCategory(${(Number(i) - 1)},${param})" class="page-item"><a class="page-link" href="#listsp">${i}</a></li>`
    }
    document.getElementById("pageable").innerHTML = mainpage
}

async function loadTypeCategory() {
    var url = 'http://localhost:8080/api/category/public/get-all-category-type';
    const response = await fetch(url, {
    });
    var list = await response.json();
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i]}">${list[i]}</option>`
    }
    document.getElementById("catetype").innerHTML = main
}












document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("categoryImageFile");

    if (!input) {
        console.warn("Không tìm thấy #categoryImageFile");
        return;
    }

    input.addEventListener("change", async function () {
        const file = this.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("http://localhost:8080/api/public/upload-file", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const imageUrl = await res.text();

            document.getElementById("categoryImage").value = imageUrl;

            const preview = document.getElementById("categoryImagePreview");
            preview.src = imageUrl;
            preview.style.display = "block";

            toastr.success("Upload ảnh thành công");
        } catch (e) {
            console.error(e);
            toastr.error("Upload ảnh thất bại");
        }
    });
});





async function loadACategory(id) {
    var url = 'http://localhost:8080/api/category/seller/findById?id=' + id;
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await response.json();
    document.getElementById("idcate").value = result.id
    document.getElementById("catename").value = result.name
    document.getElementById("catetype").value = result.categoryType
    document.getElementById("categoryImage").value = result.image || "";

    const preview = document.getElementById("categoryImagePreview");
    if (result.image) {
        preview.src = result.image;
        preview.style.display = "block";
    } else {
        preview.src = "";
        preview.style.display = "none";
    }
}


function clearData() {
    document.getElementById("idcate").value = "";
    document.getElementById("catename").value = "";
    document.getElementById("categoryImage").value = "";
    document.getElementById("categoryImageFile").value = "";

    const preview = document.getElementById("categoryImagePreview");
    preview.src = "";
    preview.style.display = "none";
}

async function saveCategory() {
    var id = document.getElementById("idcate").value
    var catename = document.getElementById("catename").value
    var catetype = document.getElementById("catetype").value

    var url = 'http://localhost:8080/api/category/seller/create';
    if (id != "" && id != null) {
        url = 'http://localhost:8080/api/category/seller/update';
    }
    var category = {
        id: id,
        name: catename,
        categoryType: catetype,
        image: document.getElementById("categoryImage").value
    };
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(category)
    });
    if (response.status < 300) {
        toastr.success("thêm/sửa danh mục thành công!");
        loadCategory(0, "");
        $("#addtk").modal('hide');
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

async function deleteCategory(id) {
    var con = confirm("Bạn chắc chắn muốn xóa danh mục này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/category/seller/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa danh mục thành công!");
        loadCategory(0, "");
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