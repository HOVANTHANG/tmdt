async function loadPendingSeller() {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8080/api/admin/seller/pending", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if (!res.ok) {
        alert("Không tải được danh sách shop chờ duyệt");
        return;
    }

    const list = await res.json();
    let html = "";

    list.forEach(item => {
        html += `
            <tr>
                <td>${item.id}</td>
                <td>
                    <img src="${item.avatar || '/image/logo.ico'}"
                         style="width:48px;height:48px;border-radius:50%;object-fit:cover;"
                         onerror="this.src='/image/logo.ico'">
                </td>
                <td>${item.shopName || ""}</td>
                <td>${item.owner ? (item.owner.username || item.owner.fullname || "") : ""}</td>
                <td>${item.phone || ""}</td>
                <td>${item.email || ""}</td>
                <td><span class="badge bg-warning text-dark">${item.status || "PENDING"}</span></td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="approveSeller(${item.id})">
                        Duyệt
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="rejectSeller(${item.id})">
                        Từ chối
                    </button>
                </td>
            </tr>
        `;
    });

    document.getElementById("listSeller").innerHTML =
        html || `<tr><td colspan="8" class="text-center">Không có shop chờ duyệt</td></tr>`;
}

async function approveSeller(id) {

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:8080/api/admin/seller/approve/${id}`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    alert("Đã duyệt seller");

    loadPendingSeller();
}

async function rejectSeller(id) {

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:8080/api/admin/seller/reject/${id}`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    alert("Đã từ chối seller");

    loadPendingSeller();
}

loadPendingSeller();