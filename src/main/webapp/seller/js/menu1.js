const exceptionCode = 417;
var token = localStorage.getItem("token");

$(document).ready(function () {
    // Always ensure sidebar starts open — clear any stale state
    localStorage.removeItem('sb|sidebar-toggle');
    document.body.classList.remove('sb-sidenav-toggled');

    checkroleSeller();
    loadmenu();
    loadtop();

    function loadmenu() {
        const currentPath = window.location.pathname;
        function active(path) { return currentPath.includes(path) ? 'active' : ''; }

        var content = `
            <a class="nav-link ${active('/seller/index')}" href="/seller/index">
                <div class="sb-nav-link-icon"><i class="fas fa-chart-line"></i></div>Tổng quan
            </a>
            <div class="sb-sidenav-menu-heading">Quản lý</div>
            <a class="nav-link ${active('/seller/product')}" href="/seller/product">
                <div class="sb-nav-link-icon"><i class="fas fa-box-open"></i></div>Sản phẩm
            </a>
            <a class="nav-link ${active('/seller/invoice')}" href="/seller/invoice">
                <div class="sb-nav-link-icon"><i class="fas fa-receipt"></i></div>Đơn hàng
            </a>
            <a class="nav-link ${active('/seller/voucher')}" href="/seller/voucher">
                <div class="sb-nav-link-icon"><i class="fas fa-tags"></i></div>Voucher
            </a>
            <div class="sb-sidenav-menu-heading">Danh mục</div>
            <a class="nav-link ${active('/seller/danhmuc')}" href="/seller/danhmuc">
                <div class="sb-nav-link-icon"><i class="fas fa-layer-group"></i></div>Danh mục
            </a>
            <a class="nav-link ${active('/seller/thuonghieu')}" href="/seller/thuonghieu">
                <div class="sb-nav-link-icon"><i class="fas fa-certificate"></i></div>Thương hiệu
            </a>
            <div class="sb-sidenav-menu-heading">Hỗ trợ</div>
            <a class="nav-link ${active('/seller/seller-chat')}" href="/seller/seller-chat">
                <div class="sb-nav-link-icon"><i class="fas fa-comments"></i></div>Tin nhắn
            </a>
            <a class="nav-link ${active('/seller/baohanh')}" href="/seller/baohanh">
                <div class="sb-nav-link-icon"><i class="fas fa-shield-alt"></i></div>Bảo hành
            </a>
            <a onclick="dangXuat()" class="nav-link" href="#">
                <div class="sb-nav-link-icon"><i class="fas fa-sign-out-alt"></i></div>Đăng xuất
            </a>`;

        var menu = `
            <nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div class="sb-sidenav-menu">
                    <div class="nav flex-column">
                        <div class="seller-brand-header">
                            <div class="seller-brand-logo"><i class="fas fa-store-alt"></i></div>
                            <div>
                                <div class="seller-brand-title">Seller Center</div>
                                <div class="seller-brand-sub" id="shopNameSidebar">Đang tải...</div>
                            </div>
                        </div>
                        ${content}
                    </div>
                </div>
            </nav>`;

        document.getElementById("layoutSidenav_nav").innerHTML = menu;

        // ── Force sidebar styles via JS to bypass styles.css override ──
        _injectSidebarStyles();
    }

    function _injectSidebarStyles() {
        // Remove previous injected style if navigating within seller
        var old = document.getElementById('__seller-sidebar-style');
        if (old) old.remove();

        var style = document.createElement('style');
        style.id = '__seller-sidebar-style';
        style.textContent = `
            #layoutSidenav_nav,
            #layoutSidenav_nav .sb-sidenav,
            #layoutSidenav_nav .sb-sidenav-dark {
                background: linear-gradient(180deg, #0c2e2a 0%, #071918 100%) !important;
                border-right: 2px solid rgba(13,148,136,.35) !important;
            }
            #sidenavAccordion .sb-sidenav-menu {
                background: transparent !important;
            }
            #sidenavAccordion .nav-link {
                color: rgba(255,255,255,.9) !important;
                border-left: 3px solid transparent !important;
                border-radius: 0 10px 10px 0 !important;
                margin: 2px 10px 2px 0 !important;
                transition: all .2s !important;
            }
            #sidenavAccordion .nav-link .sb-nav-link-icon,
            #sidenavAccordion .nav-link i {
                color: #5eead4 !important;
            }
            #sidenavAccordion .nav-link:hover {
                color: #fff !important;
                background: rgba(13,148,136,.28) !important;
                border-left-color: #2dd4bf !important;
                transform: translateX(2px) !important;
            }
            #sidenavAccordion .nav-link.active {
                color: #fff !important;
                background: linear-gradient(90deg, rgba(13,148,136,.5) 0%, rgba(13,148,136,.15) 100%) !important;
                border-left: 4px solid #2dd4bf !important;
                font-weight: 700 !important;
            }
            #sidenavAccordion .nav-link.active i {
                color: #fff !important;
            }
            .sb-sidenav-menu-heading {
                color: #2dd4bf !important;
                font-size: 10px !important;
                font-weight: 800 !important;
                letter-spacing: 1.4px !important;
                padding: 18px 16px 6px !important;
                opacity: .85;
            }
            .sb-topnav.navbar {
                background: linear-gradient(135deg, #0c2e2a 0%, #071918 100%) !important;
                border-bottom: 1px solid rgba(13,148,136,.4) !important;
            }
            .seller-brand-header {
                border-bottom: 1px solid rgba(255,255,255,.08) !important;
            }
            .seller-brand-title { color: #fff !important; font-weight: 700 !important; }
            .seller-brand-sub { color: rgba(255,255,255,.5) !important; }
        `;
        document.head.appendChild(style);
    }

    function loadtop() {
        var userStr = localStorage.getItem("user");
        var userName = "Seller";
        try {
            var u = JSON.parse(userStr);
            if (u && u.fullname) userName = u.fullname;
        } catch (e) {}

        var top = `
            <button class="btn btn-link btn-sm order-1 order-lg-0 me-3" id="sidebarToggle">
                <i class="fas fa-bars"></i>
            </button>
            <a class="navbar-brand ps-1" href="/seller/index">
                <span class="seller-topbar-badge"><i class="fas fa-store-alt"></i> Seller</span>
            </a>
            <div class="ms-auto d-flex align-items-center gap-3 pe-3">
                <a href="/index" class="btn-topbar-link" title="Về trang chủ">
                    <i class="fas fa-home"></i>
                </a>
                <div class="seller-avatar-wrap">
                    <div class="seller-avatar"><i class="fas fa-user"></i></div>
                    <span class="seller-username">${userName}</span>
                </div>
            </div>`;

        document.getElementById("top").innerHTML = top;

        // ✅ FIX: Bind event AFTER innerHTML is set — element now exists in DOM
        var btn = document.getElementById("sidebarToggle");
        if (btn) {
            btn.addEventListener('click', function () {
                document.body.classList.toggle('sb-sidenav-toggled');
            });
        }
    }
});

async function dangXuat() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace('../dangnhap');
}

function formatmoney(money) {
    const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
    return VND.format(money);
}

async function checkroleSeller() {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/dangnhap"; return; }
    try {
        const response = await fetch('http://localhost:8080/api/seller/check-role-seller', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) {
            const text = await response.text();
            alert(text || "Bạn không có quyền seller");
            window.location.href = "/index";
        }
    } catch (error) {
        console.error(error);
        alert("Không thể kết nối server");
        window.location.href = "/index";
    }
}
