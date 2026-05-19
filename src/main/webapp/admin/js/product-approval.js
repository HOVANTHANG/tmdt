// =========================================================
// Admin – Duyệt sản phẩm từ cửa hàng (product-approval.js)
// =========================================================

const BASE = 'http://localhost:8080';

// Trạng thái phân trang
let currentPage = 0;
let currentKeyword = '';

// ── Load badge số sản phẩm chờ duyệt ─────────────────────
async function loadPendingBadge() {
    try {
        const res = await fetch(`${BASE}/api/admin/shop/product/pending/count`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) return;
        const data = await res.json();
        const badge = document.getElementById('pendingBadge');
        if (badge) {
            badge.textContent = data.count || 0;
            badge.style.display = data.count > 0 ? 'inline-flex' : 'none';
        }
    } catch (e) { console.error(e); }
}

// ── Load danh sách sản phẩm chờ duyệt ────────────────────
async function loadPendingProducts(page = 0, keyword = '') {
    currentPage = page;
    currentKeyword = keyword;

    const tbody = document.getElementById('pendingList');
    tbody.innerHTML = `<tr><td colspan="8" class="pa-state">
        <div class="pa-spinner"></div><span>Đang tải dữ liệu...</span>
    </td></tr>`;

    let url = `${BASE}/api/admin/shop/product/pending?page=${page}&size=10`;
    if (keyword.trim()) url += `&keyword=${encodeURIComponent(keyword.trim())}`;

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        const list = data.content || [];
        const totalPages = data.totalPages || 0;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="pa-state">
                <i class="fa-solid fa-check-circle" style="color:#10b981;font-size:2rem;"></i>
                <span>Không có sản phẩm nào đang chờ duyệt!</span>
            </td></tr>`;
            document.getElementById('pendingPagination').innerHTML = '';
            return;
        }

        let html = '';
        list.forEach(p => {
            const shop    = p.shop ? p.shop.shopName : '<em>Không có shop</em>';
            const cat     = p.category ? p.category.name : '—';
            const brand   = p.tradeMark ? p.tradeMark.name : '—';
            const img     = p.imageBanner
                ? `<img src="${p.imageBanner}" class="pa-thumb" onerror="this.style.display='none'">`
                : `<div class="pa-thumb-ph"><i class="fa-solid fa-image"></i></div>`;
            const date    = p.createdDate || '';

            html += `
            <tr id="pa-row-${p.id}">
                <td><span class="pa-id">#${p.id}</span></td>
                <td>${img}</td>
                <td>
                    <div class="pa-name" title="${(p.name||'').replace(/"/g,'&quot;')}">${p.name || '—'}</div>
                    <div class="pa-code">${p.code || ''}</div>
                </td>
                <td>${shop}</td>
                <td>${cat}</td>
                <td>${brand}</td>
                <td>${date}</td>
                <td>
                    <div class="pa-actions">
                        <button class="pa-btn pa-btn-approve" onclick="approveProduct(${p.id})" title="Duyệt">
                            <i class="fa-solid fa-circle-check"></i> Duyệt
                        </button>
                        <button class="pa-btn pa-btn-reject" onclick="openRejectModal(${p.id},'${(p.name||'').replace(/'/g,'\\\'')}')" title="Từ chối">
                            <i class="fa-solid fa-circle-xmark"></i> Từ chối
                        </button>
                    </div>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;

        // Phân trang
        let pages = '';
        for (let i = 0; i < totalPages; i++) {
            pages += `<li class="page-item ${i === page ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0)"
                   onclick="loadPendingProducts(${i}, '${keyword.replace(/'/g,"\\'")}')">
                   ${i + 1}
                </a>
            </li>`;
        }
        document.getElementById('pendingPagination').innerHTML = pages;

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="8" class="pa-state">
            <i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;font-size:2rem;"></i>
            <span>Lỗi tải dữ liệu. Vui lòng thử lại.</span>
        </td></tr>`;
    }
}

// ── Duyệt sản phẩm ────────────────────────────────────────
async function approveProduct(id) {
    if (!confirm('Bạn có chắc muốn DUYỆT sản phẩm này?')) return;

    try {
        const res = await fetch(`${BASE}/api/admin/shop/product/${id}/approve`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
            toastr.success('Sản phẩm đã được duyệt thành công!');
            // Xóa row khỏi bảng
            const row = document.getElementById(`pa-row-${id}`);
            if (row) row.remove();
            loadPendingBadge();
            // Nếu hết sản phẩm trong trang thì reload
            const tbody = document.getElementById('pendingList');
            if (!tbody.querySelector('tr') || tbody.innerHTML.trim() === '') {
                loadPendingProducts(currentPage > 0 ? currentPage - 1 : 0, currentKeyword);
            }
        } else {
            const err = await res.json();
            toastr.error(err.defaultMessage || 'Có lỗi xảy ra!');
        }
    } catch (e) {
        toastr.error('Lỗi kết nối máy chủ!');
    }
}

// ── Mở modal từ chối ──────────────────────────────────────
let rejectTargetId = null;

function openRejectModal(id, name) {
    rejectTargetId = id;
    document.getElementById('rejectProductName').textContent = name;
    document.getElementById('rejectReason').value = '';
    const modal = new bootstrap.Modal(document.getElementById('rejectModal'));
    modal.show();
}

// ── Xác nhận từ chối ─────────────────────────────────────
async function confirmReject() {
    if (!rejectTargetId) return;
    const reason = document.getElementById('rejectReason').value.trim();

    try {
        const res = await fetch(`${BASE}/api/admin/shop/product/${rejectTargetId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });
        bootstrap.Modal.getInstance(document.getElementById('rejectModal')).hide();
        if (res.ok) {
            toastr.warning('Sản phẩm đã bị từ chối.');
            const row = document.getElementById(`pa-row-${rejectTargetId}`);
            if (row) row.remove();
            loadPendingBadge();
            const tbody = document.getElementById('pendingList');
            if (!tbody.querySelector('tr') || tbody.innerHTML.trim() === '') {
                loadPendingProducts(currentPage > 0 ? currentPage - 1 : 0, currentKeyword);
            }
        } else {
            const err = await res.json();
            toastr.error(err.defaultMessage || 'Có lỗi xảy ra!');
        }
    } catch (e) {
        toastr.error('Lỗi kết nối máy chủ!');
    }
    rejectTargetId = null;
}

// ── Tìm kiếm ─────────────────────────────────────────────
function searchPending() {
    const kw = document.getElementById('searchPendingInput').value;
    loadPendingProducts(0, kw);
}

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    loadPendingProducts(0, '');
    loadPendingBadge();

    // Tìm kiếm khi nhấn Enter
    const inp = document.getElementById('searchPendingInput');
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') searchPending(); });
});
