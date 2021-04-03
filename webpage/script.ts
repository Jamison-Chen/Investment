const modeBtn = document.getElementById("mode-btn");
const modeList = document.getElementById("mode-list");
function expandModeList(e: Event): void {
    if (modeBtn != null && modeList != null) {
        modeBtn.removeEventListener("click", expandModeList);
        modeBtn.addEventListener("click", foldModeList);
        modeList.style.display = "flex";
    }
}

function foldModeList(e: Event): void {
    if (modeBtn != null && modeList != null) {
        modeBtn.removeEventListener("click", foldModeList);
        modeBtn.addEventListener("click", expandModeList);
        modeList.style.display = "none";
    }
}

if (modeBtn != null) {
    modeBtn.addEventListener("click", expandModeList);
}