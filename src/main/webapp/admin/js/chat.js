var stompClient = null;

$( document ).ready(function() {
    var user = localStorage.getItem("user");
    if(user != null){
        user = JSON.parse(user)
        var username = user.username;
        connect(username);
    }
});

function connect(username) {
    var uls = new URL(document.URL)
    var userid = uls.searchParams.get("user");
    var socket = new SockJS('/hello');
    stompClient = Stomp.over(socket);
    stompClient.connect({ username: username, }, function() {
        console.log('Web Socket is connected');
        stompClient.subscribe('/users/queue/messages', function(message) {
            var Idsender = message.headers.sender
            if(Idsender == userid){
                appendRecivers(message.body)
            }
        });
    });
}


$( document ).ready(function() {
    var uls = new URL(document.URL)
    var userid = uls.searchParams.get("user");
    $("#sendmess").click(function() {
        stompClient.send("/app/hello/"+userid, {}, $("#contentmess").val());
        append()
    });
    $('#contentmess').keypress(function (e) {
        var key = e.which;
        if(key == 13)  // the enter key code
        {
            stompClient.send("/app/hello/"+userid, {}, $("#contentmess").val());
            append()
        }
    });
});

// nối vào đoạn chat ngay sau khi gửi
function append() {
    var tinhan = `<p class="adminchat">${$("#contentmess").val()}</p>`
    document.getElementById('listchatadmin').innerHTML += tinhan;
    var scroll_to_bottom = document.getElementById('listchatadmin');
    scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight;
    document.getElementById("contentmess").value = ''
}



function appendRecivers (message) {
    var cont = `<p class="mychat">${message}</p>`
    document.getElementById('listchatadmin').innerHTML += cont;
    var scroll_to_bottom = document.getElementById('listchatadmin');
    scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight;
}


async function loadListUserChat(){
    var uls = new URL(document.URL)
    var userid = uls.searchParams.get("user");
    var param = document.getElementById("keysearchuser").value
    var urlAccount = 'http://localhost:8080/api/chat/admin/getAllUserChat';
    if(param != ''){
        urlAccount += '?search='+param
    }
    const res = await fetch(urlAccount, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await res.json();
    var main = '';
    for(i=0; i< list.length; i++){
        main += `<tr onclick="chuyenTrang(${list[i].user.id})" class="pointer trhoverchat ${userid == list[i].user.id?'activetrhoverchat':''}">
                    <td class="col45"><img src="../image/avatar.png" class="imgavatarchat"></td>
                    <td>${list[i].user.email}<span class="timechat">${list[i].time}</span></td>
                </tr>`
    }
    document.getElementById("listuserchat").innerHTML = main;
}

function chuyenTrang(iduser){
    var uls = new URL(document.URL)
    var userid = uls.searchParams.get("user");
    if(userid == iduser){
        return;
    }
    window.location.href = '/admin/chat?user='+iduser;
}


async function loadTinNhan(){
    var uls = new URL(document.URL)
    var userid = uls.searchParams.get("user");
    if(userid == null){
        document.getElementById("mainchatadmin").style.display = "none";
        return;
    }
    var url = 'http://localhost:8080/api/chat/admin/getListChat?idreciver='+userid;
    const res = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await res.json();
    var main = '';
    for(i=0; i< list.length; i++){
        if(list[i].sender.authorities.name == "ROLE_USER"){
            main += `<p class="mychat">${list[i].content}</p>`
        }
        else{
            main += `<p class="adminchat">${list[i].content}</p>`
        }
    }
    document.getElementById("listchatadmin").innerHTML = main;
}

