const CHAT_BASE_URL = "http://localhost:8080";

let chatRooms            = [];
let selectedChatRoom     = null; // { shopId, shopName, sellerUserId, roomId }
let chatStompClient      = null;
let chatMyId             = null;

/* ── Init ── */
document.addEventListener("DOMContentLoaded", function () {
    createChatWidgetHtml();
    initChatWidget();
});

async function initChatWidget() {
    const token = getChatToken();
    if (!token) return;

    try {
        const res = await fetch(CHAT_BASE_URL + "/api/chat/user/current-info", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!res.ok) return;
        const info = await res.json();
        chatMyId = info.id;
        connectChatStomp();
        loadChatRooms();
    } catch (e) {
        console.error("[Chat Widget] Init error:", e);
    }
}

/* ── STOMP ── */
function connectChatStomp() {
    if (!chatMyId) return;
    // Guard: SockJS hoặc Stomp chưa được load trên trang này
    if (typeof SockJS === "undefined" || typeof Stomp === "undefined") {
        console.warn("[Chat Widget] SockJS/Stomp not loaded — realtime disabled.");
        return;
    }
    try {
        const sock = new SockJS(CHAT_BASE_URL + "/hello");
        chatStompClient = Stomp.over(sock);
        chatStompClient.debug = null;
        chatStompClient.connect({}, function () {
            const topic = "/topic/chat/" + chatMyId;
            console.log("[Chat Widget] STOMP subscribed:", topic);
            chatStompClient.subscribe(topic, function (frame) {
                const msg = JSON.parse(frame.body);
                console.log("[Chat Widget] WS received:", msg);
                const incomingRoomId = Number(msg.roomId);
                const currentRoomId  = selectedChatRoom ? Number(selectedChatRoom.roomId) : null;
                if (currentRoomId && incomingRoomId === currentRoomId) {
                    appendChatBubble(msg.content, false);
                } else {
                    highlightChatRoom(incomingRoomId);
                    const badge = document.getElementById("chatRoomCount");
                    if (badge) badge.style.background = "#ee4d2d";
                }
            });
        }, function (err) {
            console.error("[Chat Widget] STOMP error:", err);
        });
    } catch (e) {
        console.error("[Chat Widget] connectChatStomp error:", e);
    }
}

/* ── HTML Template ── */
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
                           placeholder="Tim theo ten shop">
                </div>

                <div class="chat-room-list" id="chatRoomList"></div>
            </div>

            <div class="chat-main">
                <div class="chat-main-header">
                    <div class="chat-main-title" id="chatMainTitle">Shop Chat</div>
                    <button class="chat-main-close" onclick="toggleChatPopup()">&times;</button>
                </div>

                <div class="chat-empty" id="chatEmpty">
                    Chon mot shop de bat dau tro chuyen
                </div>

                <div class="chat-message-area" id="chatMessageArea"></div>

                <div class="chat-input-area" id="chatInputArea">
                    <input id="chatInput"
                           onkeydown="handleChatEnter(event)"
                           placeholder="Nhap tin nhan...">
                    <button onclick="sendChatMessage()">Gui</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
}

function getChatToken() {
    return localStorage.getItem("token");
}

/* ── Toggle popup ── */
function toggleChatPopup() {
    const box = document.getElementById("chatPopup");
    if (!box) return;

    if (box.style.display === "grid") {
        box.style.display = "none";
    } else {
        box.style.display = "grid";
        loadChatRooms();
    }
}

/* ── Rooms ── */
async function loadChatRooms() {
    const token = getChatToken();
    if (!token) { updateChatCount(0); return; }

    try {
        const res = await fetch(CHAT_BASE_URL + "/api/chat/user/rooms", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!res.ok) return;
        chatRooms = await res.json();
        updateChatCount(chatRooms.length);
        renderChatRooms(chatRooms);
    } catch (e) {
        console.error("[Chat Widget] Load rooms error:", e);
    }
}

function updateChatCount(count) {
    const badge = document.getElementById("chatRoomCount");
    const text  = document.getElementById("chatTotalText");
    if (badge) badge.innerText = count;
    if (text)  text.innerText  = "(" + count + ")";
}

function renderChatRooms(rooms) {
    const box = document.getElementById("chatRoomList");
    if (!box) return;

    if (!rooms || rooms.length === 0) {
        box.innerHTML = `<div style="padding:14px;color:#777;">Ban chua nhan tin voi shop nao</div>`;
        return;
    }

    let html = "";
    rooms.forEach(function (room) {
        html += `
            <div class="chat-room-item"
                 id="chat-room-${room.roomId}"
                 onclick="selectChatRoom(${room.roomId})">
                <img class="chat-room-avatar"
                     src="${room.shopAvatar || 'image/logo.ico'}"
                     onerror="this.src='image/logo.ico'">
                <div class="chat-room-info">
                    <div class="chat-room-name">${escapeHtml(room.shopName || "Shop")}</div>
                    <div class="chat-room-last" id="chat-last-${room.roomId}">Nhan de xem tin nhan...</div>
                </div>
            </div>
        `;
    });
    box.innerHTML = html;
}

function filterChatRooms() {
    const keyword = (document.getElementById("chatSearchInput").value || "").toLowerCase();
    const filtered = chatRooms.filter(function (r) {
        return String(r.shopName || "").toLowerCase().includes(keyword);
    });
    renderChatRooms(filtered);
}

function highlightChatRoom(roomId) {
    const el = document.getElementById("chat-room-" + roomId);
    if (el) el.style.borderLeft = "3px solid #ee4d2d";
    const last = document.getElementById("chat-last-" + roomId);
    if (last) { last.style.fontWeight = "700"; last.style.color = "#ee4d2d"; }
    if (!el) loadChatRooms();
}

/* ── Select room ── */
async function selectChatRoom(roomId) {
    selectedChatRoom = chatRooms.find(function (r) { return r.roomId === roomId; });
    if (!selectedChatRoom) return;

    document.querySelectorAll(".chat-room-item").forEach(function (item) {
        item.classList.remove("active");
        item.style.borderLeft = "";
    });
    const el = document.getElementById("chat-room-" + roomId);
    if (el) el.classList.add("active");

    const last = document.getElementById("chat-last-" + roomId);
    if (last) { last.style.fontWeight = ""; last.style.color = ""; }

    document.getElementById("chatMainTitle").innerText = selectedChatRoom.shopName || "Shop";
    document.getElementById("chatEmpty").style.display        = "none";
    document.getElementById("chatMessageArea").style.display  = "block";
    document.getElementById("chatInputArea").style.display    = "flex";

    await loadChatMessages();
}

/* ── Messages ── */
async function loadChatMessages() {
    if (!selectedChatRoom) return;
    const token = getChatToken();
    if (!token) return;

    try {
        const res = await fetch(
            CHAT_BASE_URL + "/api/chat/user/messages?shopId=" + selectedChatRoom.shopId, {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!res.ok) return;
        const messages = await res.json();
        renderChatMessages(messages);
    } catch (e) {
        console.error("[Chat Widget] Load messages error:", e);
    }
}

function renderChatMessages(messages) {
    const box = document.getElementById("chatMessageArea");
    if (!box) return;
    box.innerHTML = "";
    messages.forEach(function (msg) {
        appendChatBubble(msg.content, msg.mine, false);
    });
    box.scrollTop = box.scrollHeight;
}

function appendChatBubble(content, mine, scroll) {
    if (scroll === undefined) scroll = true;
    const box = document.getElementById("chatMessageArea");
    if (!box) return;
    const row = document.createElement("div");
    row.className = "chat-msg-row" + (mine ? " mine" : "");
    const bubble = document.createElement("div");
    bubble.className = "chat-msg-bubble";
    bubble.textContent = content;
    row.appendChild(bubble);
    box.appendChild(row);
    if (scroll) box.scrollTop = box.scrollHeight;
}

/* ── Send ── */
async function sendChatMessage() {
    const input   = document.getElementById("chatInput");
    const content = (input.value || "").trim();
    if (!content || !selectedChatRoom) return;

    const token = getChatToken();
    if (!token) {
        alert("Ban can dang nhap");
        window.location.href = "/dangnhap";
        return;
    }

    const body = {
        shopId:       selectedChatRoom.shopId,
        content:      content,
        sellerUserId: selectedChatRoom.sellerUserId  // push WS to seller
    };

    try {
        const res = await fetch(CHAT_BASE_URL + "/api/chat/user/send", {
            method:  "POST",
            headers: {
                "Content-Type":  "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            const saved = await res.json();
            // Cập nhật roomId nếu lần đầu nhắn tin (room mới được tạo)
            if (saved && saved.roomId && !selectedChatRoom.roomId) {
                selectedChatRoom.roomId = saved.roomId;
            }
            appendChatBubble(content, true);
            input.value = "";
            const last = document.getElementById("chat-last-" + selectedChatRoom.roomId);
            if (last) { last.textContent = content; last.style.fontWeight = ""; }
            await loadChatRooms();
        }
    } catch (e) {
        console.error("[Chat Widget] Send error:", e);
    }
}

function handleChatEnter(event) {
    if (event.key === "Enter") sendChatMessage();
}

/* ── Open from shop page ── */
function openChatWithShop(shop) {
    const token = getChatToken();
    if (!token) {
        alert("Ban can dang nhap");
        window.location.href = "/dangnhap";
        return;
    }
    if (!shop || !shop.id) { alert("Khong tim thay shop"); return; }

    const box = document.getElementById("chatPopup");
    if (box) box.style.display = "grid";

    loadChatRooms().then(function () {
        // Find room by shopId
        const room = chatRooms.find(function (r) { return r.shopId === shop.id; });
        if (room) {
            selectChatRoom(room.roomId);
        } else {
            // Chưa có room (lần đầu chat với shop) → mở chat mới trực tiếp
            openNewChatWithShop(shop);
        }
    });
}

/* ── Mở chat mới với shop chưa từng nhắn tin ── */
function openNewChatWithShop(shop) {
    // Tạo room giả để hiện UI
    selectedChatRoom = {
        shopId:       shop.id,
        shopName:     shop.shopName || shop.name || "Shop",
        sellerUserId: shop.sellerUserId || null,
        roomId:       null   // chưa có roomId thật, sẽ được tạo khi gửi tin đầu tiên
    };

    document.getElementById("chatMainTitle").innerText = selectedChatRoom.shopName;
    document.getElementById("chatEmpty").style.display        = "none";
    document.getElementById("chatMessageArea").style.display  = "block";
    document.getElementById("chatInputArea").style.display    = "flex";

    const box = document.getElementById("chatMessageArea");
    if (box) {
        box.innerHTML = `<div style="text-align:center;color:#aaa;padding:20px;font-size:13px;">
            Bắt đầu cuộc trò chuyện với <b>${selectedChatRoom.shopName}</b>
        </div>`;
    }

    const input = document.getElementById("chatInput");
    if (input) input.focus();
}

/* ── Helpers ── */
function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}