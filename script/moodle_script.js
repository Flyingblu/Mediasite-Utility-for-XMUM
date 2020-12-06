function createLinkBtn() {
    function addLinkBtn(link) {
        var id = /[0-9]+/.exec(link.querySelector('a').getAttribute('href'))[0];
        var dest_node = link.querySelector('.mod-indent').nextElementSibling;
        var btn = document.createElement('button');
        btn.setAttribute('id', 'MDX-' + id);
        btn.innerText = 'Link';
        btn.classList.add('btn');
        btn.classList.add('btn-secondary');
        btn.style = 'margin-right: 5px;';

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

function createPercentage(autoload) {
    var port = chrome.runtime.connect({ name: "getPercentage" });
    port.onMessage.addListener(function (msg) {
        if (msg.error) {
            document.querySelector('span#MDXp-' + msg.id).style.color = 'red';
            return;
        }
        var listItem = document.querySelector('li#module-' + msg.id);
        listItem.querySelector('span#MDXp-' + msg.id).innerText = (msg.viewTimeCount / msg.duration * 100).toFixed(1) + '%';
        var length = ('0' + Math.floor(msg.duration / 60)).slice(-2) + ':' + ('0' + msg.duration % 60).slice(-2);
        var courseTitle = listItem.querySelector('span.instancename').firstChild;
        if (!/\[\d+\:\d+\]/.exec(courseTitle.textContent))
            courseTitle.textContent += ' [' + length + ']';
    });

    function addPercentage(link) {
        var id = /[0-9]+/.exec(link.querySelector('a').getAttribute('href'))[0];
        var dest_node = link.querySelector('.mod-indent').nextElementSibling;
        var percentageSpan = document.createElement('span');
        percentageSpan.setAttribute('id', 'MDXp-' + id);
        percentageSpan.innerText = '--.-%';
        percentageSpan.style = 'margin-right: 5px;';

        dest_node.insertBefore(percentageSpan, dest_node.firstChild);
        if (autoload) port.postMessage({ video_id: id });
    }

    var all_links = document.querySelectorAll('.modtype_mediasite');
    all_links.forEach(addPercentage);
    document.querySelector('.course-content').addEventListener('click', function (event) {
        var id = event.target.id;
        if (!id || !/^MDXp-(\d+)/.exec(id)) return;
        event.target.style.color = '';
        event.target.innerText = '--.-%';
        port.postMessage({ video_id: /^MDXp-(\d+)/.exec(id)[1] });
    });
}

chrome.storage.local.get(['percentage_enabled', 'link_btn_enabled', 'percentage_autoload_enabled', 'collapse_details_enable'], function (results) {

    if (results['percentage_enabled'])
        createPercentage(results['percentage_autoload_enabled']);
    if (results['link_btn_enabled'])
        createLinkBtn();

    if (results['collapse_details_enable'])
        document.querySelectorAll('.contentafterlink').forEach(elem => {
            var parent = elem.parentNode
            parent.removeChild(elem)
            var detailsElement = document.createElement('details')
            detailsElement.appendChild(elem)
            parent.appendChild(detailsElement)
        });
    var b2s = (val) => val ? '1' : '0';
    fetch('https://msext.flyingb.lu/feedback/analyze?type=' + b2s(results['percentage_enabled']) + b2s(results['percentage_autoload_enabled']) + b2s(results['link_btn_enabled']) + b2s(results['collapse_details_enable']))
});