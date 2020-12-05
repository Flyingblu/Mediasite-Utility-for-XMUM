function handleErr(error) {
    chrome.storage.local.set({ 'error': error.message }, function () {
        window.location.href = chrome.extension.getURL('error.html');
    });
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['link_btn_enabled', 'percentage_enabled', 'percentage_autoload_enabled', 'collapse_details_enable', 'right_click_prompt'], function (results) {
        document.getElementById('linkBtnCheckbox').checked = results['link_btn_enabled'];
        document.getElementById('percentageSpanCheckbox').checked = results['percentage_enabled'];
        document.getElementById('collapseDetailsCheckbox').checked = results['collapse_details_enable'];
        document.getElementById('autoloadCheckbox').checked = results['percentage_autoload_enabled'];
        if (results['right_click_prompt']) document.getElementById('rightClickPrompt').classList.remove('hide');
    });

    document.getElementById('fixAuth').addEventListener('click', function () {

        chrome.permissions.request(
            { origins: ['https://xmum.mediasitecloud.jp/', 'https://mymedia.xmu.edu.cn/'] },
            function (granted) {
                if (granted) {

                    chrome.cookies.getAll({ url: "https://xmum.mediasitecloud.jp/" }, function (cookies) {
                        cookies.forEach(function (cookie) {
                            chrome.cookies.remove({ url: "https://xmum.mediasitecloud.jp/", name: cookie.name });
                        });

                        chrome.cookies.getAll({ url: "https://mymedia.xmu.edu.cn/" }, function (cookies) {
                            cookies.forEach(function (cookie) {
                                chrome.cookies.remove({ url: "https://mymedia.xmu.edu.cn/", name: cookie.name });
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
                    });

                } else {
                    alert("Permission is needed to access data on the website!\nPlease try again. ");
                }
            });

    }, false);

    document.getElementById('linkBtnCheckbox').addEventListener('click', function (event) {
        chrome.storage.local.set({ 'link_btn_enabled': event.target.checked });
    }, false);
    document.getElementById('percentageSpanCheckbox').addEventListener('click', function (event) {
        chrome.storage.local.set({ 'percentage_enabled': event.target.checked });
    }, false);
    document.getElementById('collapseDetailsCheckbox').addEventListener('click', function (event) {
        chrome.storage.local.set({ 'collapse_details_enable': event.target.checked });
    }, false);
    document.getElementById('autoloadCheckbox').addEventListener('click', function (event) {
        chrome.storage.local.set({ 'percentage_autoload_enabled': event.target.checked });
    }, false);
    document.getElementById('gotIt').addEventListener('click', function (event) {
        chrome.storage.local.set({ 'right_click_prompt': false });
        document.getElementById('rightClickPrompt').classList.add('hide')
    }, false);
}, false);