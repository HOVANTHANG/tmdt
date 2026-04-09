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

    // Vòng lặp để tạo các dòng đơn hàng
    for (i = 0; i < list.length; i++) {
        const invoiceId = list[i].id;
        const targetId = `detailCollapse${invoiceId}`; // ID duy nhất cho dropdown chi tiết

        // Dòng chính của đơn hàng
        main += `<tr class="invoice-row" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#${targetId}" 
                    aria-expanded="false" 
                    aria-controls="${targetId}"
                    onclick="loadDetailInvoice(${invoiceId}, '${targetId}')">
                    
                    <td class="yls pointer-event">#${invoiceId}</td>
                    <td class="floatr">${list[i].createdTime}<br>${list[i].createdDate}</td>
                    <td>${list[i].address}</td>
                    <td class="floatr"><span class="yls">${formatmoney(list[i].totalAmount)}</span></td>
                    <td class="floatr"><span class="yls">${formatmoney(list[i].shipCost)}</span></td>
                    <td><span class="span_pending">${list[i].payType == 'MOMO'?'<span class="dathanhtoan">Đã thanh toán</span>':'<span class="chuathanhtoan">Thanh toán khi nhận hàng</span>'}</span></td>
                    <td class="floatr"><span class="span_">${list[i].statusInvoice}</span></td>
                    <td>
                    ${(list[i].statusInvoice == "DANG_CHO_XAC_NHAN" || list[i].statusInvoice== "DA_XAC_NHAN") && list[i].payType == 'COD'?
                    `<i onclick="event.stopPropagation(); cancelInvoice(${invoiceId})" class="fa fa-trash-o huydon"></i>`:''}
                    </td>
                </tr>`;

        // Dòng trống chứa chi tiết đơn hàng (dropdown content)
        // Nó sẽ được ẩn ban đầu và có class 'collapse'
        main += `<tr class="collapse-row">
                    <td colspan="8" class="p-0">
                        <div class="collapse" id="${targetId}">
                            <div class="card card-body p-3 invoice-detail-content" id="content-${targetId}">
                                Đang tải chi tiết đơn hàng...
                            </div>
                        </div>
                    </td>
                </tr>`;
    }
    document.getElementById("listinvoice").innerHTML = main
    document.getElementById("sldonhang").innerHTML = list.length+' đơn hàng'
}


const loadedDetails = new Set();

async function loadDetailInvoice(id, targetElementId) {
    const contentId = `content-${targetElementId}`;
    const detailContainer = document.getElementById(contentId);

    // Kiểm tra nếu nội dung đã được tải trước đó thì không cần tải lại
    if (loadedDetails.has(id)) {
        // Nếu đã tải, chỉ cần đóng/mở. Nội dung đã có trong DOM
        return;
    }

    // Đánh dấu là đang tải (có thể hiện spinner ở đây nếu cần)
    detailContainer.innerHTML = 'Đang tải chi tiết đơn hàng...';

    try {
        // --- 1. Tải chi tiết sản phẩm ---
        var urlDetail = 'http://localhost:8080/api/invoice-detail/user/find-by-invoice?idInvoice='+id;
        const res = await fetch(urlDetail, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });
        var listDetail = await res.json();

        var productDetailHtml = `
            <h5>Chi tiết sản phẩm</h5>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Ảnh</th>
                        <th>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>`;

        for(let i=0; i< listDetail.length; i++){
            productDetailHtml += `<tr>
                <td><img src="${listDetail[i].product.imageBanner}" class="imgdetailacc" style="width: 50px;"></td>
                <td>
                    <a href="detail?id=${listDetail[i].product.id}">${listDetail[i].product.name}</a><br>
                    <span>${listDetail[i].productColor.name} / ${listDetail[i].productStorage.ram} - ${listDetail[i].productStorage.rom}</span><br>
                    <span>Mã sản phẩm: ${listDetail[i].product.code}</span>
                </td>
                <td>${formatmoney(listDetail[i].price)}</td>
                <td>${listDetail[i].quantity}</td>
                <td class="yls">${formatmoney(listDetail[i].price * listDetail[i].quantity)}</td>
                <td><button onclick="openModalMoTa(${listDetail[i].id})" class="btn btn-sm btn-outline-primary">Yêu cầu bảo hành</button></td>
            </tr>`;
        }
        productDetailHtml += `</tbody></table>`;

        // --- 2. Tải thông tin hóa đơn ---
        var urlInvoice = 'http://localhost:8080/api/invoice/user/find-by-id?idInvoice='+id;
        const resp = await fetch(urlInvoice, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });
        var result = await resp.json();

        // --- 3. Tổng hợp HTML cuối cùng ---
        let infoHtml = `
            <h5>Thông tin giao hàng & Thanh toán</h5>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Ngày tạo:</strong> ${result.createdTime} ${result.createdDate}</p>
                    <p><strong>Trạng thái TT:</strong> ${result.payType=="MOMO"?"Đã thanh toán":"Thanh toán khi nhận hàng"}</p>
                    <p><strong>Loại TT:</strong> ${result.payType=="MOMO"?"Thanh toán qua momo":"Thanh toán khi nhận hàng (COD)"}</p>
                    <p><strong>Trạng thái VC:</strong> ${result.statusInvoice}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Người nhận:</strong> ${result.receiverName}</p>
                    <p><strong>SĐT:</strong> ${result.phone}</p>
                    <p><strong>Địa chỉ:</strong> ${result.address}</p>
                    <p><strong>Ghi chú:</strong> ${result.note=="" ||result.note==null?'Không có ghi chú':result.note}</p>
                </div>
            </div>
        `;

        // Chèn nội dung vào dropdown
        detailContainer.innerHTML = productDetailHtml + '<hr>' + infoHtml;

        // Đánh dấu là đã tải thành công
        loadedDetails.add(id);

    } catch (error) {
        detailContainer.innerHTML = '<span class="text-danger">Lỗi khi tải chi tiết đơn hàng.</span>';
        console.error("Lỗi tải chi tiết hóa đơn:", error);
    }
}

async function cancelInvoice(id) {
    var con = confirm("xác nhận hủy đơn hàng này");
    if(con == false){
        return;
    }
    var url = 'http://localhost:8080/api/invoice/user/cancel-invoice?idInvoice='+id;
    const res = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if(res.status < 300){
        toastr.success("Hủy đơn hàng thành công!");
        loadMyInvoice();
    }
    if (res.status == exceptionCode) {
        var result = await res.json()
        toastr.warning(result.defaultMessage);
    }
}


async function timKiemDonHang() {
    var id = document.getElementById("madonhang").value
    var phone = document.getElementById("sodienthoai").value
    var url = 'http://localhost:8080/api/invoice/public/tim-kiem-don-hang?id='+id+'&phone='+phone;
    const response = await fetch(url, {
    });
    var result = await response.json();
    if(response.status == exceptionCode){
        toastr.warning(result.defaultMessage);
        return;
    }
    console.log(result);
    var  main = `<tr>
        <td><a class="yls pointer-event">#${result.id}</a></td>
        <td class="floatr">${result.createdTime} ${result.createdDate}</td>
        <td>${result.address}</td>
        <td class="floatr"><span class="yls">${formatmoney(result.totalAmount)}</span></td>
        <td><span class="span_pending">${result.payType == 'MOMO'?'<span class="dathanhtoan">Đã thanh toán</span>':'<span class="chuathanhtoan">Thanh toán khi nhận hàng</span>'}</span></td>
        <td class="floatr"><span class="span_">${result.statusInvoice}</span></td>
    </tr>`
    document.getElementById("listinvoice").innerHTML = main
}

async function openModalMoTa(idDetail){
    document.getElementById("ivdetail").value = idDetail
    $("#modaldeail").modal("show")
}
