chrome.storage.local.get(['link_btn_enabled'], function (results) {
    if (!results['link_btn_enabled']) return;

    function add_btn(link) {
        var id = /[0-9]+/.exec(link.querySelector('a').getAttribute('href'))[0];
        var dest_node = link.querySelector('.mod-indent').nextElementSibling;
        var btn = document.createElement('button');
        btn.setAttribute('id', 'MDX-' + id);
        btn.innerText = 'Link';
        btn.classList.add('btn');
        btn.classList.add('btn-secondary');
        if (dest_node.querySelector('.contentafterlink')) {
            btn.style = 'margin-left: 30px;margin-right: -25px';
        } else {
            btn.style = 'margin-right: 5px;';
        }
        dest_node.insertBefore(btn, dest_node.firstChild);
    }

    var all_links = document.querySelectorAll('.modtype_mediasite');
    all_links.forEach(add_btn);
    document.querySelector('.course-content').addEventListener('click', function (event) {
        var id = event.target.id;
        if (!id || !/^MDX-(\d+)/.exec(id)) return;
        chrome.runtime.sendMessage({ name: 'getLink', video_id: /^MDX-(\d+)/.exec(id)[1] });
    });
});