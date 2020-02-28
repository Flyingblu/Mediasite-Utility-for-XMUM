function retriveURL() {
    chrome.cookies.get({ url: "https://l.xmu.edu.my/", name: "MoodleSession" }, function (cookie) {

        chrome.tabs.query({ currentWindow: true, active: true }, function (currentTabs) {

            var url = currentTabs[0].url;
            if (!url.includes('https://l.xmu.edu.my/mod/mediasite/view.php?id=')) {
                alert("Please use this function on a moodle media page! ");
                return;
            }
            var video_id = /\d+/.exec(url)[0];

            var myHeaders = new Headers();
            myHeaders.append("authority", "l.xmu.edu.my");
            myHeaders.append("upgrade-insecure-requests", "1");
            myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36");
            myHeaders.append("sec-fetch-dest", "iframe");
            myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9");
            myHeaders.append("sec-fetch-site", "same-origin");
            myHeaders.append("sec-fetch-mode", "navigate");
            myHeaders.append("accept-language", "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7");
            myHeaders.append("cookie", cookie.name + '=' + cookie.value);

            var requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            };

            fetch("https://l.xmu.edu.my/mod/mediasite/content_launch.php?id=" + video_id + "&a=0&frameset&inpopup=0", requestOptions)
                .then(response => response.text())
                .then(result => getURL(result))
                .catch(function (error) { alert("An error occurred: \n" + error); return; });

            function getURL(api_response) {
                var response = document.createElement('html');
                response.innerHTML = api_response;
                var id = response.querySelector('input[name="mediasiteid"]').value;

                chrome.cookies.getAll({ url: "https://xmum.mediasitecloud.jp/" }, function (cookies) {
                    var media_cookie;
                    for (var i = 0; i < cookies.length; i++) {
                        if (cookies[i].name.includes("MediasiteAuthTickets-")) {
                            media_cookie = cookies[i];
                            break;
                        }
                    }

                    var myHeaders = new Headers();
                    myHeaders.append("Connection", "keep-alive");
                    myHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
                    myHeaders.append("Sec-Fetch-Dest", "empty");
                    myHeaders.append("X-Requested-With", "XMLHttpRequest");
                    myHeaders.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36");
                    myHeaders.append("Content-Type", "application/json; charset=UTF-8");
                    myHeaders.append("Origin", "https://xmum.mediasitecloud.jp");
                    myHeaders.append("Sec-Fetch-Site", "same-origin");
                    myHeaders.append("Sec-Fetch-Mode", "cors");
                    myHeaders.append("Referer", "https://xmum.mediasitecloud.jp/Mediasite/Play/" + id);
                    myHeaders.append("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7");
                    myHeaders.append("Cookie", media_cookie.name + "=" + media_cookie.value);

                    var raw = "{\n    \"getPlayerOptionsRequest\": {\n        \"ResourceId\": \"" + id + "\",\n        \"QueryString\": \"\",\n        \"UseScreenReader\": false,\n        \"UrlReferrer\": \"https://xmum.mediasitecloud.jp/Mediasite/Play/" + id + "\"\n    }\n}";

                    var requestOptions = {
                        method: 'POST',
                        headers: myHeaders,
                        body: raw,
                        redirect: 'follow'
                    };

                    fetch("https://xmum.mediasitecloud.jp/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions", requestOptions)
                        .then(response => response.text())
                        .then(result => handleResult(result))
                        .catch(function (error) { alert("An error occurred: \n" + error); return; });

                    function handleResult(result) {
                        alert(JSON.parse(result)['d']['Presentation']['Streams'][0]['VideoUrls'][0]['Location']);
                    }

                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('getLink').addEventListener('click', function () {

        chrome.permissions.request(
            { origins: ['https://l.xmu.edu.my/'] },
            function (granted) {
                if (granted) {
                    chrome.permissions.request(
                        { origins: ['https://xmum.mediasitecloud.jp/'] },
                        function (granted) {
                            if (granted) {
                                retriveURL();
                            } else {
                                alert("Permission is needed to access data on the website!\nPlease try again. ");
                            }
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
                    })

                } else {
                    alert("Permission is needed to access data on the website!\nPlease try again. ");
                }
            });

    }, false);
}, false);

