export async function getMediasiteCookies(api_response, handleErr) {

    var response = new DOMParser().parseFromString(api_response, 'text/xml');
    var body_fields = response.getElementsByTagName('input');
    var body = new URLSearchParams();
    for (var i = 0; i < body_fields.length; i++) {
        body.append(body_fields[i].getAttribute('name'), body_fields[i].getAttribute('value'));
    }
    var mediasite_id = response.querySelector('input[name="mediasiteid"]').getAttribute('value');
    var url = response.querySelector('form').getAttribute('action');

    var myHeaders = new Headers();
    myHeaders.append("cache-control", "max-age=0");
    myHeaders.append("upgrade-insecure-requests", "1");
    myHeaders.append("origin", "https://l.xmu.edu.my");
    myHeaders.append("Access-Control-Allow-Origin", "*");
    myHeaders.append("content-type", "application/x-www-form-urlencoded");
    myHeaders.append("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36");
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9");
    myHeaders.append("sec-fetch-site", "cross-site");
    myHeaders.append("sec-fetch-mode", "navigate");
    myHeaders.append("sec-fetch-user", "?1");
    myHeaders.append("sec-fetch-dest", "iframe");
    myHeaders.append("accept-language", "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7");
    myHeaders.append("cookie", "MediasiteAuthTickets-2e74ad7bce324824945e410c874a03081d=1898ae8fc83040e488df613464649a3a; MediasiteAuthTickets-a6034152be354f0193006f6178eb00d51d=56d4bcdadbd64ab49420ff835d2d3d2b; ASP.NET_SessionId=z53rj3woyathzlu2ntry3xv0");
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var requestOptions = {
        method: 'POST',
        redirect: 'follow'
    };
    requestOptions.headers = myHeaders;
    requestOptions.body = body;
    response = await fetch(url, requestOptions).then(response => response.text());
    return { name: 'MediasiteAuthTickets-' + mediasite_id, value: /authTicket=([a-z 0-9]+)/.exec(response)[1], domain: /https:\/\/[^\/]+/.exec(url)[0] };
}

export function retriveURL(srcURL, callback, handleErr) {
    chrome.cookies.get({ url: "https://l.xmu.edu.my/", name: "MoodleSession" }, function (cookie) {

        if (cookie === null) handleErr(new Error('Your moodle session is invalid, please refresh to login moodle. '));
        var video_id = /\d+/.exec(srcURL)[0];

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
            .catch(error => handleErr(error));

        function getURL(api_response) {

            getMediasiteCookies(api_response).then(media_cookie => {
                var mediasite_id = /MediasiteAuthTickets-(\S+)/.exec(media_cookie.name)[1];
                var url = media_cookie.domain + "/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions";
                var myHeaders = new Headers();
                myHeaders.append("Connection", "keep-alive");
                myHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
                myHeaders.append("Sec-Fetch-Dest", "empty");
                myHeaders.append("X-Requested-With", "XMLHttpRequest");
                myHeaders.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36");
                myHeaders.append("Content-Type", "application/json; charset=UTF-8");
                myHeaders.append("Sec-Fetch-Site", "same-origin");
                myHeaders.append("Sec-Fetch-Mode", "cors");
                myHeaders.append("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7");
                myHeaders.append("Cookie", media_cookie.name + "=" + media_cookie.value);

                var body = {
                    getPlayerOptionsRequest: {
                        ResourceId: mediasite_id,
                        QueryString: "",
                        UseScreenReader: false,
                        UrlReferrer: media_cookie.domain + '/Mediasite/Play/' + mediasite_id
                    }
                };
                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: JSON.stringify(body),
                    redirect: 'follow'
                };
                fetch(url, requestOptions)
                    .then(response => response.text())
                    .then(result => handleResult(result))
                    .catch(error => handleErr(error));

                function handleResult(result) {
                    result = JSON.parse(result);
                    result = result['d']['Presentation'];
                    if (result === null) throw new Error('Failed to fetch presentation information. Please refresh the video page and try again. ');
                    var video_loc = result['Streams'][0]['VideoUrls'][0];
                    if (typeof video_loc === 'undefined') throw new Error('Failed to fetch video information. Is your presentation actually not a video? This plugin only works with video presentations. ');
                    callback(video_loc['Location'], result['Title']);
                }
            }).catch(error => handleErr(error));
        }
    });
}