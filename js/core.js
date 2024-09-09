//后端url配置,以/结尾
const CoreURL = "https://api.blog.mimeng.fun/";

const Core = {
    User: {},
    Content: {},
    Article: {},
    Search: {},
}

Core.login = async function (id, password, result) {
    const url = CoreURL + "user";

    // 构建查询字符串
    const queryString = $.param({
        act: "login",
        id: id,
        password: password,
        result: result
    });

    // 将查询字符串添加到 URL
    const fullUrl = `${url}?${queryString}`;

    // 返回一个 Promise
    return new Promise((resolve, reject) => {
        $.ajax({
            url: fullUrl,
            type: "GET",
            dataType: "json",
            success: function (response) {
                resolve(response);
            },
            error: function (xhr, status, error) {
                reject(new Error("Network response was not ok"));
            }
        });
    });
}

Core.register = async function (id, password, qq, name, result) {
    const url = CoreURL + "user";

    // 构建查询字符串
    const queryString = $.param({
        act: "register",
        id: id,
        password: password,
        qq: qq,
        name: name,
        result: result
    });

    // 将查询字符串添加到 URL
    const fullUrl = `${url}?${queryString}`;

    // 返回一个 Promise
    return new Promise((resolve, reject) => {
        $.ajax({
            url: fullUrl,
            type: "GET",
            dataType: "json",
            success: function (response) {
                resolve(response);
            },
            error: function (xhr, status, error) {
                reject(new Error("Network response was not ok"));
            }
        });
    });
}

Core.User.validateToken = async function (id, token) {
    var settings = {
        "url": CoreURL + "user?act=validateToken&id=" + id,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": "Bearer " + token
        },
    };

    return $.ajax(settings)
}

Core.User.getMyFollow = async function (id, token) {
    var settings = {
        "url": CoreURL + "user?act=getMyFollow&id=" + id,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": "Bearer " + token
        },
    };

    return $.ajax(settings)

}

Core.Content.getNotice = async function () {
    var settings = {
        "url": CoreURL + "content?act=getNotice",
        "method": "GET",
        "timeout": 0,
    };

    return $.ajax(settings)
}

Core.Content.getRecommendedArticles = async function () {
    var settings = {
        "url": CoreURL + "content?act=getRecommendedArticles",
        "method": "GET",
        "timeout": 0,
    }

    return $.ajax(settings)
}

Core.Content.getHotTags = async function () {
    var settings = {
        "url": CoreURL + "content?act=getHotTags",
        "method": "GET",
        "timeout": 0,
    };

    return $.ajax(settings)
}

Core.Article.getContent = async function (id, userID, token) {
    if (userID && token) {
        var settings = {
            "url": CoreURL + "article?act=getContent&id=" + id + "&userID=" + userID,
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Authorization": "Bearer " + token
            },
        }
    } else {
        var settings = {
            "url": CoreURL + "article?act=getContent&id=" + id,
            "method": "GET",
            "timeout": 0,
        }
    }

    return $.ajax(settings)
}

Core.Article.getArticles = async function (list, userID, token) {
    if (typeof list == "object") {
        var ids = JSON.stringify(list)
    } else {
        var ids = list
    }
    if (userID && token) {
        var settings = {
            "url": CoreURL + "article?act=getArticles&list=" + ids + "&userID=" + userID,
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Authorization": "Bearer " + token
            },
        }
    } else {
        var settings = {
            "url": CoreURL + "article?act=getArticles&list=" + ids,
            "method": "GET",
            "timeout": 0,
        }
    }

    return $.ajax(settings)
}

Core.Article.modifyLike = async function (id, userID, token) {
    var settings = {
        "url": CoreURL + "article?act=modifyLike&id=" + id + "&userID=" + userID,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": "Bearer " + token
        },
    };

    return $.ajax(settings)
}

Core.Article.publishArticle = async function (id, token, title, content, tags, outline, images) {
    var settings = {
        "url": CoreURL + "article?act=publishArticle&id=" + id + "&title=" + encodeURIComponent(title) + "&content=" + encodeURIComponent(content) + "&tags=" + JSON.stringify(tags) + "&outline=" + encodeURIComponent(outline) + "&images=" + JSON.stringify(images),
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": "Bearer " + token
        }
    };

    return $.ajax(settings)
}

Core.Article.editArticle = async function (userID, token, id, title, content, tags, outline, images) {
    var settings = {
        "url": CoreURL + "article?act=editArticle&userID=" + userID + "&id=" + id + "&title=" + encodeURIComponent(title) + "&content=" + encodeURIComponent(content) + "&tags=" + JSON.stringify(tags) + "&outline=" + encodeURIComponent(outline) + "&images=" + JSON.stringify(images),
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": "Bearer " + token
        }
    }

    return $.ajax(settings)
}

Core.Article.deleteArticle = async function (userID, token, id) {
    var settings = {
        "url": CoreURL + "article?act=deleteArticle&userID=" + userID + "&id=" + id,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": "Bearer " + token
        }
    };

    return $.ajax(settings)
    
}

Core.Search.searchArticles = async function (keyword, page, sort, reverse, id, token) {
    if (id && token) {
        var settings = {
            "url": CoreURL + "search?act=searchArticles&keyword=" + keyword + "&page=" + page + "&sort=" + sort + "&reverse=" + reverse + "&id=" + id,
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Authorization": "Bearer " + token
            },
        }
    } else {
        var settings = {
            "url": CoreURL + "search?act=searchArticles&keyword=" + keyword + "&page=" + page + "&sort=" + sort + "&reverse=" + reverse,
            "method": "GET",
            "timeout": 0,
        };
    }

    return $.ajax(settings)
}

Core.Search.searchArticlesByTag = async function (keyword, page, sort, reverse, id, token) {
    if (id && token) {
        var settings = {
            "url": CoreURL + "search?act=searchArticlesByTag&keyword=" + keyword + "&page=" + page + "&sort=" + sort + "&reverse=" + reverse + "&id=" + id,
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Authorization": "Bearer " + token
            },
        }
    } else {
        var settings = {
            "url": CoreURL + "search?act=searchArticlesByTag&keyword=" + keyword + "&page=" + page + "&sort=" + sort + "&reverse=" + reverse,
            "method": "GET",
            "timeout": 0,
        };
    }

    return $.ajax(settings)
}

Core.Search.searchArticlesByAuthor = async function (keyword, page, sort, reverse, id, token) {
    if (id && token) {
        var settings = {
            "url": CoreURL + "search?act=searchArticlesByAuthor&keyword=" + keyword + "&page=" + page + "&sort=" + sort + "&reverse=" + reverse + "&id=" + id,
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Authorization": "Bearer " + token
            },
        }
    }
    else {
        var settings = {
            "url": CoreURL + "search?act=searchArticlesByAuthor&keyword=" + keyword + "&page=" + page + "&sort=" + sort + "&reverse=" + reverse,
            "method": "GET",
            "timeout": 0,
        }
    }

    return $.ajax(settings)
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function clearAllCookie() {
    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
    if (keys) {
        for (var i = keys.length; i--;) {
            document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
        }
    }
}