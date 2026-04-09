async function loadBanner() {
    var path = window.location.pathname;
    var page = path.split("/").pop();
    var url = 'http://localhost:8080/api/banner/public/find-by-page?page='+page
    const response = await fetch(url, {
    });
    var list = await response.json();
    console.log(list);


    var main = '<div class="carousel-inner carousel-inner-index">';
    var check = true;
    for (i = 0; i < list.length; i++) {
        if(list[i].bannerType == "TOP"){
            var act = ''
            if(check == true){
                act = 'active';
            }
            main += `<div class="carousel-item ${act}">
                <a href="${list[i].linkWeb}"><img src="${list[i].image}" class="d-block w-100" alt="..."></a>
            </div>`
        }
    check = false;
    }
    main += `</div>`
    try {
        document.getElementById("carouselindex").innerHTML = main
    } catch (error) {}



    var normalbn = [];
    for (i = 0; i < list.length; i++) {
        if(list[i].bannerType == "NORMAL"){
            normalbn.push(list[i]);
        }
    }

    var bannerhot = document.getElementsByClassName("bannerhot1");
    for(i=0; i<bannerhot.length; i++){
        if(normalbn.length > 0){
            var img = `<a href="${normalbn[0].linkWeb}"><img src="${normalbn[0].image}" alt=""></a>`
            bannerhot[i].innerHTML = img;
            normalbn.splice(0,1);
        }
    }
    
}
