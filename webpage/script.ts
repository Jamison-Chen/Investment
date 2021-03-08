// let date = "20210305";
// let sid = "2330";
// const currentURL = window.location.href;
// const date: string | null = currentURL.split("date=")[1].slice(0, 7);
// const sid: string | null = currentURL.split("sid=")[1].split("&")[0];
// const companyName: string | null = currentURL.split("name=")[1];
const body = document.getElementById("body");
const inputDate = document.getElementById("date");
const inputSid = document.getElementById("sid");
const inputCompanyName = document.getElementById("companyName");
const submitBtn = document.getElementById("submit");
let url: string | null;
submitBtn?.addEventListener("click", fetchContent);
window.addEventListener("keydown", fetchContent);
function fetchContent(e: Event): void {
    if ((e instanceof KeyboardEvent && e.keyCode == 13) || e instanceof MouseEvent) {
        if (inputDate instanceof HTMLInputElement && inputSid instanceof HTMLInputElement && inputCompanyName instanceof HTMLInputElement) {
            if (inputDate.value != "" && inputSid.value != "") {
                url = `https://stock-info-scraper.herokuapp.com/singleStockSingleDay?date=${inputDate.value}&sid=${inputSid.value}`;
            } else if (inputDate.value != "" && inputCompanyName.value != "") {
                url = `https://stock-info-scraper.herokuapp.com/singleStockSingleDay?date=${inputDate.value}&name=${inputCompanyName.value}`;
            } else if (inputDate.value == "" && inputSid.value != "") {
                url = `https://stock-info-scraper.herokuapp.com/singleStockSingleDay?sid=${inputSid.value}`;
            } else if (inputDate.value == "" && inputCompanyName.value != "") {
                url = `https://stock-info-scraper.herokuapp.com/singleStockSingleDay?name=${inputCompanyName.value}`;
            } else {
                console.log("Info insufficient.");
            }
        }
        if (url != null) {
            if (body != null) {
                body.innerHTML = "Waiting...";
            }
            fetch(url)
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
        }
    }

}


// TODO
// 後端可以一天只爬一次，csv存起來，因為fetch頗花時間。