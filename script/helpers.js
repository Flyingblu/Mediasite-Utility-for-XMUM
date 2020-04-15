async function getMediasiteCookies(api_response) {

    var response = new DOMParser().parseFromString(api_response, 'text/xml');
    var body_fields = response.getElementsByTagName('input');
    var body = new URLSearchParams();
    for (var i = 0; i < body_fields.length; i++) {
        body.append(body_fields[i].getAttribute('name'), body_fields[i].getAttribute('value'));
    }
    var mediasite_id = response.querySelector('input[name="mediasiteid"]').getAttribute('value');
    var url = response.querySelector('form').getAttribute('action');

    var myHeaders = new Headers();
    myHeaders.append("content-type", "application/x-www-form-urlencoded");
    var requestOptions = {
        method: 'POST',
        redirect: 'follow'
    };
    requestOptions.headers = myHeaders;
    requestOptions.body = body;
    response = await fetch(url, requestOptions).then(response => response.text());
    return { name: 'MediasiteAuthTickets-' + mediasite_id, value: /authTicket=([a-z 0-9]+)/.exec(response)[1], domain: /https:\/\/[^\/]+/.exec(url)[0] };
}

async function getPlayerOptions(video_id) {
    return new Promise(callback);
    function callback(resolve, reject) {
        chrome.cookies.get({ url: "https://l.xmu.edu.my/", name: "MoodleSession" }, function (cookie) {

            if (cookie === null) handleErr(new Error('Your moodle session is invalid, please refresh to login moodle. '));

            var myHeaders = new Headers();
            myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9");

            var requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            };

            fetch("https://l.xmu.edu.my/mod/mediasite/content_launch.php?id=" + video_id + "&a=0&frameset&inpopup=0", requestOptions)
                .then(response => response.text())
                .then(result => getURL(result))
                .catch(error => reject(error));

            function getURL(api_response) {

                getMediasiteCookies(api_response).then(media_cookie => chrome.cookies.set({ url: media_cookie.domain, name: media_cookie.name, value: media_cookie.value }, function () {
                    var mediasite_id = /MediasiteAuthTickets-(\S+)/.exec(media_cookie.name)[1];
                    var url = media_cookie.domain + "/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions";
                    var myHeaders = new Headers();
                    myHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
                    myHeaders.append("Content-Type", "application/json; charset=UTF-8");

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
                        .then(result => resolve(result))
                        .catch(error => reject(error));
                }));
            }
        });
    }
}

export function retriveURL(video_id, callback, handleErr) {
    getPlayerOptions(video_id)
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
}

export function reportMediaView(video_id, callback, handleErr) {
    getPlayerOptions(video_id)
        .then(result => handleResult(result))
        .catch(error => handleErr(error));

    function handleResult(result) {
        result = JSON.parse(result);
        var presentation = result['d']['Presentation']
        var ticket = presentation['PlaybackTicketId'];
        var duration = Math.floor(presentation['Duration'] / 1000).toString();
        var domain = 'mymedia.xmu.edu.cn';

        var myHeaders = new Headers();
        myHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
        myHeaders.append("Content-Type", "application/json; charset=UTF-8");

        var raw = "{\n    \"playbackTicket\": \"" + ticket + "\",\n    \"segments\": [\n        {\n            \"StartTime\": 0,\n            \"Duration\": " + duration + "\n        }    ],\n    \"bookmarkPosition\": " + duration + "\n}";
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        fetch('https://' + domain + "/Mediasite/PlayerService/PlayerService.svc/json/ReportMediaView", requestOptions)
            .then(function (response) {
                if (response.status !== 200) throw new Error('Report failed: The response status code was' + response.status);
                response.text().then(function (result) {
                    result = JSON.parse(result);
                    if (result['d'] !== null || typeof result['FaultType'] !== 'undefined') throw new Error('Report failed: Bad response body');
                    callback();
                });
            })
            .catch(error => handleErr(error));
    }
}

export function getViewPercentage(video_id, callback, handleErr) {
    getPlayerOptions(video_id)
        .then(result => handleResult(result))
        .catch(error => handleErr(error));
    
    function handleResult(result) {
        result = JSON.parse(result);
        var coverage = result['d']['CoverageEvents'];
        var duration = Math.floor(result['d']['Presentation']['Duration'] / 1000).toString();
        var viewTimeCount = 0.0;
        coverage.forEach(function (item) {
            viewTimeCount += item['Duration'];
        });
        var result = {
            duration: duration, 
            viewTimeCount: viewTimeCount
        }
        callback(result);
    }
}
