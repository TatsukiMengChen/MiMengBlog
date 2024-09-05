

function getTimeAgo(unixTime) {
    const now = Date.now();
    const diff = now - unixTime;

    if (diff < 60000) {
        return "刚刚";
    } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + "分钟前";
    } else if (diff < 86400000) {
        return Math.floor(diff / 3600000) + "小时前";
    } else if (isSameDay(unixTime, now)) {
        return "今天";
    } else if (isSameDay(unixTime, now - 86400000)) {
        return "昨天";
    } else if (isSameDay(unixTime, now - 2 * 86400000)) {
        return "前天";
    } else {
        const date = new Date(unixTime);
        return date.getFullYear() + "-"
            + (date.getMonth() + 1).toString().padStart(2, '0') + "-"
            + date.getDate().toString().padStart(2, '0');
    }
}

function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

function getURLParams() {


    const searchParams = window.location.search.substring(1).split('&');
    const params = {

    };

    for (const param of searchParams) {


        const [key, value] = param.split('=');
        params[key] = value;
    }

    return params;
}

const urlParams = getURLParams();

if (urlParams.id) {
    var settings = {
        "url": `https://cloud.mimeng.fun/article?act=getContent&id=${urlParams['id']}`,
        "method": "GET",
        "timeout": 0
    }

    $.ajax(settings).done(function (res) {
        console.log(res);
        $('#author-head').attr('src', res.head);
        $('#author-name').text(res.name);
        $('#author-date').text(getTimeAgo(res.updateDate))
        if (res.official) {
            $('#author-name-container').append('<span class="badge badge-official">官方</span>');
        }
        if (res.selected) {
            $('#author-name-container').append('<span class="badge badge-selected">精选</span>');
        }
        Vditor.preview(document.getElementById('content'), res.content,
            {
                cdn: '',
                hljs: {
                    style: 'github',
                    lineNumber: true,
                },
                theme: {
                    current: "ant-design"
                }
            })
    });
}

if (urlParams.account && urlParams.token) {
    var settings = {
        "url": `https://cloud.mimeng.fun/account?act=validateToken&id=${urlParams.account}`,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": `Bearer ${urlParams['token']}`
        }
    }

    $.ajax(settings).done(function (res) {
        if (res.code == 0) {

        } else {

        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.responseJSON.code == 1) {
            Qmsg.error("登录已过期，请重新登录");
            //跳转页面 `https://account.mimeng.fun?origin=${encodeURIComponent(window.location.href)}`
            //location.assign(`https://account.mimeng.fun?origin=${encodeURIComponent(window.location.href)}`);

        } else {
            console.log("错误信息：", textStatus, errorThrown);
            Qmsg.error("请求失败，请稍后再试");
        }
    });
}

