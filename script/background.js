function handleErr(error) {
    chrome.storage.local.set({ 'error': error.message }, function () {
        chrome.windows.create({ type: 'popup', url: chrome.extension.getURL('error.html'), width: 420, height: 210 });
        return;
    });
}

chrome.runtime.onInstalled.addListener(function () {

    chrome.contextMenus.create({
        "id": "getDownloadLinkMenu",
        "title": "Get download link",
        "contexts": ["link"]
    });
    chrome.contextMenus.create({
        "id": "directDownloadMenu",
        "title": "Directly donwload",
        "contexts": ["link"]
    });
    chrome.storage.local.set({ 'link_btn_enabled': true });
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        chrome.permissions.request(
            { origins: ['https://l.xmu.edu.my/', 'https://mymedia.xmu.edu.cn/', 'https://xmum.mediasitecloud.jp/'] },
            function (granted) {
                if (granted) {
                    if (request.name == "getLink") {
                        chrome.storage.local.set({ 'video_id': request.video_id }, function () {
                            chrome.windows.create({ type: 'popup', url: chrome.extension.getURL('link.html'), width: 520, height: 300 });
                        });
                    }
                }
            });

    })

chrome.contextMenus.onClicked.addListener(function (triggerInfo) {
    if (!triggerInfo.linkUrl.includes('https://l.xmu.edu.my/mod/mediasite/view.php?id=')) {
        chrome.windows.create({ type: 'popup', url: chrome.extension.getURL('notice.html'), width: 420, height: 230 });
        return;
    }
    var video_id = /id=(\d+)/.exec(triggerInfo.linkUrl)[1];
    chrome.permissions.request(
        { origins: ['https://l.xmu.edu.my/', 'https://mymedia.xmu.edu.cn/', 'https://xmum.mediasitecloud.jp/'] },
        function (granted) {
            if (granted) {
                if (triggerInfo.menuItemId === 'getDownloadLinkMenu') {
                    chrome.storage.local.set({ 'video_id': video_id }, function () {
                        chrome.windows.create({ type: 'popup', url: chrome.extension.getURL('link.html'), width: 520, height: 300 });
                    });
                } else if (triggerInfo.menuItemId === 'directDownloadMenu') {
                }
            }
        });
});
