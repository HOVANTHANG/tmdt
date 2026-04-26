var token = localStorage.getItem("token");
var revenueChart = null;

function formatmoney(value) {
    return Number(value || 0).toLocaleString("vi-VN") + " đ";
}

function getDateTime() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    var hour = String(now.getHours()).padStart(2, '0');
    var minute = String(now.getMinutes()).padStart(2, '0');
    var second = String(now.getSeconds()).padStart(2, '0');
    return year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
}

function renderClock() {
    var clock = document.getElementById("digital-clock");
    if (clock) {
        clock.innerHTML = getDateTime();
    }
}

function renderTodayName() {
    var days = [
        "Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư",
        "Thứ năm", "Thứ sáu", "Thứ bảy"
    ];
    var el = document.getElementById("today-name");
    if (el) {
        el.innerHTML = days[new Date().getDay()];
    }
}

function buildYearOptions() {
    var yearEl = document.getElementById("yearFilter");
    if (!yearEl) return;

    var html = "";
    var currentYear = new Date().getFullYear();

    for (var i = currentYear; i >= currentYear - 10; i--) {
        html += `<option value="${i}">Năm ${i}</option>`;
    }
    yearEl.innerHTML = html;
}

async function loadSellerDashboard() {
    renderTodayName();
    renderClock();
    setInterval(renderClock, 1000);
    buildYearOptions();

    await Promise.all([
        loadDashboardSummary(),
        loadRevenueChart(new Date().getFullYear()),
        loadTopProducts()
    ]);
}

async function loadDashboardSummary() {
    var url = "http://localhost:8080/api/statistic/seller/dashboard-summary";

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: new Headers({
                "Authorization": "Bearer " + token
            })
        });

        if (!res.ok) {
            throw new Error("Không tải được dashboard summary");
        }

        const data = await res.json();

        document.getElementById("doanhThuThang").innerHTML = formatmoney(data.revenueThisMonth);
        document.getElementById("doanhThuNgay").innerHTML = formatmoney(data.revenueToday);
        document.getElementById("donHoanThanh").innerHTML = data.invoiceDoneToday || 0;
        document.getElementById("tongSanPham").innerHTML = data.totalProduct || 0;
        document.getElementById("tongDonHang").innerHTML = data.totalInvoice || 0;
        document.getElementById("tongDonHoanThanh").innerHTML = data.totalInvoiceDone || 0;
        document.getElementById("shopName").innerHTML = data.shopName || "Không có shop";
        document.getElementById("shopNameSide").innerHTML = data.shopName || "Không có shop";

    } catch (error) {
        console.error("Lỗi loadDashboardSummary:", error);
        toastr.error("Không tải được thống kê tổng quan");
    }
}

async function loadRevenueChart(year) {
    var url = `http://localhost:8080/api/statistic/seller/revenue-chart?year=${year}`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: new Headers({
                "Authorization": "Bearer " + token
            })
        });

        if (!res.ok) {
            throw new Error("Không tải được biểu đồ doanh thu");
        }

        const list = await res.json();

        var labels = [];
        var values = [];

        for (var i = 0; i < list.length; i++) {
            labels.push("Tháng " + list[i].month);
            values.push(list[i].revenue || 0);
        }

        var ctx = document.getElementById("shopRevenueChart").getContext("2d");

        if (revenueChart) {
            revenueChart.destroy();
        }

        revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu',
                    data: values,
                    backgroundColor: '#4e73df'
                }]
            },
            options: {
                responsive: true,
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback: function (value) {
                                return Number(value).toLocaleString("vi-VN") + " đ";
                            }
                        }
                    }]
                }
            }
        });

    } catch (error) {
        console.error("Lỗi loadRevenueChart:", error);
        toastr.error("Không tải được biểu đồ doanh thu");
    }
}

async function reloadRevenueChart() {
    var year = document.getElementById("yearFilter").value;
    await loadRevenueChart(year);
}

async function loadTopProducts() {
    var url = "http://localhost:8080/api/statistic/seller/top-products";

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: new Headers({
                "Authorization": "Bearer " + token
            })
        });

        if (!res.ok) {
            throw new Error("Không tải được top sản phẩm");
        }

        const list = await res.json();
        var html = "";

        if (!list || list.length === 0) {
            html = `<tr><td colspan="5" class="text-center">Chưa có dữ liệu</td></tr>`;
        } else {
            for (var i = 0; i < list.length; i++) {
                html += `
                    <tr>
                        <td>${list[i].id}</td>
                        <td>
                            <img src="${list[i].imageBanner || 'image/product1.webp'}"
                                 onerror="this.src='image/product1.webp'">
                        </td>
                        <td>${list[i].name || ''}</td>
                        <td>${formatmoney(list[i].price || 0)}</td>
                        <td>${list[i].quantitySold || 0}</td>
                    </tr>
                `;
            }
        }

        document.getElementById("topProductTable").innerHTML = html;
    } catch (error) {
        console.error("Lỗi loadTopProducts:", error);
        toastr.error("Không tải được sản phẩm bán chạy");
    }
}