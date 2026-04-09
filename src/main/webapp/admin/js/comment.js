async function loadProductComment(id) {
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
                    <img class="avtuserdangctl" src="../image/avatar.webp">
                    <span class="usernamedangctl">${list[i].user.fullname==null?'Người dùng':list[i].user.fullname}</span>
                    <span class="ngaytraloi">${list[i].createdDate}</span>
                    <span class="starcmts">${star}</span>
                    <span class="starcmts"><i onclick="deleteComment(${list[i].id},${id})" class="fa fa-trash pointer"></i></span>
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


async function deleteComment(id, idproduct) {
    var con = confirm("Bạn muốn xóa bình luận này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/product-comment/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa thành công!");
        loadProductComment(idproduct);
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}