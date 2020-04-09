import { retriveURL } from './helpers.js';

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

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.name == "getLink") {
                chrome.permissions.request(
                    { origins: ['https://l.xmu.edu.my/', 'https://mymedia.xmu.edu.cn/', 'https://xmum.mediasitecloud.jp/'] },
                    function (granted) {
                        if (granted) {
                            retriveURL(request.moodle_id, (url, title) =>
                                chrome.storage.local.set({ 'url': url, 'title': title }, function () {
                                    chrome.windows.create({ type: 'popup', url: chrome.extension.getURL('link.html'), width: 520, height: 300 });
                                }), handleErr);
                        }
                    });
            }
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
                        retriveURL(video_id, (url, title) =>
                            chrome.storage.local.set({ 'url': url, 'title': title }, function () {
                                chrome.windows.create({ type: 'popup', url: chrome.extension.getURL('link.html'), width: 520, height: 300 });
                            }), handleErr);
                    } else if (triggerInfo.menuItemId === 'directDownloadMenu') {
                        retriveURL(video_id, function (url, title) {
                            chrome.downloads.download({ url: url, filename: title });
                            chrome.storage.local.set({ 'success': 'Your download will start shortly...' }, function () {
                                chrome.windows.create({ type: 'popup', url: chrome.extension.getURL('success.html'), width: 420, height: 210 });
                            });
                        }, handleErr);
                    }
                }
            });
    });
});