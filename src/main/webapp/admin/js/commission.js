// =========================================================
// Admin – Quản lý chiết khấu (commission.js)
// =========================================================

const BASE = 'http://localhost:8080';
let commissionChart = null;
let currentYear = new Date().getFullYear();

// ── Format tiền VND ─────────────────────────────────────
function fmtVND(n) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
}

// ── Load tổng quan chiết khấu ────────────────────────────
async function loadCommissionSummary() {
    try {
        const res  = await fetch(`${BASE}/api/admin/commission/summary`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();

        document.getElementById('commissionThisMonth').textContent = fmtVND(data.commissionThisMonth);
        document.getElementById('commissionAllTime').textContent   = fmtVND(data.commissionAllTime);
    } catch (e) { console.error(e); }
}

// ── Load biểu đồ chiết khấu theo năm ────────────────────
async function loadCommissionChart(year) {
    currentYear = year;
    document.getElementById('chartYear').textContent = year;

    try {
        const res  = await fetch(`${BASE}/api/admin/commission/chart?year=${year}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();

        const labels = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
        const ctx    = document.getElementById('commissionChartCanvas').getContext('2d');

        if (commissionChart) commissionChart.destroy();

        commissionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Chiết khấu (VND)',
                    data: data.data,
                    backgroundColor: 'rgba(59,130,246,0.75)',
                    borderColor:     '#2563eb',
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => fmtVND(ctx.parsed.y)
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: v => fmtVND(v)
                        }
                    }
                }
            }
        });
    } catch (e) { console.error(e); }
}

// ── Load bảng chiết khấu từng shop ──────────────────────
async function loadCommissionByShop() {
    const tbody = document.getElementById('commissionTable');
    tbody.innerHTML = `<tr><td colspan="7" class="cm-state">
        <div class="cm-spinner"></div><span>Đang tải...</span>
    </td></tr>`;

    try {
        const res  = await fetch(`${BASE}/api/admin/commission/by-shop`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const list = await res.json();

        if (!list || list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="cm-state">
                <span>Chưa có dữ liệu shop.</span></td></tr>`;
            return;
        }

        let html = '';
        list.forEach(s => {
            const rate     = s.commissionRate || 5;
            const avatar   = s.avatar
                ? `<img src="${s.avatar}" class="cm-avatar">`
                : `<div class="cm-avatar-ph"><i class="fa-solid fa-store"></i></div>`;

            html += `
            <tr id="cm-row-${s.shopId}">
                <td>${avatar}</td>
                <td><strong>${s.shopName || '—'}</strong></td>
                <td><span class="cm-rate-badge">${rate}%</span></td>
                <td>${fmtVND(s.totalRevenue)}</td>
                <td style="color:#3b82f6;font-weight:700;">${fmtVND(s.commissionThisMonth)}</td>
                <td style="color:#10b981;font-weight:700;">${fmtVND(s.commissionTotal)}</td>
                <td>
                    <div class="cm-actions">
                        <input type="number" id="rate-${s.shopId}" value="${rate}"
                               min="0" max="100" step="0.5"
                               class="cm-rate-input" placeholder="%" />
                        <button class="cm-btn-save" onclick="updateRate(${s.shopId})">
                            <i class="fa-solid fa-floppy-disk"></i> Lưu
                        </button>
                    </div>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="7" class="cm-state" style="color:#ef4444;">
            <span>Lỗi tải dữ liệu.</span></td></tr>`;
    }
}

// ── Cập nhật tỉ lệ chiết khấu 1 shop ────────────────────
async function updateRate(shopId) {
    const input = document.getElementById(`rate-${shopId}`);
    const rate  = parseFloat(input.value);

    if (isNaN(rate) || rate < 0 || rate > 100) {
        toastr.warning('Tỉ lệ phải từ 0% đến 100%');
        return;
    }

    try {
        const res = await fetch(`${BASE}/api/admin/commission/by-shop/${shopId}/rate`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rate })
        });
        if (res.ok) {
            toastr.success('Cập nhật chiết khấu thành công!');
            loadCommissionByShop();
            loadCommissionSummary();
        } else {
            const err = await res.json();
            toastr.error(err.message || 'Lỗi cập nhật');
        }
    } catch (e) {
        toastr.error('Lỗi kết nối!');
    }
}

// ── Áp dụng tỉ lệ toàn cục ──────────────────────────────
async function applyGlobalRate() {
    const rate = parseFloat(document.getElementById('globalRateInput').value);
    if (isNaN(rate) || rate < 0 || rate > 100) {
        toastr.warning('Tỉ lệ phải từ 0% đến 100%');
        return;
    }

    if (!confirm(`Áp dụng chiết khấu ${rate}% cho TẤT CẢ shop?`)) return;

    try {
        const res = await fetch(`${BASE}/api/admin/commission/global-rate`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rate })
        });
        const data = await res.json();
        if (res.ok) {
            toastr.success(data.message);
            loadCommissionByShop();
            loadCommissionSummary();
        } else {
            toastr.error(data.message || 'Lỗi cập nhật');
        }
    } catch (e) {
        toastr.error('Lỗi kết nối!');
    }
}

// ── Điều hướng năm biểu đồ ──────────────────────────────
function prevYear() { loadCommissionChart(currentYear - 1); }
function nextYear() { loadCommissionChart(currentYear + 1); }

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    loadCommissionSummary();
    loadCommissionChart(currentYear);
    loadCommissionByShop();
});
