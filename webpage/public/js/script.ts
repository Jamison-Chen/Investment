const body = document.getElementById("body");
const header = document.getElementById("header");

if (header != null) {
    let modeBtn = document.createElement("div");
    modeBtn.id = "mode-btn";
    modeBtn.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' \
    width='20' height='20' fill='#888' class='bi bi-grid-3x3-gap-fill' \
    viewBox='0 0 16 16'><path d='M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 \
    0 0 1-1 1H2a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 \
    1H7a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 \
    1-1-1V2zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7zm5 0a1 \
    1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 \
    1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 \
    1 0 0 1-1 1H2a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 \
    0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2z'/></svg>";

    header.appendChild(modeBtn);

    let modeList = document.createElement("div");
    modeList.id = "mode-list";

    let recorderOption = document.createElement("a");
    recorderOption.id = "recorder-option";
    recorderOption.classList.add("mode-option");
    recorderOption.innerText = "Recorder";
    let divideLine = document.createElement("hr");
    divideLine.style.width = "80%";
    divideLine.style.borderTop = "none";
    divideLine.style.margin = "0";
    let simulatorOption = document.createElement("a");
    simulatorOption.id = "simulator-option";
    simulatorOption.classList.add("mode-option");
    simulatorOption.innerText = "Simulator";
    modeList.appendChild(recorderOption);
    modeList.appendChild(divideLine);
    modeList.appendChild(simulatorOption);

    header.appendChild(modeList);
}

const modeBtn = document.getElementById("mode-btn");
const modeList = document.getElementById("mode-list");

function controlModeList(e: Event): void {
    if (modeBtn != null && modeList != null && body != null) {
        if (modeList.style.display == "flex") modeList.style.display = "none";
        else modeList.style.display = "flex";
    }
}

function foldModeList(e: Event): void {
    if (!e.path.includes(modeBtn)) {
        if (modeList != null) modeList.style.display = "none";
    }
}

if (modeBtn != null && body != null) {
    modeBtn.addEventListener("click", controlModeList);
    body.addEventListener("click", foldModeList);
}