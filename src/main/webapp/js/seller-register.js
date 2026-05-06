const BASE_URL = "http://localhost:8080";
const UPLOAD_API = BASE_URL + "/api/public/upload-file";

let avatarUrl = "";

// 🔥 Upload avatar khi chọn file
document.getElementById("avatarFile").addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;

    let formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch(UPLOAD_API, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            alert("Upload ảnh thất bại");
            return;
        }

        avatarUrl = await res.text();

        document.getElementById("avatar").value = avatarUrl;

        const preview = document.getElementById("avatarPreview");
        preview.src = avatarUrl;
        preview.style.display = "block";

    } catch (e) {
        console.error(e);
        alert("Lỗi upload ảnh");
    }
});


// 🔥 Submit form
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
        description: document.getElementById("description").value.trim(),
        avatar: avatarUrl // 🔥 thêm avatar
    };

    var url = 'http://localhost:8080/api/seller/register';

    try {
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
            window.location.href = "/index";
        } else {
            alert(text || "Đăng ký thất bại");
        }

    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối server");
    }
});