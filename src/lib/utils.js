export function q(sel) {
    return document.querySelector(sel);
}


export function qs(sel) {
    return document.querySelectorAll(sel);
}

export function create(tag) {
    return document.createElement(tag);
}

export function recreateDiv(sel) {
    let el = document.querySelector(sel)
    if (el) el.parentElement.removeChild(el)
    el = document.createElement('div')
    el.classList.add(sel)
    el.id = sel
    return el
}

export function recreate(element) {
    var new_element = element.cloneNode(true);
    element.parentNode.replaceChild(new_element, element);
}

function cret(str) {
    return document.createTextNode(str);
}

export function span(str) {
    var oSpan = document.createElement('span');
    oSpan.textContent = str;
    return oSpan;
}

export function div(str) {
    var oDiv = document.createElement('div');
    oDiv.textContent = str;
    return oDiv;
}

export function p(str) {
    var oDiv = document.createElement('p');
    oDiv.textContent = str;
    return oDiv;
}

export function empty(el) {
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}

export function remove(el) {
    el.parentElement.removeChild(el);
}

// function closeAll() {
//     words = null
//     // window.close()
//     ipcRenderer.send('sync', 'window-hide');
// }

export function log() { console.log.apply(console, arguments); }
