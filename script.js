
let container = document.getElementById("container");
home();
async function home() {
    let form = document.getElementById("search-area");
    
    form.classList.add("row", "g-3");

    let input = document.createElement("input");
    input.type = "text";
    input.id = "searchInput";
    input.placeholder = "Search";
    input.classList.add("form-control");

    form.appendChild(input);

    let btn = document.createElement("button");
    btn.type = "button";
    btn.id = "submit";
    btn.innerText = "Search";
    btn.classList.add("btn", "btn-secondary");
    form.appendChild(btn);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    })

    btn.addEventListener("click", () => {
        let inp = document.getElementById("searchInput").value;
        if (inp.length < 2) {
            alert("Please more Detail");
            return;
        }
        show(".placeHolder");
        let searchCoins
        // filter the coins by the search input 
        searchCoins = coins.filter(coin => coin.name.toLowerCase().includes(inp.toLowerCase()) || coin.symbol.toLowerCase().includes(inp.toLowerCase()))
        document.querySelector("#container").innerHTML = " ";
        creatCoins(searchCoins)
    })

    document.querySelector("#container").style.display = "flex";
    let coins = [];

    show(".placeHolder");
    if (coins.length === 0) {
        try {
            coins = await getData('https://api.coingecko.com/api/v3/coins/list')
            creatCoins(coins); return;
        } catch (error) {
            console.log(error);
        }
    }
    else creatCoins(coins);
}

function creatCoins(data) {
    let currentCoins = data.slice(0, 100)
    hide(".placeHolder");
    currentCoins.forEach(coin => {
        let div = document.createElement("div");
        div.classList.add("card", "item");

        let span = document.createElement("span");
        span.innerText = coin.name;
        div.appendChild(span);

        let check_box_container = document.createElement("div");
        check_box_container.classList.add("form-check", "form-switch");

        let check_box = document.createElement("input");
        check_box.classList.add("form-check-input");
        check_box.type = "checkbox";
        check_box.id = coin.id;

        check_box.addEventListener("change", () => fiveCoinsList(input, coin));

        check_box_container.appendChild(check_box);

        div.appendChild(check_box_container);

        let div2 = document.createElement("div");
        div2.innerText = coin.symbol;
        div.appendChild(div2);

        let btn = document.createElement("button");
        btn.className = "btn-primary";
        btn.classList.add("btn");
        btn.innerText = "More Info";
        let div3 = document.createElement("div");
        div3.className = "hide";

        btn.addEventListener("click", async () => {
            if (div3.className !== "hide") {
                div3.classList.add("hide"); return;
            }
            div3.classList.remove("hide")
            if (div3.innerHTML == "") {

                let coinsInfo = getInfo("coinsInfo");
                let info = coinsInfo.find(coinInfo => coinInfo.id == coin.name);
                console.log(info);
                if (info) {
                    if ((new Date().toString().slice(0, 21)) === info.time && new Date().getMinutes() - info.minuts <= 2) {
                        showInfo(info, div3);
                        return;
                    }
                    coinsInfo = coinsInfo.filter(coinInfo => coinInfo.id !== coin.name);
                    saveInfo(coinsInfo, "coinsInfo");
                }
                addInfo(div3, coin.id);
            }
        })
        div.appendChild(btn);
        div.appendChild(div3);
        container.appendChild(div);
    })
    let fiveCoins = getInfo("fiveCoins");
    fiveCoins.forEach(arrCoin => {
        console.log(arrCoin);
        for (const checkCoin of document.getElementsByClassName(arrCoin)) {
            console.log(checkCoin);
            if (checkCoin.className === arrCoin)
                checkCoin.checked = "true";
        }
        console.log(arrCoin);
    })
}

// edit coins's information list
async function addInfo(div, coin) {
    let info;
    try {
        info = await getData(`https://api.coingecko.com/api/v3/coins/${coin}`)
    } catch (error) {
        console.log(error);
    }
    let infoArray = getInfo(`coinsInfo`);
    const information = {
        "time": new Date().toString().slice(0, 21),
        "minuts": new Date().getMinutes(),
        "id": info.id,
        "image": info.image.small,
        "usd": info.market_data.current_price.usd,
        "eur": info.market_data.current_price.eur,
        "ils": info.market_data.current_price.ils
    }
    infoArray.push(information);
    saveInfo(infoArray, `coinsInfo`);
    showInfo(information, div)
}

// show the coin's information on the collapse div
function showInfo(info, div) {
    div.innerHTML = `&euro;${info.eur} &nbsp; &nbsp; &#8362;${info.ils} &nbsp; &nbsp;  &#x24;${info.usd}`
    let img = document.createElement("img")
    img.setAttribute("src", info.image)
    div.appendChild(img);
}

// manage the five coins's list
function fiveCoinsList(input, coin) {
    let fiveCoins = getInfo("fiveCoins");
    console.log(fiveCoins);
    if (document.querySelector("aside").className !== "hide") {
        input.checked = !(input.checked); return;
    }
    if (input.checked == true && fiveCoins.find(arrCoin => arrCoin === coin.name) !== -1) {
        if (fiveCoins.length > 4) {
            input.checked = false;
            showJumpingWindow(fiveCoins, input);
            return;
        }
        fiveCoins.push(coin.name);
        saveInfo(fiveCoins, "fiveCoins");
        return;
    }
    fiveCoins = fiveCoins.filter(arrCoin => arrCoin !== coin.name);
    saveInfo(fiveCoins, "fiveCoins");
}

// showing jumping window and create the coins
function showJumpingWindow(fiveCoins, nextBtn) {
    let section = document.querySelector("aside > section");
    section.innerHTML = " ";
    fiveCoins.forEach(coin => {
        let div = document.createElement("div");
        section.appendChild(div);
        let span = document.createElement("span");
        span.innerHTML = coin;
        div.appendChild(span);
        let btn = document.createElement("button");
        btn.innerText = "remove";
        btn.addEventListener("click", () => {
            nextBtn.checked = "true";
            fiveCoins.push(nextBtn.className);
            fiveCoins = fiveCoins.filter(arrCoin => arrCoin !== coin);
            saveInfo(fiveCoins, "fiveCoins")
            console.log(fiveCoins);
            hide("Aside");
            document.getElementsByClassName(coin)[0].checked = false;
        })
        div.appendChild(btn);
    })
    show("aside")
}

// save the update local storage info
function saveInfo(info, name) {
    localStorage.setItem(name, JSON.stringify(info));
}

// get the available information in local storage
function getInfo(name) {
    return JSON.parse(localStorage.getItem(name) || "[]")
}

// show coin place holder
function show(element) {
    if (!document.querySelector(element)) return
    document.querySelector(element).classList.remove("hide")
}

// hide coin place holder
function hide(element) {
    if (!document.querySelector(element)) return
    document.querySelector(element).classList.add("hide")
}

// returning async data for url
async function getData(url) {
    const response = await fetch(url);
    return await response.json();
}