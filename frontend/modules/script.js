"use strict";
const modeBtn = document.getElementById("mode-btn");
const modeList = document.getElementById("mode-list");
const header = document.getElementById("header");
const body = document.getElementById("body");
function controlModeList(e) {
    if (modeBtn != null && modeList != null && body != null) {
        if (modeList.style.display == "flex") {
            modeList.style.display = "none";
        }
        else {
            modeList.style.display = "flex";
        }
    }
}
function foldModeList(e) {
    if (!e.path.includes(modeBtn)) {
        if (modeList != null) {
            modeList.style.display = "none";
        }
    }
}
if (modeBtn != null && body != null) {
    modeBtn.addEventListener("click", controlModeList);
    body.addEventListener("click", foldModeList);
}
