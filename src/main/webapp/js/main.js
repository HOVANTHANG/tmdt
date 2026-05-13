var token = localStorage.getItem("token");
var exceptionCode = 417;
function loadMenu() {
    var dn = '<a id="login-modal" href="dangnhap">Đăng nhập</a>';
    var bh = '';
    if (token != null) {
        dn = `<a id="login-modal" href="taikhoan">Tài khoản</a>
        <span class="topbar-divider"></span>
        <span onclick="dangxuat()"><a id="login-modal" href="#">Đăng xuất</a></span>
        `;
        bh = '<a href="/bao-hanh">Tra cứu bảo hành</a>' +
            '<span class="topbar-divider"></span>'
    }
    var menu =
        ` <!-- TOP BAR -->
<div class="topbar-modern">

    <div class="container topbar-container">

        <div class="topbar-left">

            <a href="javascript:void(0)"
               id="btnSellerRegister"
               onclick="goSellerRegister()">

                <i class="fas fa-store iconmenu"></i>
                Trở thành người bán

            </a>

            <span class="topbar-divider"></span>

            <a href="/baiviet">
                <i class="fa fa-newspaper-o"></i>
                Tin công nghệ
            </a>

            <span class="topbar-divider"></span>

            <a href="/diachi">
                <i class="fa fa-map-marker"></i>
                Hệ thống cửa hàng
            </a>

        </div>

        <div class="topbar-right">

            <a href="timdonhang">
                <i class="fa fa-truck"></i>
                Tra cứu đơn hàng
            </a>
            <span class="topbar-divider"></span>

            ${bh}
            

            ${dn}
          

        </div>

    </div>

</div>


<!-- HEADER -->
<header class="header-modern">

    <div class="container">

        <div class="header-main">

            <!-- LOGO -->
            <div class="header-logo">

                <a href="index">
                    <img src="image/logo.png" class="logoheader">
                </a>

            </div>


            <!-- SEARCH -->
            <div class="header-search">

                <form action="product" class="search-form-modern">

                    <div class="search-box-modern">

                        <i class="fa fa-search search-icon-modern"></i>

                        <input
                                type="text"
                                name="search"
                                placeholder="Bạn cần tìm gì hôm nay?"
                                class="input-search-modern"
                        >

                        <button class="btn-search-modern">
                            Tìm kiếm
                        </button>

                    </div>

                </form>

                <!-- HOT KEYWORD -->
                <div class="hot-keyword">

                    <a href="product?search=iphone">
                        iPhone
                    </a>

                    <a href="product?search=samsung">
                        Samsung
                    </a>

                    <a href="product?search=macbook">
                        Macbook
                    </a>

                    <a href="product?search=airpods">
                        AirPods
                    </a>

                    <a href="product?search=ipad">
                        iPad
                    </a>

                </div>

            </div>


            <!-- ACTION -->
            <div class="header-action">

                <!-- ORDER -->
                <a class="header-action-item"
                   href="timdonhang">

                    <div class="header-action-icon">
                        <i class="fa fa-truck"></i>
                    </div>

                    <div class="header-action-text">
                        <span>Theo dõi</span>
                        <strong>Đơn hàng</strong>
                    </div>

                </a>


                <!-- CART -->
                <a class="header-action-item cart-item-header"
                   href="giohang">

                    <div class="header-action-icon">

                        <img src="image/cartheader.png"
                             class="imgcartheader">

                        <span class="cart-total"
                              id="totalcartheader">
                              0
                        </span>

                    </div>

                    <div class="header-action-text">
                        <span>Giỏ hàng</span>
                        <strong>Mua ngay</strong>
                    </div>

                </a>

            </div>

        </div>

    </div>

</header>
`
    document.getElementById("headerweb").innerHTML = menu;
    checkSellerStatus();
    // loadThuongHieuAndPhuKien();
    countCart();
    // loadCou2();
    // loadCou3();
    loadFooter();
}


async function dangxuat() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace('dangnhap')
}


function formatmoney(money) {
    const VND = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    return VND.format(money);
}

async function loadThuongHieuAndPhuKien() {
    var url = 'http://localhost:8080/api/trademark/public/findAll';
    const response = await fetch(url, {});
    var list = await response.json();
    var main = '<div class="owl-carousel owl-2">'
    for (i = 0; i < list.length; i++) {
        main += `<div class="media-29101">
                    <a href="product?thuonghieu=${list[i].name}">${list[i].name}</a>
                </div>`
    }
    main += `</div>`
    document.getElementById("listthuonghieuheader").innerHTML += main;
    loadCou2();


    // var url = 'http://localhost:8080/api/category/public/find-by-type?type=PHU_KIEN';
    // const res = await fetch(url, {});
    // var list = await res.json();
    // var main = '<div class="owl-carousel owl-3">'
    // for (i = 0; i < list.length; i++) {
    //     main += `<div class="media-29101">
    //                 <a href="product?danhmuc=${list[i].id}">${list[i].name}</a>
    //             </div>`
    // }
    // main += `</div>`
    // document.getElementById("listdanhmucphukien").innerHTML += main;
    loadCou3();
}


function loadFooter() {
    var footer =
        `<footer class="footer-premium">

    <!-- TOP NEWSLETTER -->
    <div class="footer-newsletter">

        <div class="container newsletter-container">

            <div class="newsletter-left">

                <h3>
                    Đăng ký nhận ưu đãi mới nhất
                </h3>

                <p>
                    Nhận voucher và thông tin sản phẩm mới mỗi tuần
                </p>

            </div>

            <div class="newsletter-right">

                <input type="text"
                       placeholder="Nhập email của bạn">

                <button>
                    Đăng ký
                </button>

            </div>

        </div>

    </div>


    <!-- MAIN FOOTER -->
    <div class="footer-main-premium">

        <div class="container">

            <div class="row gy-5">

                <!-- BRAND -->
                <div class="col-lg-4 col-md-6">

                    <div class="footer-brand-box">

                        <div class="footer-logo-wrap">

                            <img src="image/logo.png"
                                 class="footer-logo-img">

                        </div>

                        <p class="footer-desc-premium">

                            Sellora là sàn thương mại điện tử hiện đại
                            chuyên cung cấp điện thoại, laptop,
                            phụ kiện công nghệ chính hãng với giá tốt,
                            giao hàng nhanh và hỗ trợ tận tâm.

                        </p>

                        <div class="footer-social-premium">

                            <a href="">
                                <i class="fab fa-facebook-f"></i>
                            </a>

                            <a href="">
                                <i class="fab fa-instagram"></i>
                            </a>

                            <a href="">
                                <i class="fab fa-tiktok"></i>
                            </a>

                            <a href="">
                                <i class="fab fa-youtube"></i>
                            </a>

                            <a href="">
                                <i class="fab fa-github"></i>
                            </a>

                        </div>

                    </div>

                </div>


                <!-- ABOUT -->
                <div class="col-lg-2 col-md-6">

                    <div class="footer-menu-box">

                        <h5>
                            Về chúng tôi
                        </h5>

                        <a href="">
                            Giới thiệu
                        </a>

                        <a href="">
                            Tuyển dụng
                        </a>

                        <a href="">
                            Tin tức
                        </a>

                        <a href="">
                            Liên hệ
                        </a>

                    </div>

                </div>


                <!-- POLICY -->
                <div class="col-lg-3 col-md-6">

                    <div class="footer-menu-box">

                        <h5>
                            Chính sách
                        </h5>

                        <a href="">
                            Chính sách bảo hành
                        </a>

                        <a href="">
                            Chính sách vận chuyển
                        </a>

                        <a href="">
                            Chính sách đổi trả
                        </a>

                        <a href="">
                            Điều khoản sử dụng
                        </a>

                    </div>

                </div>


                <!-- CONTACT -->
                <div class="col-lg-3 col-md-6">

                    <div class="footer-menu-box">

                        <h5>
                            Liên hệ
                        </h5>

                        <div class="footer-contact-item">

                            <i class="fa fa-map-marker"></i>

                            <span>
                                Hà Nội, Việt Nam
                            </span>

                        </div>

                        <div class="footer-contact-item">

                            <i class="fa fa-phone"></i>

                            <span>
                                0972 374 823
                            </span>

                        </div>

                        <div class="footer-contact-item">

                            <i class="fa fa-envelope"></i>

                            <span>
                                sellora@gmail.com
                            </span>

                        </div>

                        <div class="footer-contact-item">

                            <i class="fa fa-clock-o"></i>

                            <span>
                                08:00 - 22:00
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>


    <!-- BOTTOM -->
    <div class="footer-bottom-premium">

        <div class="container footer-bottom-container">

            <div class="footer-copy">

                © 2026 Sellora. All rights reserved.

            </div>

            <div class="footer-payment">

                <img src="image/payment.png">

            </div>

        </div>

    </div>

</footer>
`
    document.getElementById("footer").innerHTML = footer
    try {
        loadMyChat();
    }
    catch (e) {

    }
}




var stompClient = null;

$(document).ready(function () {
    var user = localStorage.getItem("user");
    if (user != null) {
        user = JSON.parse(user)
        var username = user.username;
        connect(username);
    }
});

function connect(username) {
    var socket = new SockJS('/hello');
    stompClient = Stomp.over(socket);
    stompClient.connect({ username: username, }, function () {
        console.log('Web Socket is connected');
        stompClient.subscribe('/users/queue/messages', function (message) {
            // var Idsender = message.headers.sender
            appendRecivers(message.body)
        });

    });
}


$(document).ready(function () {
    $("#sendmess").click(function () {
        stompClient.send("/app/hello/-10", {}, $("#contentmess").val());
        append()
    });
    $('#contentmess').keypress(function (e) {
        var key = e.which;
        if (key == 13)  // the enter key code
        {
            stompClient.send("/app/hello/-10", {}, $("#contentmess").val());
            append()
        }
    });
});

// nối vào đoạn chat ngay sau khi gửi
function append() {
    var tinhan = `<p class="mychat">${$("#contentmess").val()}</p>`
    document.getElementById('listchat').innerHTML += tinhan;
    var scroll_to_bottom = document.getElementById('scroll-to-bottom');
    scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight;
    document.getElementById("contentmess").value = ''
}

function appendRecivers(message) {
    var cont = `<p class="adminchat">${message}</p>`
    document.getElementById('listchat').innerHTML += cont;
    var scroll_to_bottom = document.getElementById('scroll-to-bottom');
    scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight;
}


async function loadMyChat() {
    var url = 'http://localhost:8080/api/chat/user/my-chat';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await response.json();
    var main = '';
    for (i = 0; i < list.length; i++) {
        if (list[i].sender.authorities.name == "ROLE_USER") {
            main += `<p class="mychat">${list[i].content}</p>`
        }
        else {
            main += `<p class="adminchat">${list[i].content}</p>`
        }
    }
    document.getElementById("listchat").innerHTML = main
}









async function countCart() {
    if (token == null) {
        return;
    }
    var url = 'http://localhost:8080/api/cart/user/count-cart';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status > 300) {
        return;
    }
    var count = await response.text();
    document.getElementById("totalcartheader").innerHTML = count
}

async function checkroleUser() {
    var token = localStorage.getItem("token");
    var url = 'http://localhost:8080/api/user/check-role-user';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status > 300) {
        window.location.replace('dangnhap')
    }
}

function toggleChatSocket() {
    var chatBox = document.getElementById("chat-box");
    var btnopenchat = document.getElementById("btnopenchat");
    if (chatBox.style.display === "none" || chatBox.style.display === "") {
        chatBox.style.display = "block";
        chatBox.style.bottom = "20px";
        btnopenchat.style.display = 'none'
    }
    else {
        chatBox.style.display = "none";
        btnopenchat.style.display = ''
    }
}






async function checkSellerStatus() {

    const token = localStorage.getItem("token");

    if (!token) return;

    try {

        const res = await fetch(
            "http://localhost:8080/api/seller/public/my-seller-status",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!res.ok) return;

        const status = await res.text();

        const btn = document.getElementById("btnSellerRegister");

        if (!btn) return;

        // chưa đăng ký
        if (status === "NONE") {

            btn.innerHTML = "Đăng ký trở thành nhà bán hàng";

            btn.style.pointerEvents = "auto";
            btn.style.opacity = "1";

            btn.onclick = function () {
                goSellerRegister();
            };

            return;
        }

        // đang chờ duyệt
        if (status === "PENDING") {

            btn.innerHTML = "Đang chờ admin duyệt";

            btn.style.pointerEvents = "none";
            btn.style.opacity = "0.6";

            return;
        }

        // đã duyệt
        if (status === "APPROVED") {

            btn.innerHTML = "Trang người bán";

            btn.style.pointerEvents = "auto";
            btn.style.opacity = "1";

            btn.onclick = function () {
                window.location.href = "/seller/index";
            };

            return;
        }

        // bị từ chối
        if (status === "REJECTED") {

            btn.innerHTML = "Đăng ký lại nhà bán hàng";

            btn.style.pointerEvents = "auto";
            btn.style.opacity = "1";

            btn.onclick = function () {
                window.location.href = "/seller-register";
            };

            return;
        }

    } catch (e) {
        console.error(e);
    }
}

function goSellerRegister() {
    window.location.href = "/sellerregister";
}