const CHAT_BASE_URL = "http://localhost:8080";

let chatRooms = [];
let selectedChatShopId = null;
let selectedChatShopName = null;
let chatReloadInterval = null;

document.addEventListener("DOMContentLoaded", function () {
    createChatWidgetHtml();
    loadChatRooms();
});

function createChatWidgetHtml() {
    if (document.getElementById("chatPopup")) return;

    const html = `
        <button class="chat-float-btn" onclick="toggleChatPopup()">
            <i class="fa fa-comments"></i>
            <span id="chatRoomCount">0</span>
        </button>

        <div class="chat-popup" id="chatPopup">
            <div class="chat-sidebar">
                <div class="chat-sidebar-header">
                    <span class="chat-sidebar-title">Chat</span>
                    <span id="chatTotalText">(0)</span>
                </div>

                <div class="chat-search">
                    <input id="chatSearchInput"
                           onkeyup="filterChatRooms()"
                           placeholder="Tìm theo tên shop">
                </div>

                <div class="chat-room-list" id="chatRoomList"></div>
            </div>

            <div class="chat-main">
                <div class="chat-main-header">
                    <div>
                        <div class="chat-main-title" id="chatMainTitle">Shop Chat</div>
                    </div>
                    <button class="chat-main-close" onclick="toggleChatPopup()">×</button>
                </div>

                <div class="chat-empty" id="chatEmpty">
                    Chọn một shop để bắt đầu trò chuyện
                </div>

                <div class="chat-message-area" id="chatMessageArea"></div>

                <div class="chat-input-area" id="chatInputArea">
                    <input id="chatInput"
                           onkeydown="handleChatEnter(event)"
                           placeholder="Nhập tin nhắn...">
                    <button onclick="sendChatMessage()">Gửi</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
}

function getChatToken() {
    return localStorage.getItem("token");
}

function toggleChatPopup() {
    const box = document.getElementById("chatPopup");

    if (box.style.display === "grid") {
        box.style.display = "none";
        stopChatAutoReload();
    } else {
        box.style.display = "grid";
        loadChatRooms();

        if (selectedChatShopId) {
            startChatAutoReload();
        }
    }
}

async function loadChatRooms() {
    const token = getChatToken();

    if (!token) {
        updateChatCount(0);
        return;
    }

    try {
        const res = await fetch(`${CHAT_BASE_URL}/api/chat/user/rooms`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) return;

        chatRooms = await res.json();

        updateChatCount(chatRooms.length);
        renderChatRooms(chatRooms);

    } catch (e) {
        console.error("Không tải được phòng chat:", e);
    }
}

function updateChatCount(count) {
    const badge = document.getElementById("chatRoomCount");
    const text = document.getElementById("chatTotalText");

    if (badge) badge.innerText = count;
    if (text) text.innerText = `(${count})`;
}

function renderChatRooms(rooms) {
    const box = document.getElementById("chatRoomList");
    if (!box) return;

    if (!rooms || rooms.length === 0) {
        box.innerHTML = `
            <div style="padding:14px;color:#777;">
                Bạn chưa nhắn tin với shop nào
            </div>
        `;
        return;
    }

    let html = "";

    rooms.forEach(room => {
        html += `
            <div class="chat-room-item"
                 id="chat-room-${room.shopId}"
                 onclick="selectChatRoom(${room.shopId}, '${escapeJs(room.shopName || "Shop")}')">

                <img class="chat-room-avatar"
                     src="${room.shopAvatar || 'image/logo.ico'}"
                     onerror="this.src='image/logo.ico'">

                <div class="chat-room-info">
                    <div class="chat-room-name">${escapeHtml(room.shopName || "Shop")}</div>
                    <div class="chat-room-last">Nhấn để xem tin nhắn...</div>
                </div>
            </div>
        `;
    });

    box.innerHTML = html;
}

function filterChatRooms() {
    const input = document.getElementById("chatSearchInput");
    const keyword = input.value.toLowerCase();

    const filtered = chatRooms.filter(room =>
        String(room.shopName || "").toLowerCase().includes(keyword)
    );

    renderChatRooms(filtered);
}

async function selectChatRoom(shopId, shopName) {
    selectedChatShopId = shopId;
    selectedChatShopName = shopName;

    document.querySelectorAll(".chat-room-item").forEach(item => {
        item.classList.remove("active");
    });

    const active = document.getElementById("chat-room-" + shopId);
    if (active) active.classList.add("active");

    document.getElementById("chatMainTitle").innerText = shopName || "Shop";
    document.getElementById("chatEmpty").style.display = "none";
    document.getElementById("chatMessageArea").style.display = "block";
    document.getElementById("chatInputArea").style.display = "flex";

    await loadChatMessages();
    startChatAutoReload();
}

async function loadChatMessages() {
    if (!selectedChatShopId) return;

    const token = getChatToken();
    if (!token) return;

    try {
        const res = await fetch(`${CHAT_BASE_URL}/api/chat/user/messages?shopId=${selectedChatShopId}`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) return;

        const messages = await res.json();
        renderChatMessages(messages);

    } catch (e) {
        console.error("Không tải được tin nhắn:", e);
    }
}

function renderChatMessages(messages) {
    const box = document.getElementById("chatMessageArea");
    if (!box) return;

    let html = "";

    messages.forEach(msg => {
        html += `
            <div class="chat-msg-row ${msg.mine ? "mine" : ""}">
                <div class="chat-msg-bubble">
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

    if (!content || !selectedChatShopId) return;

    const token = getChatToken();

    if (!token) {
        alert("Bạn cần đăng nhập");
        window.location.href = "/dangnhap";
        return;
    }

    try {
        const res = await fetch(`${CHAT_BASE_URL}/api/chat/user/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                shopId: selectedChatShopId,
                content: content
            })
        });

        if (res.ok) {
            input.value = "";
            await loadChatMessages();
            await loadChatRooms();
        }

    } catch (e) {
        console.error("Không gửi được tin nhắn:", e);
    }
}

function startChatAutoReload() {
    stopChatAutoReload();
    chatReloadInterval = setInterval(loadChatMessages, 3000);
}

function stopChatAutoReload() {
    if (chatReloadInterval) {
        clearInterval(chatReloadInterval);
        chatReloadInterval = null;
    }
}

function handleChatEnter(event) {
    if (event.key === "Enter") {
        sendChatMessage();
    }
}

function openChatWithShop(shop) {
    const token = getChatToken();

    if (!token) {
        alert("Bạn cần đăng nhập");
        window.location.href = "/dangnhap";
        return;
    }

    if (!shop || !shop.id) {
        alert("Không tìm thấy shop");
        return;
    }

    const box = document.getElementById("chatPopup");
    box.style.display = "grid";

    loadChatRooms().then(() => {
        selectChatRoom(shop.id, shop.shopName || shop.name || "Shop");
    });
}

function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeJs(text) {
    return String(text || "").replace(/'/g, "\\'");
}