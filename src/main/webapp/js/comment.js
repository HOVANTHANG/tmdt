var star = 5;
async function loadProductComment() {
    if (token == null) {
        document.getElementById("mycomment").innerHTML = ''
    }
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    if (id != null) {
        var url = 'http://localhost:8080/api/product-comment/public/find-by-product?idproduct=' + id;
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });
        var list = await response.json();
        var main = ''
        for (i = 0; i < list.length; i++) {
            var listImg = ''
            for (j = 0; j < list[i].productCommentImages.length; j++) {
                listImg += `<img class="imgcomment" src="${list[i].productCommentImages[j].linkImage}">`
            }
            var star = '';
            for (j = 0; j < list[i].star; j++) {
                star += `<span class="fa fa-star checkedstar"></span>`
            }
            main += `<div class="singlectlct">
            <div class="row">
                <div class="col-11">
                    <div class="d-flex nguoidangctl">
                        <img class="avtuserdangctl" src="image/avatar.webp">
                        <span class="usernamedangctl">${list[i].user.fullname==null?'Người dùng':list[i].user.fullname}</span>
                        <span class="ngaytraloi">${list[i].createdDate}</span>
                        <span class="starcmts">${star}</span>
                        ${list[i].isMyComment==true?`<span class="starcmts"><i onclick="deleteComment(${list[i].id})" class="fa fa-trash pointer"></i></span>`:''}
                    </div>
                    <div class="contentctlct">${list[i].content}</div>
                    <div class="listimgcontent">
                        ${listImg}
                    </div>
                </div>
            </div>
        </div>`
        }
        document.getElementById("listcautlct").innerHTML = main
    }
}

function loadStar(val) {
    star = val + 1;
    var listS = document.getElementById("liststar").getElementsByClassName("fa-star");
    for (i = 0; i < listS.length; i++) {
        listS[i].classList.remove('checkedstar');
    }
    for (i = 0; i < listS.length; i++) {
        if (i <= val) {
            listS[i].classList.add('checkedstar');
        }
    }

}

async function uploadMultipleFile(fileInput) {
    const formData = new FormData()
    for (i = 0; i < fileInput.files.length; i++) {
        formData.append("file", fileInput.files[i])
    }
    var urlUpload = 'http://localhost:8080/api/public/upload-multiple-file';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    if(res.status < 300){
        return await res.json();
    }
    else{
        return [];
    }
}

async function saveComment() {
    document.getElementById("loading").style.display = 'block'
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var url = 'http://localhost:8080/api/product-comment/user/create';
    var noidungbl = document.getElementById("noidungbl").value
    if (document.getElementById("choosefilecmt").files.length > 3) {
        alert("Chỉ được chọn tối đa 3 ảnh");
        return;
    }
    var listLinkImg = await uploadMultipleFile(document.getElementById("choosefilecmt"));
    var comment = {
        "star": star,
        "content": noidungbl,
        "listLink": listLinkImg,
        "product": {
            "id": id
        }
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(comment)
    });
    if (response.status < 300) {
        toastr.success("Đã đăng bình luận của bạn");
        loadProductComment();
    } else {
        toastr.error("Thất bại!");
        document.getElementById("loading").style.display = 'none'
    }
    document.getElementById("loading").style.display = 'none'
}

async function deleteComment(id) {
    var con = confirm("Bạn muốn xóa bình luận này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/product-comment/user/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa thành công!");
        loadProductComment();
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

function setFile(){
    var count = document.getElementById("choosefilecmt").files.length;
    document.getElementById("slfile").innerHTML = "Đã chọn "+count+" ảnh";
}