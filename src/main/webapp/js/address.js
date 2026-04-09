var list = []

async function loadAddress() {
    var urladd = 'http://localhost:8080/api/address/public/province';
    const response = await fetch(urladd, {
        method: 'GET'
    });
    list = await response.json();
    var main = '<option value="0" disabled selected>Chọn tỉnh</option>'
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].id}">${list[i].name}</option>`
    }
    document.getElementById("tinh").innerHTML = main
}

async function loadHuyen(idtinh) {
    for (u = 0; u < list.length; u++) {
        if (list[u].id == idtinh) {
            var huyen = list[u].districts;
            var main = ''
            for (j = 0; j < huyen.length; j++) {
                main += `<option value="${huyen[j].id}">${huyen[j].name}</option>`
            }
            document.getElementById("huyen").innerHTML = main
            loadXa(huyen[0].id, idtinh)
            break;
        }
    }
}

async function loadXa(idHuyen, idtinh) {
    for (n = 0; n < list.length; n++) {
        if (list[n].id == idtinh) {
            var huyen = list[n].districts;
            for (x = 0; x < huyen.length; x++) {
                if (huyen[x].id == idHuyen) {
                    var xa = huyen[x].wards;
                    var main = ''
                    for (k = 0; k < xa.length; k++) {
                        main += `<option value="${xa[k].id}">${xa[k].name}</option>`
                    }
                    document.getElementById("xa").innerHTML = main
                    break;
                }
            }
            break;
        }
    }
}

async function loadHuyenOnchange() {
    var idtinh = document.getElementById("tinh").value;
    loadHuyen(idtinh)
}

async function loadXaOnchange() {
    var idtinh = document.getElementById("tinh").value;
    var idhuyen = document.getElementById("huyen").value;
    loadXa(idhuyen, idtinh)
}