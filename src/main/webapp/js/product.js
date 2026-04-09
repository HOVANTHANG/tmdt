var size = 5;

async function loadSanPhamBanChay(page) {
    var url = 'http://localhost:8080/api/product/public/best-saler?page=' + page + '&size=' + size+'&sort=quantitySold,desc';
    const response = await fetch(url, {
    });
    var result = await response.json();
    var list = result.content;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<div class="col-lg-20p col-md-3 col-sm-6 col-6">
        <div class="singleproduct">
            <a href="detail?id=${list[i].id}"><img src="${list[i].imageBanner}" class="productimg"></a>
            <div class="contentsinglepro">
                <p class="productname"><a class="productname" href="detail?id=${list[i].id}">${list[i].name}</a></p>
                <div class="priceproduct">
                    <strong class="newprice">${formatmoney(list[i].price)}</strong>
                    <span class="oldprice">${list[i].oldPrice!=null && list[i].oldPrice > 0?formatmoney(list[i].oldPrice):''}</span>
                </div>
            </div>
        </div>
    </div>`
    }
    document.getElementById("sanphambanchay").innerHTML += main
    if(result.last == false){
        document.getElementById("btnsanphambanchay").onclick=function(){
            loadSanPhamBanChay(Number(page) + Number(1));
        }
    }
    else{
        document.getElementById("btnsanphambanchay").onclick=function(){
            toastr.warning("Đã hết kết quả tìm kiếm");
        }
    }
}

async function loadSanPhamMoiNhat(page) {
    var url = 'http://localhost:8080/api/product/public/new-product?page=' + page + '&size=' + size+'&sort=id,desc';
    const response = await fetch(url, {
    });
    var result = await response.json();
    var list = result.content;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<div class="col-lg-20p col-md-3 col-sm-6 col-6">
        <div class="singleproduct">
            <a href="detail?id=${list[i].id}"><img src="${list[i].imageBanner}" class="productimg"></a>
            <div class="contentsinglepro">
                <p class="productname"><a class="productname" href="detail?id=${list[i].id}">${list[i].name}</a></p>
                <div class="priceproduct">
                    <strong class="newprice">${formatmoney(list[i].price)}</strong>
                    <span class="oldprice">${list[i].oldPrice!=null && list[i].oldPrice > 0?formatmoney(list[i].oldPrice):''}</span>
                </div>
            </div>
        </div>
    </div>`
    }
    document.getElementById("sanphammoinhat").innerHTML += main
    if(result.last == false){
        document.getElementById("btnsanphammoi").onclick=function(){
            loadSanPhamMoiNhat(Number(page) + Number(1));
        }
    }
    else{
        document.getElementById("btnsanphammoi").onclick=function(){
            toastr.warning("Đã hết kết quả tìm kiếm");
        }
    }
}


async function loadPhuKien(page) {
    var url = 'http://localhost:8080/api/product/public/phu-kien?page=' + page + '&size=' + size+'&sort=id,desc';
    const response = await fetch(url, {
    });
    var result = await response.json();
    var list = result.content;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<div class="col-lg-20p col-md-3 col-sm-6 col-6">
        <div class="singleproduct">
            <a href="detail?id=${list[i].id}"><img src="${list[i].imageBanner}" class="productimg"></a>
            <div class="contentsinglepro">
                <p class="productname"><a class="productname" href="detail?id=${list[i].id}">${list[i].name}</a></p>
                <div class="priceproduct">
                    <strong class="newprice">${formatmoney(list[i].price)}</strong>
                    <span class="oldprice">${list[i].oldPrice!=null && list[i].oldPrice > 0?formatmoney(list[i].oldPrice):''}</span>
                </div>
            </div>
        </div>
    </div>`
    }
    document.getElementById("listphukien").innerHTML += main
    if(result.last == false){
        document.getElementById("btnphukien").onclick=function(){
            loadPhuKien(Number(page) + Number(1));
        }
    }
    else{
        document.getElementById("btnphukien").onclick=function(){
            toastr.warning("Đã hết kết quả tìm kiếm");
        }
    }
}


async function loadSanPhamNoiBat() {
    var url = 'http://localhost:8080/api/product/public/best-saler?page=0&size=4&sort=quantitySold,desc';
    const response = await fetch(url, {
    });
    var result = await response.json();
    var list = result.content;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<div class="row singlespnoibat">
        <div class="col-sm-3">
            <img src="${list[i].imageBanner}" class="anhspnoibat">
        </div>
        <div class="col-sm-9 ndspnoibat">
            <a href="detail?id=${list[i].id}" class="tenspnoibat">${list[i].name}</a>
            <div class="priceproductnoibat">
                <strong class="newpricenoibat">${formatmoney(list[i].price)}</strong>
                <span class="oldpricenoibat">${list[i].oldPrice!=null && list[i].oldPrice > 0?formatmoney(list[i].oldPrice):''}</span>
            </div>
        </div>
    </div>`
    }
    document.getElementById("listspnoibat").innerHTML = main
}


async function loadSanPhamNoiBatCart() {
    var url = 'http://localhost:8080/api/product/public/best-saler?page=0&size=4&sort=quantitySold,desc';
    const response = await fetch(url, {
    });
    var result = await response.json();
    var list = result.content;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<div class="col-md-3 col-sm-4 col-6">
        <div class="singleproducts">
            <a href="detail?id=${list[i].id}"><img src="${list[i].imageBanner}" class="productimg"></a>
            <div class="contentsinglepro">
                <p class="productname"><a class="productname" href="detail?id=${list[i].id}">${list[i].name}</a></p>
                <div class="priceproduct">
                    <strong class="newpricelq">${formatmoney(list[i].price)}</strong>
                    <span class="oldprice">${list[i].oldPrice!=null && list[i].oldPrice > 0?formatmoney(list[i].oldPrice):''}</span>
                </div>
            </div>
        </div>
    </div>`
    }
    document.getElementById("goiysanpham").innerHTML = main
}

var listbonho = [];
async function loadAProduct() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var url = 'http://localhost:8080/api/product/public/findById?id=' + id;
    const response = await fetch(url, {
    });
    var result = await response.json();
    document.getElementById("detailnamepro").innerHTML = result.name
    document.getElementById("codepro").innerHTML = result.code
    document.getElementById("pricedetail").innerHTML = formatmoney(result.price)
    document.getElementById("oldpricestr").innerHTML = result.oldPrice == null || result.oldPrice==0?"": formatmoney(result.oldPrice)
    document.getElementById("imgdetailpro").src = result.imageBanner
    document.getElementById("descriptiondetail").innerHTML = result.description
    document.getElementById("tenspkythuat").innerHTML = result.name
    document.getElementById("imganhkythuat").src = result.imageBanner
    document.getElementById("imganhkythuat").innerHTML = result.imageBanner
    document.getElementById("phukiendikem").innerHTML = result.accessory
    var main = ''
    result.screen == null || result.screen == ""? main += "":main+= `<span class="congnghect">Công nghệ màn hình: <span class="chitietcongnghe">${result.screen}</span></span>`
    result.operaSystem == null || result.operaSystem == ""? main += "":main+= `<span class="congnghect">Hệ điều hành: <span class="chitietcongnghe">${result.operaSystem}</span></span>`
    result.cpu == null || result.cpu == ""? main += "":main+= `<span class="congnghect">Vi xử lý: <span class="chitietcongnghe">${result.cpu}</span></span>`
    result.mobileNetwork == null || result.mobileNetwork == ""? main += "":main+= `<span class="congnghect">Mạng di động: <span class="chitietcongnghe">${result.mobileNetwork}</span></span>`
    result.sim == null || result.sim == ""? main += "":main+= `<span class="congnghect">Số khe SIM: <span class="chitietcongnghe">${result.sim}</span></span>`
    result.specialFeature == null || result.specialFeature == ""? main += "":main+= `<span class="congnghect">Tính năng đặc biệt: <span class="chitietcongnghe">${result.specialFeature}</span></span>`
    result.securityInfor == null || result.securityInfor == ""? main += "":main+= `<span class="congnghect">Bảo mật: <span class="chitietcongnghe">${result.securityInfor}</span></span>`
    result.securityInfor == null || result.securityInfor == ""? main += "":main+= `<span class="congnghect">Bảo mật: <span class="chitietcongnghe">${result.securityInfor}</span></span>`
    result.material == null || result.material == ""? main += "":main+= `<span class="congnghect">Chất liệu: <span class="chitietcongnghe">${result.material}</span></span>`
    result.frontCamera == null || result.frontCamera == ""? main += "":main+= `<span class="congnghect">Camera trước: <span class="chitietcongnghe">${result.frontCamera}</span></span>`
    result.backCamera == null || result.backCamera == ""? main += "":main+= `<span class="congnghect">Camera sau: <span class="chitietcongnghe">${result.backCamera}</span></span>`
    document.getElementById("thongtincauhinh").innerHTML = main;
    listbonho = result.productStorages;
    loadBoNho(result.category.categoryType)


    var main = `<div class="col-lg-2 col-md-2 col-sm-2 col-2 singdimg"><img onclick="clickImgdetail(this)" src="${result.imageBanner}" class="imgldetail"></div>`
    for (i = 0; i < result.productImages.length; i++) {
        main += `<div class="col-lg-2 col-md-2 col-sm-2 col-2 singdimg">
                    <img onclick="clickImgdetail(this)" src="${result.productImages[i].linkImage}" class="imgldetail">
                </div>`
    }
    document.getElementById("listimgdetail").innerHTML = main

    result.category.categoryType == "DIEN_THOAI"?loadSanPhamLienQuan(result.tradeMark.id, null,id) : loadSanPhamLienQuan(null, result.category.id, id);
}

function loadBoNho(categoryType){
    if(categoryType == "DIEN_THOAI"){
        var main = '';
        for(k=0; k<listbonho.length; k++){
            var act =''
            if(k==0){
                act = 'activecolor'
                loadMauSac(listbonho[k].id, null)
            }
            main += `<div class="col-lg-3 col-md-3 col-sm-6 col-6">
            <div onclick="loadMauSac(${listbonho[k].id}, this)" class="storagediv ${act}">
                <span class="">${listbonho[k].ram}-${listbonho[k].rom}</span>
            </div>
        </div>`
        }
        document.getElementById("listbonho").innerHTML = main;
    }
    if(categoryType == "PHU_KIEN"){
        document.getElementById("storagedetaillable").style.display = "none";
        var main = '';
        for(i=0; i<listbonho.length; i++){
            for(j=0; j<listbonho[i].productColors.length; j++){
                var cls = 'hetsp';
                var oncl = ``;
                var mausac = listbonho[i].productColors[j];

                if(mausac.quantity > 0){
                    cls=''
                    oncl = `onclick="chonMauSac(${mausac.id}, this, ${mausac.price})"`;
                }
                main += `<div class="col-lg-3 col-md-3 col-sm-6 col-6">
                <div ${oncl} class="colorcdiv ${cls}">
                    <img src="${mausac.image}" class="imgcolorpro"> <span class="storagedetail">${mausac.name}</span>
                    <span class="pricestorage">${formatmoney(mausac.price)}</span>
                </div>
                </div>`
            }
        }
        document.getElementById("listcolor").innerHTML = main;
    }
}


async function loadMauSac(idbonho,e){
    var url = 'http://localhost:8080/api/product-color/public/find-by-storage?id=' + idbonho;
    const response = await fetch(url, {
    });
    var listmausac = await response.json();
    console.log(listmausac);
    var main = ''
    for(j=0; j<listmausac.length; j++){
        var cls = 'hetsp';
        var oncl = ``;
        if(listmausac[j].quantity > 0){
            cls=''
            oncl = `onclick="chonMauSac(${listmausac[j].id}, this, ${listmausac[j].price})"`;
        }
        main += `<div class="col-lg-3 col-md-3 col-sm-6 col-6">
                <div ${oncl} class="colorcdiv ${cls}">
                    <img src="${listmausac[j].image}" class="imgcolorpro"> 
                    <span class="storagedetail">${listmausac[j].name}</span>
                    <span class="soluongcon">(${listmausac[j].quantity})</span>
                    <span class="pricestorage">${formatmoney(listmausac[j].price)}</span>
                </div>
            </div>`
    }
    document.getElementById("listcolor").innerHTML = main;
    if(e != null){
        var img = document.getElementsByClassName("storagediv");
        for (k = 0; k < img.length; k++) {
            document.getElementsByClassName("storagediv")[k].classList.remove('activecolor');
        }
        e.classList.add('activecolor')
    }
}

function chonMauSac(idmausac, e, price){
    idColorCart = idmausac;
    var img = document.getElementsByClassName("colorcdiv");
    for (k = 0; k < img.length; k++) {
        document.getElementsByClassName("colorcdiv")[k].classList.remove('activecolor');
    }
    e.classList.add('activecolor')
    document.getElementById("pricedetail").innerHTML = formatmoney(price)
}

async function loadSanPhamLienQuan(idtrademark, idcategory, idproduct) {
    var url = 'http://localhost:8080/api/product/public/san-pham-lienquan?page=0&size=4&sort=id,desc&id='+idproduct;
    idcategory != null? url += '&idcategory='+idcategory : url+= ''
    idtrademark != null? url += '&idtrademark='+idtrademark : url+= ''
    const response = await fetch(url, {
    });
    var result = await response.json();
    var list = result.content;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<div class="col-md-6 col-sm-6 col-6">
        <div class="singleproducts singprolq">
            <a href=""><img src="${list[i].imageBanner}" class="productimglq"></a>
            <div class="contentsinglepro">
                <p class="productname"><a class="productname" href="">${list[i].name}</a></p>
                <div class="priceproduct">
                    <strong class="newpricelq">${formatmoney(list[i].price)}</strong>
                    <span class="oldprice">${list[i].oldPrice!=null && list[i].oldPrice > 0?formatmoney(list[i].oldPrice):''}</span>
                </div>
            </div>
        </div>
    </div>`
    }
    document.getElementById("listsanphamlienquan").innerHTML = main
}

async function clickImgdetail(e) {
    var img = document.getElementsByClassName("imgldetail");
    for (i = 0; i < img.length; i++) {
        document.getElementsByClassName("imgldetail")[i].classList.remove('imgactive');
    }
    e.classList.add('imgactive')
    document.getElementById("imgdetailpro").src = e.src
}





async function sanPhamByThuongHieuAndDanhMuc(page) {
    var uls = new URL(document.URL)
    var thuonghieu = uls.searchParams.get("thuonghieu");
    var danhmuc = uls.searchParams.get("danhmuc");
    var search = uls.searchParams.get("search");
    
    var url = 'http://localhost:8080/api/product/public/loc-san-pham?page=' + page + '&size=' + size+'&sort=id,desc&small=0&large=1000000000';
    if(thuonghieu != null){
        url += '&trademark='+thuonghieu
    }
    if(danhmuc != null){
        url += '&idcategory='+danhmuc
    }
    if(search != null){
        url += '&search='+search
    }
    const response = await fetch(url, {
    });
    var result = await response.json();
    var list = result.content;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<div class="col-lg-20p col-md-3 col-sm-6 col-6">
        <div class="singleproduct">
            <a href="detail?id=${list[i].id}"><img src="${list[i].imageBanner}" class="productimg"></a>
            <div class="contentsinglepro">
                <p class="productname"><a class="productname" href="detail?id=${list[i].id}">${list[i].name}</a></p>
                <div class="priceproduct">
                    <strong class="newprice">${formatmoney(list[i].price)}</strong>
                    <span class="oldprice">${list[i].oldPrice!=null && list[i].oldPrice > 0?formatmoney(list[i].oldPrice):''}</span>
                </div>
            </div>
        </div>
    </div>`
    }
    document.getElementById("sanphamloc").innerHTML += main
    if(result.last == false){
        document.getElementById("btnlocsanpham").onclick=function(){
            sanPhamByThuongHieuAndDanhMuc(Number(page) + Number(1));
        }
    }
    else{
        document.getElementById("btnlocsanpham").onclick=function(){
            toastr.warning("Đã hết kết quả tìm kiếm");
        }
    }
}


async function locSanPham(page) {
    var search = document.getElementById("search").value
    var thuonghieu = document.getElementById("thuonghieu").value
    var danhmuc = document.getElementById("danhmuc").value
    var mucgia = document.getElementById("mucgia").value
    var sort = document.getElementById("sort").value
    
    var url = 'http://localhost:8080/api/product/public/loc-san-pham?page=' + page + '&size=' + size+'&sort='+sort+'&large='+mucgia.split("-")[1]+'&small='+mucgia.split("-")[0]+'&search='+search;

    if(thuonghieu != null && thuonghieu != ""){
        url += '&trademark='+thuonghieu
    }
    if(danhmuc != null && danhmuc != ""){
        url += '&idcategory='+danhmuc
    }
    console.log(url);
    const response = await fetch(url, {
    });
    var result = await response.json();
    var list = result.content;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<div class="col-lg-20p col-md-3 col-sm-6 col-6">
        <div class="singleproduct">
            <a href="detail?id=${list[i].id}"><img src="${list[i].imageBanner}" class="productimg"></a>
            <div class="contentsinglepro">
                <p class="productname"><a class="productname" href="detail?id=${list[i].id}">${list[i].name}</a></p>
                <div class="priceproduct">
                    <strong class="newprice">${formatmoney(list[i].price)}</strong>
                    <span class="oldprice">${list[i].oldPrice!=null && list[i].oldPrice > 0?formatmoney(list[i].oldPrice):''}</span>
                </div>
            </div>
        </div>
    </div>`
    }
    document.getElementById("sanphamloc").innerHTML += main
    if(result.last == false){
        document.getElementById("btnlocsanpham").onclick=function(){
            sanPhamByThuongHieuAndDanhMuc(Number(page) + Number(1));
        }
    }
    else{
        document.getElementById("btnlocsanpham").onclick=function(){
            toastr.warning("Đã hết kết quả tìm kiếm");
        }
    }
}


function locSpAction(){
    document.getElementById("sanphamloc").innerHTML = "";
    locSanPham(0);
}