var token = localStorage.getItem("token");
var size = 10;
async function loadBlog(page) {
    var sort = document.getElementById("sort").value
    var url = 'http://localhost:8080/api/blog/public/findAll?page=' + page + '&size=' + size + '&sort=' + sort;
    const response = await fetch(url, {
        method: 'GET'
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;

    var main = '';
    for (i = 0; i < list.length; i++) {
        main += ` <tr>
                    <td>#${list[i].id}</td>
                    <td><img src="${list[i].imageBanner}" style="width: 100px;"></td>
                    <td>${list[i].createdDate}</td>
                    <td>${list[i].title}</td>
                    <td>${list[i].description}</td>
                    <td class="sticky-col">
                        <i onclick="deleteBlog(${list[i].id})" class="fa fa-trash-alt iconaction"></i>
                        <a href="addblog?id=${list[i].id}"><i class="fa fa-edit iconaction"></i></a>
                    </td>
                </tr>`
    }
    document.getElementById("listblog").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadBlog(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#listsp">${i}</a></li>`
    }
    document.getElementById("pageable").innerHTML = mainpage
}

var linkImage = ''
async function saveBlog() {
    document.getElementById("loading").style.display = 'block'
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var url = 'http://localhost:8080/api/blog/admin/create';

    var title = document.getElementById("title").value
    var description = document.getElementById("description").value
    var content = tinyMCE.get('editor').getContent()
    var primaryBlog = document.getElementById("primaryBlog").checked

    const filePath = document.getElementById('fileimage')
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
    var blog = {
        "id": id,
        "title": title,
        "description": description,
        "content": content,
        "imageBanner": linkImage,
        "primaryBlog": primaryBlog
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(blog)
    });
    if (response.status < 300) {
        swal({
                title: "Thông báo",
                text: "thêm/sửa blog thành công!",
                type: "success"
            },
            function() {
                window.location.replace('blog')
            });
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
    document.getElementById("loading").style.display = 'none'
}

async function loadABlog() {
    var id = window.location.search.split('=')[1];
    if (id != null) {
        var url = 'http://localhost:8080/api/blog/public/findById?id=' + id;
        const response = await fetch(url, {
            method: 'GET'
        });
        var blog = await response.json();
        document.getElementById("title").value = blog.title
        document.getElementById("description").value = blog.description
        document.getElementById("primaryBlog").checked = blog.primaryBlog
        document.getElementById("imgpreview").src = blog.imageBanner
        linkImage = blog.imageBanner
        tinyMCE.get('editor').setContent(blog.content)
    }
}


async function deleteBlog(id) {
    var con = confirm("Xác nhận xóa bài viết này?")
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/blog/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa bài viết thành công!");
        loadBlog(0);
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}