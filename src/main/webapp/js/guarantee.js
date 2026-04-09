async function sendBH() {
    var payload = {
        "description": tinyMCE.get('editor').getContent(),
        "invoiceDetailId": document.getElementById("ivdetail").value,
        "customerName": document.getElementById("customerName").value,
        "customerPhone": document.getElementById("customerPhone").value,
    }
    const response = await fetch('http://localhost:8080/api/guarantee/user/create', {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(payload)
    });
    if (response.status < 300) {
        swal({
                title: "Thông báo",
                text: "Gửi yêu cầu bảo hành thành công!",
                type: "success"
            },
            function() {
                $("#modaldeail").modal("hide")
            });
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        swal({
                title: "Thông báo",
                text: result.defaultMessage,
                type: "error"
            },
            function() {
            });
    }
}

// Đặt trong file JS có thể truy cập được (ví dụ: js/guarantee.js)

async function loadMyGuarantee() {
    // Lấy token (giả định biến 'token' đã được định nghĩa ở đâu đó)
    // var token = 'your_auth_token_here';

    var url = 'http://localhost:8080/api/guarantee/user/find-by-user';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });

        if (!response.ok) {
            // Xử lý lỗi HTTP (ví dụ: 401 Unauthorized)
            if (response.status === 401) {
                // Xử lý chuyển hướng đăng nhập hoặc hiển thị lỗi
                console.error("Lỗi xác thực: Token không hợp lệ hoặc hết hạn.");
            }
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }

        var list = await response.json();
        var main = '';

        if (list.length === 0) {
            main = '<p class="text-center text-muted mt-5">Chưa có yêu cầu bảo hành nào được gửi.</p>';
        } else {
            for (let i = 0; i < list.length; i++) {
                let item = list[i];

                // Lấy trạng thái và màu sắc TRỰC TIẾP từ entity đã được serialize
                const statusLabel = item.label || 'Không xác định';
                const statusColor = item.color || '#95A5A6';

                // --- 1. Tạo Timeline Lịch sử ---
                let historyHtml = '';
                if (item.guaranteeHistories && item.guaranteeHistories.length > 0) {
                    // Sắp xếp lịch sử theo thời gian tạo mới nhất lên trên
                    item.guaranteeHistories.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

                    historyHtml = `<ul class="list-unstyled history-timeline">`;
                    item.guaranteeHistories.forEach(history => {
                        // Lấy label và color TRỰC TIẾP từ history entity
                        const historyStatusLabel = history.label || 'Không xác định';
                        const historyStatusColor = history.color || '#95A5A6';

                        const createdDate = history.createdDate

                        historyHtml += `
                            <li class="timeline-item">
                                <span class="timeline-dot" style="background-color: ${historyStatusColor};"></span>
                                <div class="timeline-content">
                                    <span class="fw-bold">${historyStatusLabel}</span>
                                    <small class="text-muted float-end">${createdDate}</small>
                                </div>
                            </li>
                        `;
                    });
                    historyHtml += `</ul>`;
                }

                // --- 2. Xây dựng Card chính ---
                // Dùng style attribute để đặt màu viền động
                main += `
                    <div class="card mb-4 shadow-sm guarantee-card" style="border-left-color: ${statusColor};">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5 class="card-title text-primary fw-bold mb-1">
                                        ${item.productName} - Mã: ${item.code}
                                    </h5>
                                    <p class="card-subtitle text-muted small">
                                        Ngày gửi: ${item.createdDate}
                                    </p>
                                </div>
                                <span class="badge status-badge p-2" 
                                      style="background-color: ${statusColor};">
                                    ${statusLabel}
                                </span>
                            </div>

                            <hr>

                            <div class="row info-details small">
                                <div class="col-6 mb-2">
                                    <i class="fas fa-barcode text-secondary me-2"></i>
                                    <strong>IMEI:</strong> <span>${item.imei}</span>
                                </div>
                                <div class="col-6 mb-2">
                                    <i class="fas fa-microchip text-secondary me-2"></i>
                                    <strong>Bộ nhớ:</strong> <span>${item.productStorage}</span>
                                </div>
                                <div class="col-6 mb-2">
                                    <i class="fas fa-palette text-secondary me-2"></i>
                                    <strong>Màu sắc:</strong> <span>${item.productColor}</span>
                                </div>
                                <div class="col-6 mb-2">
                                    <i class="fas fa-hand-holding-usd text-secondary me-2"></i>
                                    <strong>Phí dự kiến:</strong> <span class="fw-bold text-danger">${item.fee.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                            </div>
                            
                            <p class="mt-3 mb-2 small text-truncate" title="${item.description}">
                                <i class="fas fa-clipboard-list text-secondary me-2"></i>
                                <strong>Mô tả lỗi:</strong> <span>${item.description}</span>
                            </p>

                            <a class="btn btn-sm btn-outline-info w-100 mt-2" 
                               data-bs-toggle="collapse" 
                               href="#history-${item.id}" 
                               role="button"
                               aria-expanded="false" 
                               aria-controls="history-${item.id}">
                                Xem Lịch sử & Chi tiết lỗi
                            </a>

                            <div class="collapse mt-3" id="history-${item.id}">
                                <h6 class="text-secondary">Lịch sử Cập nhật:</h6>
                                ${historyHtml}
                                <h6 class="text-secondary mt-3">Chẩn đoán lỗi:</h6>
                                <p class="small">${item.errorDiagnosis ? item.errorDiagnosis : 'Chưa có chẩn đoán lỗi chính thức.'}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        document.getElementById("listbaohanh").innerHTML = main;

    } catch (error) {
        console.error("Lỗi khi tải dữ liệu bảo hành:", error);
        document.getElementById("listbaohanh").innerHTML = '<p class="text-center text-danger mt-5">Không thể tải thông tin bảo hành. Vui lòng thử lại sau.</p>';
    }
}