import { retriveURL } from './helpers.js';

function handleErr(error) {
    chrome.storage.local.set({ 'error': error.message }, function () {
        window.location.href = chrome.extension.getURL('error.html');
    });
}

function displayResult(url, title) {
    document.getElementById('loadingIndicator').classList.add('hide');
    document.body.classList.add('grey');
    document.body.classList.add('darken-2');
    document.getElementById('resultWrapper').classList.remove('hide');

    document.getElementById('backPage').addEventListener('click', () => history.back());

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

    var dataField = document.querySelector('#dataField');

    var prompt = document.createElement('p');
    prompt.textContent = 'Title: ';
    dataField.appendChild(prompt);

    prompt = document.createElement('p');
    prompt.textContent = title;
    prompt.id = 'title';
    dataField.appendChild(prompt);

    prompt = document.createElement('p');
    prompt.textContent = 'Link: ';
    dataField.appendChild(prompt);

    prompt = document.createElement('p');
    prompt.textContent = url;
    prompt.id = 'link';
    dataField.appendChild(prompt);
}

chrome.storage.local.get(['video_id', 'task'], function (results) {
    if (results['task'] && results['task'] === 'download') {
        retriveURL(results['video_id'], function (url, title) {
            chrome.downloads.download({ url: url, filename: title + '.mp4' });
            chrome.storage.local.set({ 'success': 'Your download will start shortly...' }, function () {
                window.location.href = chrome.extension.getURL('success.html');
            });
        }, handleErr);
    } else {
        retriveURL(results['video_id'], (url, title) =>
        displayResult(url, title), handleErr);
    }
});