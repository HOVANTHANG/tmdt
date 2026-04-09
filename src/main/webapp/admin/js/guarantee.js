const API_URL = 'http://localhost:8080/api/guarantee/admin';
const PAGE_SIZE = 8; // Kích thước trang tối ưu cho dạng danh sách
let currentPage = 0;
let currentSearch = '';
let allStatuses = {};
let guaranteesData = [];

$(document).ready(function() {
    // 1. Load danh sách trạng thái ENUM
    loadGuaranteeStatuses().then(() => {
        // 2. Load dữ liệu bảo hành sau khi có trạng thái
        loadGuarantees();
    });

    // 3. Gắn sự kiện tìm kiếm
    $('#searchtable').on('keyup', function() {
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            currentSearch = $(this).val();
            currentPage = 0;
            loadGuarantees();
        }, 300);
    });

    // 4. Gắn sự kiện cho Form Cập nhật Chẩn đoán/Phí
    $('#updateDiagnosisFeeForm').on('submit', handleUpdateDiagnosisFee);

    // 5. Gắn sự kiện cho Button Cập nhật Trạng thái
    $('#btnUpdateStatus').on('click', handleUpdateStatusClick);
});

// --- L O G I C   T Ả I   D Ữ   L I Ệ U ---

async function loadGuaranteeStatuses() {
    try {
        const response = await fetch(`${API_URL}/statuses`);
        if (!response.ok) throw new Error("Failed to fetch statuses");
        allStatuses = await response.json();
    } catch (e) {
        toastr.error("Không thể tải danh sách trạng thái bảo hành.");
    }
}

async function loadGuarantees() {
    const url = `${API_URL}/list?page=${currentPage}&size=${PAGE_SIZE}&search=${encodeURIComponent(currentSearch)}&sort=createdDate,desc`;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            })
        });

        if (!response.ok) {
            toastr.error("Lỗi khi tải dữ liệu bảo hành.");
            document.getElementById("guaranteeListAccordion").innerHTML = '<p class="text-center text-danger mt-5">Lỗi: Không thể tải dữ liệu.</p>';
            return;
        }

        const data = await response.json();
        window.guaranteesData = data.content;
        renderListAccordion(data.content); // Sử dụng Accordion
        renderPagination(data.totalPages);

    } catch (error) {
        console.error("Fetch Error:", error);
        toastr.error("Lỗi kết nối Server.");
    }
}

// --- L O G I C   R E N D E R ---

function renderListAccordion(guarantees) {
    let accordionHtml = '';
    const container = $('#guaranteeListAccordion');
    container.html('');

    if (guarantees.length === 0) {
        container.html('<p class="text-center text-muted mt-5">Không tìm thấy yêu cầu bảo hành nào phù hợp.</p>');
        return;
    }

    guarantees.forEach(item => {
        const statusLabel = item.label || 'N/A';
        const statusColor = item.color || '#95A5A6';
        const itemId = `guarantee-${item.id}`;

        // --- NỘI DUNG CHI TIẾT (Được hiển thị khi mở rộng) ---
        let detailContent = generateDetailContent(item);

        accordionHtml += `
            <div class="accordion-item mb-3 shadow-sm" style="border-left: 5px solid ${statusColor};">
                
                <h2 class="accordion-header" id="heading-${itemId}">
                    <button class="accordion-button collapsed d-flex align-items-center" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target="#collapse-${itemId}" 
                            aria-expanded="false" 
                            aria-controls="collapse-${itemId}">
                        
                        <div style="min-width: 150px; max-width: 250px;">
                            <span class="fw-bold text-primary">${item.code}</span>
                            <small class="d-block text-muted text-truncate" title="${item.productName}">${item.productName}</small>
                        </div>
                        
                        <div class="d-none d-md-block" style="min-width: 150px; max-width: 200px;">
                            <span class="d-block">${item.customerName}</span>
                            <small class="text-muted">${item.customerPhone}</small>
                        </div>

                        <div class="text-center" style="min-width: 120px;">
                            <span class="badge p-2 status-badge" style="background-color: ${statusColor};">
                                ${statusLabel}
                            </span>
                        </div>
                        
                        <div class="ms-auto" style="min-width: 150px; text-align: right;">
                            <span class="d-block fw-bold text-danger">${(item.fee || 0).toLocaleString('vi-VN')} VNĐ</span>
                            <small class="text-muted">Phí dự kiến</small>
                        </div>
                    </button>
                </h2>

                <div id="collapse-${itemId}" class="accordion-collapse collapse" 
                     aria-labelledby="heading-${itemId}" data-bs-parent="#guaranteeListAccordion">
                    <div class="accordion-body">
                        ${detailContent}
                        <hr>
                        <button class="btn btn-sm btn-warning w-100 detail-btn" 
                                data-id="${item.id}" 
                                data-bs-toggle="modal" 
                                data-bs-target="#guaranteeDetailModal">
                            <i class="fas fa-edit me-2"></i>Cập nhật Chẩn đoán, Chi phí & Trạng thái
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.html(accordionHtml);

    // Gắn sự kiện mở modal cho các nút thao tác
    $('.detail-btn').off('click').on('click', handleOpenDetailModal);
}

// Hàm tạo nội dung chi tiết (Timeline)
function generateDetailContent(item) {
    let historyHtml = '';
    if (item.guaranteeHistories && item.guaranteeHistories.length > 0) {
        item.guaranteeHistories.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

        historyHtml = `<ul class="list-unstyled history-timeline">`;
        item.guaranteeHistories.forEach(history => {
            const historyStatusLabel = history.label || 'N/A';
            const historyStatusColor = history.color || '#95A5A6';
            const createdDate = history.createdDate
            historyHtml += `
                <li class="timeline-item">
                    <span class="timeline-dot" style="background-color: ${historyStatusColor};"></span>
                    <div class="timeline-content">
                        <span class="fw-bold" style="color:${historyStatusColor};">${historyStatusLabel}</span>
                        <small class="text-muted float-end">${createdDate}</small>
                    </div>
                </li>
            `;
        });
        historyHtml += `</ul>`;
    }

    return `
        <div class="row small">
            <div class="col-md-6 mb-2"><strong>IMEI:</strong> ${item.imei}</div>
            <div class="col-md-6 mb-2"><strong>Bộ nhớ:</strong> ${item.productStorage}</div>
            <div class="col-md-6 mb-2"><strong>Màu sắc:</strong> ${item.productColor}</div>
            <div class="col-md-6 mb-2"><strong>Ngày gửi:</strong> ${item.createdDate}</div>
            <div class="col-12 mb-3"><strong>Mô tả lỗi KH:</strong> ${item.description}</div>
            <div class="col-12 mb-3">
                <h6 class="text-secondary">Chẩn đoán hiện tại:</h6>
                <p class="mb-0">${item.errorDiagnosis || 'Chưa có chẩn đoán chính thức.'}</p>
            </div>
            <div class="col-12">
                <h6 class="text-secondary">Lịch sử Cập nhật:</h6>
                ${historyHtml || '<p class="mb-0 small text-muted">Chưa có lịch sử cập nhật.</p>'} 
            </div>
        </div>
    `;
}

// Trong file js/guarantee-admin.js

function renderPagination(totalPages) {
    // 1. Kiểm tra điều kiện: Nếu chỉ có 1 trang hoặc 0 trang thì không hiển thị
    if (totalPages <= 1) {
        $('#pageable').empty(); // Dọn dẹp nếu không cần phân trang
        return;
    }

    let paginationHtml = '';
    const maxPagesToShow = 5;

    // Tính toán phạm vi trang hiển thị
    let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

    // Điều chỉnh lại startPage nếu phạm vi bị lệch về cuối
    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    // Nút Previous
    paginationHtml += `<li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">Previous</a></li>`;

    // Các nút trang
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                            <a class="page-link" href="#" data-page="${i}">${i + 1}</a></li>`;
    }

    // Nút Next
    paginationHtml += `<li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">Next</a></li>`;

    $('#pageable').html(paginationHtml);

    // Gắn sự kiện click cho các nút trang
    $('#pageable a.page-link').off('click').on('click', function(e) {
        e.preventDefault();
        const newPage = parseInt($(this).data('page'));

        // Chỉ reload nếu newPage hợp lệ và khác trang hiện tại
        if (!isNaN(newPage) && newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
            currentPage = newPage;
            loadGuarantees();
        }
    });
}

// --- L O G I C   M O D A L   V À   C Ậ P   N H Ậ T ---

function handleOpenDetailModal(e) {
    const guaranteeId = $(e.currentTarget).data('id');
    const item = window.guaranteesData.find(g => g.id === guaranteeId);

    if (!item) return;

    // Hiển thị nội dung chi tiết
    $('#detailGuaranteeId').text(guaranteeId);
    $('#detailContent').html(generateDetailContent(item));

    // --- Điền dữ liệu vào Form Cập nhật ---
    $('#updateGuaranteeId').val(guaranteeId);
    $('#newErrorDiagnosis').val(item.errorDiagnosis || '');
    $('#newFee').val(item.fee || 0);

    // --- Setup Dropdown Trạng thái (Fix: gọi hàm để đổ dữ liệu) ---
    setupModalStatusDropdown(item.guaranteeStatus);
}

function setupModalStatusDropdown(currentStatus) {
    let optionsHtml = '';

    // Đảm bảo allStatuses có dữ liệu
    if (Object.keys(allStatuses).length === 0) {
        // Có thể hiển thị thông báo lỗi hoặc gọi lại loadGuaranteeStatuses
        optionsHtml = '<option value="">Lỗi tải trạng thái</option>';
    } else {
        for (const key in allStatuses) {
            const status = allStatuses[key];
            const selected = (key === currentStatus) ? 'selected' : '';
            // Lấy label và color từ object status
            optionsHtml += `<option value="${key}" ${selected} style="color: ${status.color};">${status.label}</option>`;
        }
    }

    $('#updateStatusDropdown').html(optionsHtml);
}

// Hàm gọi API Cập nhật Chẩn đoán và Phí
// Hàm gọi API Cập nhật Chẩn đoán và Phí
async function handleUpdateDiagnosisFee(e) {
    e.preventDefault();
    const guaranteeId = $('#updateGuaranteeId').val();
    const diagnosis = $('#newErrorDiagnosis').val();
    // Đảm bảo lấy giá trị số, nếu không hợp lệ thì mặc định là 0
    const fee = parseInt($('#newFee').val()) || 0;

    // Kiểm tra xem có dữ liệu cần cập nhật không
    if (!diagnosis && fee === 0) {
        toastr.warning("Vui lòng nhập Chẩn đoán lỗi hoặc Chi phí sửa chữa.");
        return;
    }

    const url = `${API_URL}/update-diagnosis-fee/${guaranteeId}`;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ errorDiagnosis: diagnosis, fee: fee })
        });

        const result = await response.json();

        if (response.ok) {
            toastr.success("Cập nhật chẩn đoán và chi phí thành công!");
            $('#guaranteeDetailModal').modal('hide');
            loadGuarantees(); // Tải lại danh sách để cập nhật dữ liệu trên giao diện
        } else {
            const errorMessage = result.message || "Không thể cập nhật. Lỗi từ Server.";
            toastr.error("Lỗi: " + errorMessage);
        }
    } catch (error) {
        console.error("Update API Error:", error);
        toastr.error("Lỗi kết nối Server.");
    }
}

// Hàm xử lý khi click Cập nhật Trạng thái
function handleUpdateStatusClick() {
    const guaranteeId = $('#updateGuaranteeId').val();
    const newStatus = $('#updateStatusDropdown').val();

    // Lấy tên trạng thái tiếng Việt
    const statusLabel = allStatuses[newStatus] ? allStatuses[newStatus].label : newStatus;

    swal({
        title: "Xác nhận cập nhật trạng thái?",
        text: `Bạn có chắc chắn muốn chuyển trạng thái yêu cầu #${guaranteeId} sang ${statusLabel}?`,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        closeOnConfirm: false // Giữ SweetAlert mở cho đến khi API phản hồi
    }, function(isConfirm) {
        if (isConfirm) {
            // Chỉ gọi API nếu người dùng xác nhận
            updateStatusApi(guaranteeId, newStatus);
        }
    });
}

// Hàm gọi API Cập nhật Trạng thái
async function updateStatusApi(id, status) {
    const url = `${API_URL}/update-status/${id}`;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: new Headers({
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ status: status, staffNote: "Cập nhật từ Admin Panel" })
        });

        const result = await response.json();

        if (response.ok) {
            swal("Thành công!", `Trạng thái đã được cập nhật sang ${allStatuses[status].label}.`, "success");
            $('#guaranteeDetailModal').modal('hide');
            loadGuarantees(); // Tải lại danh sách
            return true;
        } else {
            // Lỗi nghiệp vụ (lỗi MessageException từ Spring Boot)
            const errorMessage = result.message || "Không thể cập nhật trạng thái. Lỗi từ Server.";
            swal("Lỗi!", errorMessage, "error");
            // Tải lại dữ liệu để trạng thái dropdown không bị sai lệch nếu lỗi
            loadGuarantees();
            return false;
        }

    } catch (error) {
        console.error("Update API Error:", error);
        swal("Lỗi!", "Không thể kết nối Server để cập nhật.", "error");
        return false;
    }
}