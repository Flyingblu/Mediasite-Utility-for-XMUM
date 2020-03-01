import { retriveURL } from './helpers.js';

function handleErr(error) {
    chrome.storage.local.set({ 'error': error.message }, function () {
        window.location.href = chrome.extension.getURL('error.html');
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('getLink').addEventListener('click', function () {

        chrome.permissions.request(
            { origins: ['https://l.xmu.edu.my/', 'https://xmum.mediasitecloud.jp/'] },
            function (granted) {
                if (granted) {
                    document.getElementById('buttonsContainer').classList.add('hide');
                    document.getElementById('loadingIndicator').classList.remove('hide');
                    chrome.tabs.query({ currentWindow: true, active: true }, function (currentTabs) {

                        var url = currentTabs[0].url;
                        if (!url.includes('https://l.xmu.edu.my/mod/mediasite/view.php?id=')) {
                            window.location.href = chrome.extension.getURL('notice.html');
                        }
                        retriveURL(url, (url, title) =>
                            chrome.storage.local.set({ 'url': url, 'title': title }, function () {
                                window.location.href = chrome.extension.getURL('link.html');
                            }), handleErr);
                    });
                } else {
                    handleErr(new Error("Permission is needed to access data on the website!\nPlease try again. "));
                }
            });

    }, false);

    document.getElementById('directDownload').addEventListener('click', function () {

        chrome.permissions.request(
            { origins: ['https://l.xmu.edu.my/', 'https://xmum.mediasitecloud.jp/'] },
            function (granted) {
                if (granted) {
                    document.getElementById('buttonsContainer').classList.add('hide');
                    document.getElementById('loadingIndicator').classList.remove('hide');

                    chrome.tabs.query({ currentWindow: true, active: true }, function (currentTabs) {

                        var url = currentTabs[0].url;
                        if (!url.includes('https://l.xmu.edu.my/mod/mediasite/view.php?id=')) {
                            window.location.href = chrome.extension.getURL('notice.html');
                        }
                        retriveURL(url, function (url, title) {
                            chrome.downloads.download({ url: url, filename: title });
                            chrome.storage.local.set({ 'success': 'Your download will start shortly...' }, function () {
                                window.location.href = chrome.extension.getURL('success.html');
                            });
                        }, handleErr);
                    });

                } else {
                    alert("Permission is needed to access data on the website!\nPlease try again. ");
                }
            });

    }, false);

    document.getElementById('fixAuth').addEventListener('click', function () {

        chrome.permissions.request(
            { origins: ['https://xmum.mediasitecloud.jp/'] },
            function (granted) {
                if (granted) {

                    chrome.cookies.getAll({ url: "https://xmum.mediasitecloud.jp/" }, function (cookies) {
                        cookies.forEach(function (cookie) {
                            chrome.cookies.remove({ url: "https://xmum.mediasitecloud.jp/", name: cookie.name });
                        });

                        chrome.tabs.query({ currentWindow: true, active: true }, function (currentTabs) {

                            var url = currentTabs[0].url;
                            chrome.storage.local.set({ 'success': 'Error fixed' }, function () {
                                window.location.href = chrome.extension.getURL('success.html');
                            });
                            if (!url.includes('https://l.xmu.edu.my/mod/mediasite/view.php?id=')) {
                                return;
                            }
                            chrome.tabs.reload();
                        });
                    });

                } else {
                    alert("Permission is needed to access data on the website!\nPlease try again. ");
                }
            });

    }, false);
}, false);

