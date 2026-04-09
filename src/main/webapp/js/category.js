async function loadAllCategory(){
    var url = 'http://localhost:8080/api/category/public/findAll';
    const res = await fetch(url, {});
    var list = await res.json();
    var main = '<option value="">Tất cả danh mục</option>'
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].id}">${list[i].name}</option>`
    }
    document.getElementById("danhmuc").innerHTML = main;
}
