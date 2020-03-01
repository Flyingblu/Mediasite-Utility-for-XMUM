document.addEventListener('DOMContentLoaded', function () {

    chrome.storage.local.get(['error'], function (results) {
        var dataField = document.querySelector('#dataField');

        prompt = document.createElement('p');
        prompt.textContent = results['error'];
        prompt.id = 'error';
        dataField.appendChild(prompt);
    });

    document.getElementById('backPage').addEventListener('click', () => history.back());

    document.getElementById('copyErr').addEventListener('click', function () {
        var range = document.createRange();
        range.selectNode(document.getElementById('error'));
        window.getSelection().addRange(range);
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
    });
}, false);