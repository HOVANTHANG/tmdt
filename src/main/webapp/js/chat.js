let chatShopId = null;
let chatInterval = null;

function openChatShop() {
    if (!currentShop || !currentShop.id) {
        toastr.warning("Không tìm thấy shop");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        toastr.warning("Bạn cần đăng nhập để nhắn tin");
        window.location.href = "/dangnhap";
        return;
    }

    chatShopId = currentShop.id;

    document.getElementById("chatShopName").innerText =
        currentShop.shopName || currentShop.name || "Shop";

    document.getElementById("chatWidget").style.display = "block";

    loadChatMessages();

    if (chatInterval) clearInterval(chatInterval);
    chatInterval = setInterval(loadChatMessages, 3000);
}

function closeChatShop() {
    document.getElementById("chatWidget").style.display = "none";

    if (chatInterval) {
        clearInterval(chatInterval);
        chatInterval = null;
    }
}

async function loadChatMessages() {
    if (!chatShopId) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:8080/api/chat/user/messages?shopId=${chatShopId}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if (!res.ok) return;

    const messages = await res.json();

    renderChatMessages(messages);
}

function renderChatMessages(messages) {
    const box = document.getElementById("chatMessages");

    let html = "";

    messages.forEach(msg => {
        html += `
            <div class="chat-message ${msg.mine ? 'mine' : ''}">
                <div class="chat-bubble">
                    ${escapeHtml(msg.content)}
                </div>
            </div>
        `;
    });

    box.innerHTML = html;
    box.scrollTop = box.scrollHeight;
}

async function sendChatMessage() {
    const input = document.getElementById("chatInput");
    const content = input.value.trim();

    if (!content) return;

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8080/api/chat/user/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            shopId: chatShopId,
            content: content
        })
    });

    if (res.ok) {
        input.value = "";
        loadChatMessages();
    } else {
        toastr.error("Không gửi được tin nhắn");
    }
}

function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}