function createLinkBtn(percentage) {
    function addLinkBtn(link) {
        var id = /[0-9]+/.exec(link.querySelector('a').getAttribute('href'))[0];
        var dest_node = link.querySelector('.mod-indent').nextElementSibling;
        var btn = document.createElement('button');
        btn.setAttribute('id', 'MDX-' + id);
        btn.innerText = 'Link';
        btn.classList.add('btn');
        btn.classList.add('btn-secondary');

        if (percentage) {
            if (dest_node.querySelector('.contentafterlink')) {
                btn.style = 'margin-left: 30px;margin-right: 5px';
            } else {
                btn.style = 'margin-right: 5px;';
            }
        } else {
            if (dest_node.querySelector('.contentafterlink')) {
                btn.style = 'margin-left: 30px;margin-right: -25px';
            } else {
                btn.style = 'margin-right: 5px;';
            }
        }

        dest_node.insertBefore(btn, dest_node.firstChild);
    }

    var all_links = document.querySelectorAll('.modtype_mediasite');
    all_links.forEach(addLinkBtn);
    document.querySelector('.course-content').addEventListener('click', function (event) {
        var id = event.target.id;
        if (!id || !/^MDX-(\d+)/.exec(id)) return;
        chrome.runtime.sendMessage({ name: 'getLink', video_id: /^MDX-(\d+)/.exec(id)[1] });
    });
}

function createPercentage(btn) {
    var port = chrome.runtime.connect({ name: "getPercentage" });
    port.onMessage.addListener(function (msg) {
        if (!/\d+.\d+%/.exec(msg.percentage)) return;
        document.querySelector('span#MDXp-' + msg.id).innerText = msg.percentage;
    });

    function addPercentage(link) {
        var id = /[0-9]+/.exec(link.querySelector('a').getAttribute('href'))[0];
        var dest_node = link.querySelector('.mod-indent').nextElementSibling;
        var percentageSpan = document.createElement('span');
        percentageSpan.setAttribute('id', 'MDXp-' + id);
        percentageSpan.innerText = '--.-%';

        if (btn) {
            if (dest_node.querySelector('.contentafterlink')) {
                percentageSpan.style = 'margin-right: -25px';
            } else {
                percentageSpan.style = 'margin-right: 5px;';
            }
        } else {
            if (dest_node.querySelector('.contentafterlink')) {
                percentageSpan.style = 'margin-left: 30px;margin-right: -25px';
            } else {
                percentageSpan.style = 'margin-right: 5px;';
            }
        }
        
        dest_node.insertBefore(percentageSpan, dest_node.firstChild);
        port.postMessage({ video_id: id });
    }

    var all_links = document.querySelectorAll('.modtype_mediasite');
    all_links.forEach(addPercentage);
}

chrome.storage.local.get(['percentage_enabled', 'link_btn_enabled'], function (results) {
    if (results['percentage_enabled']) {
        if (results['link_btn_enabled']) {
            createPercentage(true);
            createLinkBtn(true);
        } else {
            createPercentage(false);
        }
    } else {
        if (results['link_btn_enabled'])
            createLinkBtn(false);
    }
});