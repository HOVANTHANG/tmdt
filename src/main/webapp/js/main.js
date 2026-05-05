var token = localStorage.getItem("token");
var exceptionCode = 417;
function loadMenu() {
    var dn = '<li><a id="login-modal" href="dangnhap">Đăng nhập</a></li>';
    var bh = '';
    if (token != null) {
        dn = `<li><a id="login-modal" href="taikhoan">Tài khoản</a></li>
        <li onclick="dangxuat()"><a id="login-modal" href="#">Đăng xuất</a></li>
        `;
        bh = '<li><a href="/bao-hanh">Tra cứu bảo hành</a></li>'
    }
    var menu =
        ` <div class="subheader">
    <div class="container subcontainerheader">
        <ul>
            <li><a href="javascript:void(0)" onclick="goSellerRegister()">Đăng ký trở thành nhà bán hàng</a></li>
            <li><a href="/baiviet">Tin tức công nghệ</a></li>
            <li><a href="/diachi">Địa chỉ cửa hàng</a></li>
            <li><a href="timdonhang">Tra cứu đơn hàng</a></li>
            ${bh}
            ${dn}
        </ul>
    </div>
</div>
<div class="container">
    <div class="headertop">
        <div class="row">
            <div class="col-sm-3">
                <a href="index"><img src="image/logo.png" class="logoheader"></a>
            </div>
            <div class="col-sm-6">
                <form action="product" class="searchheader">
                    <input name="search" placeholder="Hôm nay bạn cần tìm gì?" class="inputsearchheader">
                    <button class="btnsearchheader"><i class="fa fa-search"></i></button>
                </form>
            </div>
            <div class="col-sm-3">
                <div class="row">
                    <div class="col-7">
                        <a class="btnkiemtradh" href="timdonhang">
                            <span class="icon"><i class="fa fa-truck"></i></span>
                            <span class="text">Kiểm tra đơn hàng</span>
                        </a>
                    </div>
                    <div class="col-5">
                        <div class="shoppingcartheader">
                            <div class="shopingcontentcart">
                                <a href="giohang"><img src="image/cartheader.png" class="imgcartheader"></a>
                                <span class="cart-total" id="totalcartheader">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="headercategory">
        <div id="listthuonghieuheader" class="listdmindex owl-2-style">
            
        </div>
    </div>
</div>`
    document.getElementById("headerweb").innerHTML = menu;
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
        `<footer class="text-center text-lg-start text-muted">
    <section class="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
      <div class="me-5 d-none d-lg-block"><span>Theo dõi chúng tôi tại:</span></div>
      <div>
        <a href="" class="me-4 text-reset"><i class="fab fa-facebook-f"></i></a>
        <a href="" class="me-4 text-reset"><i class="fab fa-twitter"></i></a>
        <a href="" class="me-4 text-reset"><i class="fab fa-google"></i></a>
        <a href="" class="me-4 text-reset"><i class="fab fa-instagram"></i></a>
        <a href="" class="me-4 text-reset"><i class="fab fa-linkedin"></i></a>
        <a href="" class="me-4 text-reset"><i class="fab fa-github"></i></a>
      </div>
    </section>
    <section class="">
      <div class=" text-center text-md-start mt-5">
        <div class="row mt-3">
          <div class="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
            <h6 class="text-uppercase fw-bold mb-4"><i class="fa fa-mobile" style="font-size: 25px;"></i> PhoneStore</h6>
            <p>
              Chúng tôi cung cấp các sản phẩm điện thoại, phụ kiện chính hãng, chất lượng cao đến người tiêu dùng
            </p>
          </div>
          <div class="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
            <h6 class="text-uppercase fw-bold mb-4">Về chúng tôi</h6>
            <p><a href="#!" class="text-reset">Hotline: 09723748234</a></p>
            <p><a href="#!" class="text-reset">Email: phonestore@gmail.com</a></p>
            <p><a href="#!" class="text-reset">Địa chỉ cs1: Số 1, đại cồ việt, Hai Bà Trưng, Hà nội</a></p>
            <p><a href="#!" class="text-reset">Địa chỉ cs2: Số 1, đại cồ việt, Hai Bà Trưng, Hà nội</a></p>
          </div>
          <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
            <h6 class="text-uppercase fw-bold mb-4">Hỗ trợ khách hàng</h6>
            <p><a href="#!" class="text-reset">Uy tín</a></p>
            <p><a href="#!" class="text-reset">Chất lượng</a></p>
            <p><a href="#!" class="text-reset">Nguồn gốc rõ ràng</a></p>
            <p><a href="#!" class="text-reset">Giá rẻ</a></p>
          </div>
          <div class="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
            <h6 class="text-uppercase fw-bold mb-4">Liên hệ</h6>
            <p><i class="fas fa-home me-3"></i> Hà nội, Việt Nam</p>
            <p><i class="fas fa-envelope me-3"></i> shop@gmail.com</p>
            <p><i class="fas fa-phone me-3"></i> + 01 234 567 88</p>
            <p><i class="fas fa-print me-3"></i> + 01 234 567 89</p>
          </div>
        </div>
      </div>
    </section>
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