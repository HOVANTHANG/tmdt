var sizeblog = 9;
async function loadBlogIndex() {
    var url = 'http://localhost:8080/api/blog/public/findAll?page=0&size=' + sizeblog + '&sort=id,desc';
    const response = await fetch(url, {
        method: 'GET'
    });
    var result = await response.json();
    var list = result.content;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += ` <div class="singleblogindex">
        <a href="chitietbaiviet?id=${list[i].id}">${list[i].title}</a>
    </div>`
    }
    document.getElementById("listblogindex").innerHTML = main
    loadPrimaryBlogIndex();
}


async function loadBlogList(page) {
    var url = 'http://localhost:8080/api/blog/public/findAll?page=' + page + '&size=' + sizeblog + '&sort=id,desc';
    const response = await fetch(url, {
        method: 'GET'
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<div class="singlebv row">
        <div class="col-lg-3 col-md-3 col-sm-6 col-6">
            <a href="chitietbaiviet?id=${list[i].id}"><img src="${list[i].imageBanner}" class="anhdsbaiviet"></a>
        </div>
        <div class="col-lg-7 col-md-7 col-sm-6 col-6">
            <div class="ctnoidungdsbv">
                <a href="chitietbaiviet?id=${list[i].id}" class="tagas"><span class="tieudebv">${list[i].title}</span></a>
                <span class="motabaivietds">${list[i].description}</span>
                <div class="thongtinnguoidangbv">
                    <span class="nguoidangbv"><i class="fa fa-user"></i> ${list[i].user.fullname}</span>
                    <span class="ngaydangbv"><i class="fa fa-clock"></i> ${list[i].createdDate}</span>
                </div>
            </div>
        </div>
    </div>`
    }
    document.getElementById("dsbaivietdv").innerHTML += main

    if(result.last == false){
        document.getElementById("btndsbaiviet").onclick=function(){
            loadBlogList(Number(page) + Number(1));
        }
    }
    else{
        document.getElementById("btndsbaiviet").onclick=function(){
            toastr.warning("Đã hết kết quả tìm kiếm");
        }
    }
}

async function loadPrimaryBlogIndex() {
    var url = 'http://localhost:8080/api/blog/public/findPrimaryBlog';
    const response = await fetch(url, {
        method: 'GET'
    });
    var blog = await response.json();
    var main = 
    `<a href="chitietbaiviet?id=${blog.id}" id="hrefimgpri"><img src="${blog.imageBanner}" id="blogpriimage" class="blogpriimage"></a>
    <a href="chitietbaiviet?id=${blog.id}" class="titlepriindex" id="titlepriindex">${blog.title}</a>`
    document.getElementById("blogpridiv").innerHTML = main
}

async function loadPrimaryBlogBv() {
    var url = 'http://localhost:8080/api/blog/public/findPrimaryBlog';
    const response = await fetch(url, {
        method: 'GET'
    });
    var blog = await response.json();
    var main = 
    `<img src="${blog.imageBanner}" class="imgblogchinh">
    <div class="divtieudebvchinh">
        <span class="tieudebvchinh">${blog.title}</span>
        <span class="nguoidangbvchinh"><i class="fa fa-user"></i> ${blog.user.fullname}</span>
        <span class="ngaydangbvchinh"><i class="fa fa-clock"></i> ${blog.createdDate}</span>
    </div>`
    document.getElementById("baivietmoinhat").innerHTML = main
    document.getElementById("baivietmoinhat").onclick = function(){window.location.href = 'chitietbaiviet?id='+blog.id}
}

async function loadABlog() {
    var id = window.location.search.split('=')[1];
    if (id != null) {
        var url = 'http://localhost:8080/api/blog/public/findById?id=' + id;
        const response = await fetch(url, {
            method: 'GET'
        });
        var blog = await response.json();
        document.getElementById("title").innerHTML = blog.title
        document.getElementById("noidungbaiviet").innerHTML = blog.content
        // document.getElementById("userbldt").innerHTML = blog.user.fullname
        // document.getElementById("ngaydang").innerHTML = blog.createdDate
        // document.getElementById("imgbanner").src = blog.imageBanner
    }
}