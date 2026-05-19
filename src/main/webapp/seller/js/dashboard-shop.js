var token = localStorage.getItem("token");
var revenueChart = null;
var profitChart = null;

function formatmoney(value) {
    return Number(value || 0).toLocaleString("vi-VN") + " đ";
}

function getDateTime() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
    var hour = String(now.getHours()).padStart(2, "0");
    var minute = String(now.getMinutes()).padStart(2, "0");
    var second = String(now.getSeconds()).padStart(2, "0");

    return year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
}

function renderClock() {
    var clock = document.getElementById("digital-clock");
    if (clock) {
        clock.innerHTML = getDateTime();
    }
}

function renderTodayName() {
    var days = [
        "Chủ nhật",
        "Thứ hai",
        "Thứ ba",
        "Thứ tư",
        "Thứ năm",
        "Thứ sáu",
        "Thứ bảy"
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

    var currentYear = new Date().getFullYear();

    await Promise.all([
        loadDashboardSummary(),
        loadRevenueChart(currentYear),
        loadProfitChart(currentYear),
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

        setText("doanhThuThang", formatmoney(data.revenueThisMonth));
        setText("doanhThuNgay", formatmoney(data.revenueToday));

        setText("loiNhuanThang", formatmoney(data.profitThisMonth));
        setText("loiNhuanNgay", formatmoney(data.profitToday));

        setText("donHoanThanh", data.invoiceDoneToday || 0);
        setText("tongSanPham", data.totalProduct || 0);
        setText("tongDonHang", data.totalInvoice || 0);
        setText("tongDonHoanThanh", data.totalInvoiceDone || 0);

        setText("shopName", data.shopName || "Không có shop");
        setText("shopNameSide", data.shopName || "Không có shop");

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

        var canvas = document.getElementById("shopRevenueChart");

        if (!canvas) return;

        var ctx = canvas.getContext("2d");

        if (revenueChart) {
            revenueChart.destroy();
        }

        revenueChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Doanh thu",
                    data: values,
                    backgroundColor: "#4e73df"
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

async function loadProfitChart(year) {
    var url = `http://localhost:8080/api/statistic/seller/profit-chart?year=${year}`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: new Headers({
                "Authorization": "Bearer " + token
            })
        });

        if (!res.ok) {
            throw new Error("Không tải được biểu đồ lợi nhuận");
        }

        const list = await res.json();

        var labels = [];
        var values = [];

        for (var i = 0; i < list.length; i++) {
            labels.push("Tháng " + list[i].month);
            values.push(list[i].revenue || 0);
        }

        var canvas = document.getElementById("shopProfitChart");

        if (!canvas) return;

        var ctx = canvas.getContext("2d");

        if (profitChart) {
            profitChart.destroy();
        }

        profitChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Lợi nhuận",
                    data: values,
                    backgroundColor: "#1cc88a"
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
        console.error("Lỗi loadProfitChart:", error);
        toastr.error("Không tải được biểu đồ lợi nhuận");
    }
}

async function reloadRevenueChart() {
    var yearEl = document.getElementById("yearFilter");

    if (!yearEl) return;

    var year = yearEl.value;

    await loadRevenueChart(year);
    await loadProfitChart(year);
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
                            <img src="${list[i].imageBanner || "/image/product1.webp"}"
                                 onerror="this.onerror=null; this.src='/image/product1.webp'">
                        </td>

                        <td>${list[i].name || ""}</td>

                        <td>${formatmoney(list[i].price || 0)}</td>

                        <td>${list[i].sold || 0}</td>
                    </tr>
                `;
            }
        }

        var table = document.getElementById("topProductTable");

        if (table) {
            table.innerHTML = html;
        }

    } catch (error) {
        console.error("Lỗi loadTopProducts:", error);
        toastr.error("Không tải được sản phẩm bán chạy");
    }
}

function setText(id, value) {
    var el = document.getElementById(id);

    if (el) {
        el.innerHTML = value;
    }
}