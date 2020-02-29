document.addEventListener('DOMContentLoaded', function () {

    chrome.storage.local.get(['url', 'title'], function (results) {
        var dataField = document.querySelector('#dataField');

        var prompt = document.createElement('p');
        prompt.textContent = 'Title: ';
        dataField.appendChild(prompt);

        prompt = document.createElement('p');
        prompt.textContent = results['title'];
        prompt.id = 'title';
        dataField.appendChild(prompt);

        prompt = document.createElement('p');
        prompt.textContent = 'Link: ';
        dataField.appendChild(prompt);

        prompt = document.createElement('p');
        prompt.textContent = results['url'];
        prompt.id = 'link';
        dataField.appendChild(prompt);
    });

    document.getElementById('closePage').addEventListener('click', () => window.close());

    document.getElementById('copyTitle').addEventListener('click', function () {
        var range = document.createRange();
        range.selectNode(document.getElementById('title'));
        window.getSelection().addRange(range);
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
    });

    document.getElementById('copyLink').addEventListener('click', function () {
        var range = document.createRange();
        range.selectNode(document.getElementById('link'));
        window.getSelection().addRange(range);
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
    });
}, false);