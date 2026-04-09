async function loadAllTrademark(){
    var url = 'http://localhost:8080/api/trademark/public/findAll';
    const res = await fetch(url, {});
    var list = await res.json();
    var main = '<option value="">Tất cả hãng</option>'
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].name}">${list[i].name}</option>`
    }
    document.getElementById("thuonghieu").innerHTML = main;
}
