function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function initStorage() {
    chrome.storage.local.get(null, function(result) {
        if (!result['src']) chrome.storage.local.set({'src': ""}, null);
    });
}

function addRemover() {
    let adContainers = document.querySelectorAll('.AdContainer');
    for (let i = 0; i < adContainers.length; i++) {
        let ad = adContainers[i];
        ad.remove();
    }
}

function getImageTag() {
    let img = document.querySelector("#userInfo > div > div.profilePicContainer > img");
    if (img.classList.contains("profilePic")) {
        let profile = img.parentNode
        profile.innerHTML = "";
        html = `
            <img
                style="
                    width: 107px;
                    height: 107px;
                    border-top-left-radius: 5px;
                    border-bottom-left-radius: 5px;
                " 
                src="" 
                alt="profile"/>
        `
        profile.insertAdjacentHTML('beforeend', html);
        return getImageTag()
    }
    return img;
}

function imageChange() {
    let img = getImageTag()
    chrome.storage.local.get(null, function(result) {
        img.src = result['src'];
    });
    return 'success';
}

function popupQueries() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log("hello: ", request);
        switch(request.data) {
            case 'save-img': {
                chrome.storage.local.set({'src': request.src}, null);
                
                sendResponse({
                    data: imageChange()
                });
            }
        }
    });
}

async function onSiteLoad(callback, tryCount = 0, maxTryCount = 20) {
    if (tryCount >= maxTryCount) return 'error';
    try {
        console.log("try function: ", callback);
        callback();
        return 'success';
    }
    catch(e) {
        await sleep(100);
        return await onSiteLoad(callback, tryCount + 1);
    }
}

// Create self activating function
(async () => {
    initStorage();
    popupQueries();
    await onSiteLoad(imageChange);
    await onSiteLoad(addRemover);


    var callback = (record) => {
        try {
            console.log('mutation occruded!');
            let imgContainer = document.querySelector("body > div.DialogBox.PlayerInfoPopup.trPopupDialog > div > div > div.dialogContent > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > img")            
            imgContainer.style.display = 'block';
            imgContainer.style.width = '150px';
            imgContainer.style.height = '150px';

            chrome.storage.local.get(null, function(result) {
                imgContainer.src = result['src'];
            });
            return 'success';
        }
        catch(e) {
            return 'error';
        }
    }
      
    var observer = new MutationObserver(callback);
    var config =  {
        characterData: true,
        childList: true
    };
    observer.observe(document.querySelector('body'), config);
})();