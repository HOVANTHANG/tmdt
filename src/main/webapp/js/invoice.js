async function loadMyInvoice() {
    var url = 'http://localhost:8080/api/invoice/user/find-by-user';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });

    var list = await response.json();
    var main = '';

    for (let i = 0; i < list.length; i++) {
        const invoiceId = list[i].id;
        const targetId = `detailCollapse${invoiceId}`;

        main += `
        <tr class="invoice-row"
            data-bs-toggle="collapse"
            data-bs-target="#${targetId}"
            onclick="loadDetailInvoice(${invoiceId}, '${targetId}')">

            <td>#${invoiceId}</td>
            <td class="floatr">${list[i].createdTime}<br>${list[i].createdDate}</td>
            <td>${list[i].address}</td>
            <td class="floatr"><span class="yls">${formatmoney(list[i].totalAmount)}</span></td>
            <td class="floatr"><span class="yls">${formatmoney(list[i].shipCost)}</span></td>
            <td>${list[i].payType == 'MOMO'
                ? '<span class="dathanhtoan">Đã thanh toán</span>'
                : '<span class="chuathanhtoan">COD</span>'}</td>
            <td>${list[i].statusInvoice}</td>
            <td>
                ${(list[i].statusInvoice == "DANG_CHO_XAC_NHAN" || list[i].statusInvoice == "DA_XAC_NHAN") && list[i].payType == 'COD'
                ? `<i onclick="event.stopPropagation(); cancelInvoice(${invoiceId})" class="fa fa-trash-o huydon"></i>`
                : ''}
            </td>
        </tr>

        <tr>
            <td colspan="8" class="p-0">
                <div class="collapse" id="${targetId}">
                    <div class="card p-3" id="content-${targetId}">
                        Đang tải...
                    </div>
                </div>
            </td>
        </tr>
        `;
    }

    document.getElementById("listinvoice").innerHTML = main;
    document.getElementById("sldonhang").innerHTML = list.length + ' đơn hàng';
}

const loadedDetails = new Set();

async function loadDetailInvoice(id, targetElementId) {

    if (loadedDetails.has(id)) return;

    const contentId = `content-${targetElementId}`;
    const el = document.getElementById(contentId);

    try {
        // ================== LOAD DETAIL ==================
        var urlDetail = 'http://localhost:8080/api/invoice-detail/user/find-by-invoice?idInvoice=' + id;
        const res = await fetch(urlDetail, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        var listDetail = await res.json();

        let html = `
        <h5>Chi tiết sản phẩm</h5>
        <table class="table">
        <thead>
            <tr>
                <th>Ảnh</th>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>SL</th>
                <th>Tổng</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        `;

        for (let i = 0; i < listDetail.length; i++) {

            const item = listDetail[i];
            const product = item.product || {};
            const variant = item.productVariant || {};

            const price = item.price || variant.price || 0;

            const image = variant.image || product.imageBanner || "image/product1.webp";

            let variantText = "Mặc định";
            if (variant.tier1value && variant.tier2value) {
                variantText = `${variant.tier1value} / ${variant.tier2value}`;
            } else if (variant.tier1value) {
                variantText = variant.tier1value;
            } else if (variant.tier2value) {
                variantText = variant.tier2value;
            }

            html += `
            <tr>
                <td><img src="${image}" style="width:60px"></td>
                <td>
                    <a href="detail?id=${product.id}">${product.name}</a><br>
                    <small>${variantText}</small><br>
                    <small>Mã: ${product.code}</small>
                </td>
                <td>${formatmoney(price)}</td>
                <td>${item.quantity}</td>
                <td>${formatmoney(price * item.quantity)}</td>
                <td>
                    <button onclick="openModalMoTa(${item.id})" class="btn btn-sm btn-outline-primary">
                        Bảo hành
                    </button>
                </td>
            </tr>
            `;
        }

        html += `</tbody></table>`;

        // ================== LOAD INVOICE ==================
        var urlInvoice = 'http://localhost:8080/api/invoice/user/find-by-id?idInvoice=' + id;
        const resp = await fetch(urlInvoice, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        var result = await resp.json();

        let info = `
        <hr>
        <h5>Thông tin</h5>
        <div class="row">
            <div class="col-md-6">
                <p>Ngày: ${result.createdTime} ${result.createdDate}</p>
                <p>Thanh toán: ${result.payType}</p>
                <p>Trạng thái: ${result.statusInvoice}</p>
            </div>
            <div class="col-md-6">
                <p>Người nhận: ${result.receiverName}</p>
                <p>SĐT: ${result.phone}</p>
                <p>Địa chỉ: ${result.address}</p>
            </div>
        </div>
        `;

        el.innerHTML = html + info;
        loadedDetails.add(id);

    } catch (e) {
        el.innerHTML = '<span class="text-danger">Lỗi tải dữ liệu</span>';
    }
}

async function cancelInvoice(id) {
    if (!confirm("Hủy đơn?")) return;

    var url = 'http://localhost:8080/api/invoice/user/cancel-invoice?idInvoice=' + id;

    const res = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });

    if (res.status < 300) {
        toastr.success("Đã hủy");
        loadMyInvoice();
    } else {
        var result = await res.json();
        toastr.warning(result.defaultMessage);
    }
}

async function timKiemDonHang() {
    var id = document.getElementById("madonhang").value;
    var phone = document.getElementById("sodienthoai").value;

    var url = `http://localhost:8080/api/invoice/public/tim-kiem-don-hang?id=${id}&phone=${phone}`;

    const response = await fetch(url);
    var result = await response.json();

    if (response.status == exceptionCode) {
        toastr.warning(result.defaultMessage);
        return;
    }

    document.getElementById("listinvoice").innerHTML = `
    <tr>
        <td>#${result.id}</td>
        <td>${result.createdTime} ${result.createdDate}</td>
        <td>${result.address}</td>
        <td>${formatmoney(result.totalAmount)}</td>
        <td>${result.payType}</td>
        <td>${result.statusInvoice}</td>
    </tr>
    `;
}

function openModalMoTa(idDetail) {
    document.getElementById("ivdetail").value = idDetail;
    $("#modaldeail").modal("show");
}