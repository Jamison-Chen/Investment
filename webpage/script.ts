const body = document.getElementById("body");
const inputDate = document.getElementById("date");
const inputSid = document.getElementById("sid");
const inputCompanyName = document.getElementById("companyName");
const queryBtn = document.getElementById("query-btn");
const allRecordFormInputs = document.getElementsByClassName("record-form-input")
const submitBtn = document.getElementById("submit-btn");
let url: string | null;

queryBtn?.addEventListener("click", fetchContent);
submitBtn?.addEventListener("click", recordsCRUD)
window.addEventListener("keydown", recordsCRUD);

function fetchContent(e: Event): void {
    if ((e instanceof KeyboardEvent && e.keyCode == 13) || e instanceof MouseEvent) {
        if (inputDate instanceof HTMLInputElement && inputSid instanceof HTMLInputElement && inputCompanyName instanceof HTMLInputElement) {
            if (inputDate.value != "" && inputSid.value != "") {
                // localhost api test
                url = `http://127.0.0.1:5000/singleStockSingleDay?date=${inputDate.value}&sid=${inputSid.value}`
                // remote api test
                // url = `https://stock-info-scraper.herokuapp.com/singleStockSingleDay?date=${inputDate.value}&sid=${inputSid.value}`;
            } else if (inputDate.value != "" && inputCompanyName.value != "") {
                // localhost api test
                url = `http://127.0.0.1:5000/singleStockSingleDay?date=${inputDate.value}&name=${inputCompanyName.value}`
                // remote api test
                // url = `https://stock-info-scraper.herokuapp.com/singleStockSingleDay?date=${inputDate.value}&name=${inputCompanyName.value}`;
            } else if (inputDate.value == "" && inputSid.value != "") {
                // localhost api test
                url = `http://127.0.0.1:5000/singleStockSingleDay?sid=${inputSid.value}`
                // remote api test
                // url = `https://stock-info-scraper.herokuapp.com/singleStockSingleDay?sid=${inputSid.value}`;
            } else if (inputDate.value == "" && inputCompanyName.value != "") {
                // localhost api test
                url = `http://127.0.0.1:5000/singleStockSingleDay?name=${inputCompanyName.value}`
                // remote api test
                // url = `https://stock-info-scraper.herokuapp.com/singleStockSingleDay?name=${inputCompanyName.value}`;
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

function recordsCRUD(e: Event): void {
    if ((e instanceof KeyboardEvent && e.keyCode == 13) || e instanceof MouseEvent) {
        let data = new URLSearchParams();
        for (let each of allRecordFormInputs) {
            if (each instanceof HTMLInputElement) {
                data.append(each.name, each.value);
            }
        }
        fetch("http://127.0.0.1:5000/records", { method: 'post', body: data });
    }
}