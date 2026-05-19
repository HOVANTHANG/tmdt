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
                <i class="fas fa-newspaper"></i>
                Tin công nghệ
            </a>

            <span class="topbar-divider"></span>

            <a href="/diachi">
                <i class="fas fa-map-marker-alt"></i>
                Hệ thống cửa hàng
            </a>

        </div>

        <div class="topbar-right">

            <a href="timdonhang">
                <i class="fas fa-shipping-fast"></i>
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

                        <i class="fas fa-search search-icon-modern"></i>

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
                        <i class="fas fa-shipping-fast"></i>
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
    countCart();
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

function loadFooter() {
    var footer = `
<footer class="ft-root">

    <!-- ── TRUST BADGES ── -->
    <div class="ft-trust">
        <div class="container">
            <div class="ft-trust-grid">
                <div class="ft-trust-item">
                    <div class="ft-trust-icon"><i class="fas fa-shipping-fast"></i></div>
                    <div class="ft-trust-text">
                        <strong>Miễn phí vận chuyển</strong>
                        <span>Tất cả đơn hàng trên toàn quốc</span>
                    </div>
                </div>
                <div class="ft-trust-item">
                    <div class="ft-trust-icon"><i class="fas fa-undo-alt"></i></div>
                    <div class="ft-trust-text">
                        <strong>Đổi trả dễ dàng</strong>
                        <span>Hoàn hàng trong vòng 7 ngày</span>
                    </div>
                </div>
                <div class="ft-trust-item">
                    <div class="ft-trust-icon"><i class="fas fa-shield-alt"></i></div>
                    <div class="ft-trust-text">
                        <strong>Thanh toán bảo mật</strong>
                        <span>Mã hóa SSL 256-bit</span>
                    </div>
                </div>
                <div class="ft-trust-item">
                    <div class="ft-trust-icon"><i class="fas fa-headset"></i></div>
                    <div class="ft-trust-text">
                        <strong>Hỗ trợ 24/7</strong>
                        <span>Đội ngũ tư vấn luôn sẵn sàng</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ── NEWSLETTER ── -->
    <div class="ft-newsletter">
        <div class="container">
            <div class="ft-nl-inner">
                <div class="ft-nl-left">
                    <div class="ft-nl-icon"><i class="fas fa-envelope-open-text"></i></div>
                    <div>
                        <h3 class="ft-nl-title">Đăng ký nhận ưu đãi</h3>
                        <p class="ft-nl-sub">Nhận voucher độc quyền và thông tin sản phẩm mới mỗi tuần</p>
                    </div>
                </div>
                <div class="ft-nl-form">
                    <input type="email" placeholder="Nhập địa chỉ email của bạn..." class="ft-nl-input" id="nlEmail">
                    <button class="ft-nl-btn" onclick="subscribeNewsletter()">
                        <i class="fas fa-paper-plane"></i> Đăng ký
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ── MAIN BODY ── -->
    <div class="ft-body">
        <div class="container">
            <div class="row gy-5">

                <!-- Brand -->
                <div class="col-lg-4 col-md-6">
                    <div class="ft-brand">
                        <div class="ft-logo-row">
                            <img src="image/logo.png" alt="Sellora" class="ft-logo">
                           
                        </div>
                        <p class="ft-brand-desc">
                            Sàn thương mại điện tử hiện đại — nơi kết nối người mua và người bán
                            với hàng nghìn sản phẩm công nghệ chính hãng, giao hàng siêu tốc
                            và dịch vụ hậu mãi tận tâm.
                        </p>
                        <div class="ft-social">
                            <a href="#" class="ft-social-btn fb" aria-label="Facebook">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" class="ft-social-btn ig" aria-label="Instagram">
                                <i class="fab fa-instagram"></i>
                            </a>
                            <a href="#" class="ft-social-btn tt" aria-label="TikTok">
                                <i class="fab fa-tiktok"></i>
                            </a>
                            <a href="#" class="ft-social-btn yt" aria-label="YouTube">
                                <i class="fab fa-youtube"></i>
                            </a>
                            <a href="#" class="ft-social-btn gh" aria-label="GitHub">
                                <i class="fab fa-github"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- About -->
                <div class="col-lg-2 col-md-3 col-6">
                    <div class="ft-col">
                        <h4 class="ft-col-title">Về Sellora</h4>
                        <ul class="ft-col-list">
                            <li><a href="#">Giới thiệu</a></li>
                            <li><a href="#">Tuyển dụng</a></li>
                            <li><a href="#">Tin tức công nghệ</a></li>
                            <li><a href="#">Đối tác</a></li>
                            <li><a href="#">Liên hệ</a></li>
                        </ul>
                    </div>
                </div>

                <!-- Policy -->
                <div class="col-lg-3 col-md-3 col-6">
                    <div class="ft-col">
                        <h4 class="ft-col-title">Chính sách</h4>
                        <ul class="ft-col-list">
                            <li><a href="#">Chính sách bảo hành</a></li>
                            <li><a href="#">Chính sách vận chuyển</a></li>
                            <li><a href="#">Chính sách đổi trả</a></li>
                            <li><a href="#">Bảo mật thông tin</a></li>
                            <li><a href="#">Điều khoản sử dụng</a></li>
                        </ul>
                    </div>
                </div>

                <!-- Contact -->
                <div class="col-lg-3 col-md-6">
                    <div class="ft-col">
                        <h4 class="ft-col-title">Liên hệ</h4>
                        <ul class="ft-contact-list">
                            <li>
                                <i class="fas fa-map-marker-alt"></i>
                                <span>123 Nguyễn Trãi, Hà Nội, Việt Nam</span>
                            </li>
                            <li>
                                <i class="fas fa-phone"></i>
                                <span>0972 374 823</span>
                            </li>
                            <li>
                                <i class="fas fa-envelope"></i>
                                <span>sellora@gmail.com</span>
                            </li>
                            <li>
                                <i class="fas fa-clock"></i>
                                <span>Hỗ trợ: 08:00 – 22:00 hàng ngày</span>
                            </li>
                        </ul>

                        <div class="ft-app-badges">
                            <a href="#" class="ft-app-btn">
                                <i class="fab fa-apple"></i> App Store
                            </a>
                            <a href="#" class="ft-app-btn">
                                <i class="fab fa-google-play"></i> Google Play
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- ── BOTTOM BAR ── -->
    <div class="ft-bottom">
        <div class="container ft-bottom-inner">
            <div class="ft-copy">
                © 2026 <strong>Sellora</strong>. Bảo lưu mọi quyền.
                <span class="ft-copy-heart"><i class="fas fa-heart"></i></span>
                Made in Vietnam
            </div>
            <div class="ft-payment-icons">
                <span class="ft-pay-badge"><i class="fab fa-cc-visa"></i></span>
                <span class="ft-pay-badge"><i class="fab fa-cc-mastercard"></i></span>
                <span class="ft-pay-badge"><i class="fab fa-cc-paypal"></i></span>
                <span class="ft-pay-badge"><i class="fab fa-cc-apple-pay"></i></span>
                <span class="ft-pay-badge ft-pay-momo">MoMo</span>
            </div>
        </div>
    </div>

</footer>
`;
    document.getElementById("footer").innerHTML = footer;
    try {
        loadMyChat();
    }
    catch (e) {

    }
}


function subscribeNewsletter() {
    var email = document.getElementById('nlEmail');
    if (!email) return;
    var val = email.value.trim();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        toastr.warning('Vui lòng nhập địa chỉ email hợp lệ!');
        return;
    }
    toastr.success('Đăng ký thành công! Cảm ơn bạn đã đăng ký nhận ưu đãi từ Sellora 🎉');
    email.value = '';
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
    if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') return;
    try {
        var socket = new SockJS('/hello');
        stompClient = Stomp.over(socket);
        stompClient.connect({ username: username, }, function () {
            console.log('Web Socket is connected');
            stompClient.subscribe('/users/queue/messages', function (message) {
                appendRecivers(message.body)
            });
        });
    } catch (e) {
        // SockJS không khả dụng trên trang này
    }
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
    // Không gọi nếu chưa đăng nhập hoặc element không tồn tại trên trang này
    if (!token) return;
    var listchatEl = document.getElementById("listchat");
    if (!listchatEl) return;

    var url = 'http://localhost:8080/api/chat/user/my-chat';
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });
        if (!response.ok) return;
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
        listchatEl.innerHTML = main;
    } catch (e) {
        // Bỏ qua lỗi khi trang không có listchat
    }
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