"use strict";
let date = "20210305";
let sid = "2330";
const body = document.getElementById("body");
fetch(`https://stock-info-scraper.herokuapp.com/singleStockSingleDay?date=${date}&sid=${sid}`)
    .then(function (response) {
    return response.json();
})
    .then(function (myJson) {
    if (body != null) {
        body.innerHTML = "";
        for (let each in myJson) {
            let d = document.createElement("div");
            d.innerHTML = `${each}: ${myJson[each]}`;
            body.appendChild(d);
        }
    }
});
// TODO
// 後端可以一天只爬一次，csv存起來，因為fetch頗花時間。
