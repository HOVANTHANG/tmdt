document.getElementById("sellerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Bạn cần đăng nhập");
        window.location.href = "/dangnhap";
        return;
    }

    const data = {
        shopName: document.getElementById("shopName").value.trim(),
        shopSlug: document.getElementById("shopSlug").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        description: document.getElementById("description").value.trim()
    };


    var url = 'http://localhost:8080/api/seller/register'
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(data)
    });

    const text = await response.text();

    if (response.ok) {
        alert("Đăng ký thành công!");
        window.location.href = "/seller/dashboard";
    } else {
        alert(text || "Đăng ký thất bại");
    }

});