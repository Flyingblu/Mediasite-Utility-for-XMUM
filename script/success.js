document.addEventListener('DOMContentLoaded', function () {

    chrome.storage.local.get(['success'], function (results) {
        var ui_title = document.getElementById('title');
        ui_title.textContent = results['success'];
    });

    document.getElementById('backPage').addEventListener('click', () => history.back());
}, false);