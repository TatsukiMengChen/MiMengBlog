window.CocoConfig = {
    buttonColor: '#79BD9A'
}

if (window.innerWidth < 768) {
    Qmsg.warning("博客暂未适配小屏幕设备，建议使用大屏访问")
}

//----------------------------导航栏


const User = {
    info: {
        head: $("#user-info-head"),
        name: $("#user-info-name"),
        vip: $("#user-info-vip")
    },
    isLogin: async function () {
        var id = getCookie("id");
        var token = getCookie("token");
        if (id && token) {
            try {
                const res = await Core.User.validateToken(id, token);
                if (res.code == 0) {
                    return true;
                } else {
                    Qmsg.error("账号登录信息已过期，请重新登录");
                    return false;
                }
            } catch (err) {
                Qmsg.error("账号登录信息已过期，请重新登录");
                return false;
            }
        } else {
            return false;
        }
    },
    isVIP: function () {
        var vipDate = Number(getCookie("vipDate"))
        if (Date.now() < vipDate) {
            return true
        } else {
            return false
        }
    },
    isAdmin: async function () {
        var result = getCookie("admin");
        if (result == "true") {
            return true;
        } else {
            return false;
        }
    },
    getHead: function () {
        var qq = getCookie("qq");
        if (qq) {
            return "https://q1.qlogo.cn/g?b=qq&nk=" + qq + "&s=100";
        } else {
            return "./images/head.png";
        }
    },
    getName: function () {
        return decodeURIComponent(getCookie("name"));
    },
    logout: function () {
        clearAllCookie();
        location.reload();
    },
    loadFollowList: async function () {
        var id = getCookie("id");
        var token = getCookie("token");
        if (id && token) {
            const myFollow = await Core.User.getMyFollow(id, token);
            for (var i in myFollow) {
                var item = myFollow[i];
                var updateText
                if (item.lastUpdateTime) {
                    updateText = getTimeAgo(item.lastUpdateTime) + "更新了文章"
                } else {
                    updateText = "暂无更新"
                }
                $("#follow-list").append(`
                    <div class="people-base">
                        <img class="people-head" src="${item.head}">
                        <div class="container">
                            <div class="people-name">${item.name}</div>
                            <div class="people-update-time">${updateText}</div>
                        </div>
                    </div>`)
            }
        }
    }
}

const nav = {
    indicator: $("#nav-left-menu-indicator"),
    menu: $("#nav-left-menu"),
    items: {
        home: $("#nav-left-menu-home"),
        user: $("#nav-left-menu-user"),
        admin: $("#nav-left-menu-admin"),
    },
    search: {
        container: $(".search-container"),
        form: $("#search-form"),
        input: $("#search-input"),
        button: $("#search-button")
    },
    user: {
        container: $("#nav-right-user"),
        head: $("#nav-right-user-head"),
        name: $("#nav-right-user-name"),
    },
    changeIndicator: function (item) {
        // 取消选中其他项
        $(this.items.home).removeClass("active");
        $(this.items.user).removeClass("active");
        $(this.items.admin).removeClass("active");

        // 计算新项的中心位置
        var itemPosition = $(item).position();
        var itemWidth = $(item).outerWidth(true);
        var itemHeight = $(item).outerHeight(true);
        var itemCenterPosition = itemPosition.left + (itemWidth / 2);

        // 计算指示器的新位置
        var indicatorWidth = this.indicator.outerWidth(true);
        var newPosition = itemCenterPosition - (indicatorWidth / 2);

        // 移动指示器到新位置
        this.indicator.css("left", newPosition);

        // 选中当前项
        $(item).addClass("active");
    },
    init: function () {
        //初始化指示条
        this.changeIndicator(this.items.home);

        this.items.home.click(function () {
            nav.changeIndicator(nav.items.home);
        })

        this.items.user.click(function () {
            nav.changeIndicator(nav.items.user);
        })

        this.items.admin.click(function () {
            nav.changeIndicator(nav.items.admin);
        })

        this.search.input.focus(function () {
            nav.search.container.addClass("active");
        })

        this.search.input.blur(function () {
            nav.search.container.removeClass("active");
        })

        this.search.form.submit(function (e) {
            e.preventDefault();
            nav.search.button.click();
        })

        this.search.button.click(async function () {
            if (await User.isLogin()) {
                var keyword = nav.search.input.val();
            } else {
                Qmsg.warning("请先登录")
            }
        })

        this.user.head.click(async function () {
            if (await User.isLogin()) {
                coco({
                    title: "提示",
                    text: "确定要退出登录吗？",
                    okText: "确定",
                    cancelText: "取消",
                    zIndexOfModal: 2995,
                    zIndexOfMask: 3008,
                    zIndexOfActiveModal: 3020
                }).onClose((isOk, cc, done) => {
                    console.log(cc.closeType);
                    if (isOk) {
                        User.logout()
                    } else {
                        done();
                    }
                });
            } else {
                window.open("/login.html?origin=/", "_self")
            }
        })

        //异步加载用户信息
        User.isLogin().then(function (res) {
            if (res) {
                nav.user.head.attr("src", User.getHead());
                User.info.head.attr("src", User.getHead());
                nav.user.name.text(User.getName());
                User.info.name.text(User.getName());
                if (User.isAdmin()) {
                    nav.items.admin.show();
                }
                if (User.isVIP()) {
                    User.info.vip.attr("src", "./images/icon/VIP-active.svg")
                }
                User.loadFollowList()
            }
        })


    },
}

nav.init()

const Content = {
    notice: $("#notice-content"),
    noticeTIme: $("#notice-time"),
    loadNotice: function () {
        Core.Content.getNotice().then(function (res) {
            $(Content.notice).text(res.content)
            $(Content.noticeTIme).text(getTimeAgo(res.publishDate))
        })
    },
    init: function () {
        this.loadNotice()
    }
}

Content.init()

Article = {
    list: {},
    openArticle: function (id) {
        window.open(`/article.html?id=${id}`)
    },
    getArticles: function (list) {
        return Core.Article.getArticles(list)
    },
    getRecommendedArticles: function () {
        return Core.Content.getRecommendedArticles()
    },
    getArticleModule: function (id) {
        return $(`div[articleID=${id}]`)
    },
    addArticle: function (data) {
        //判断文章是否已经添加
        if (this.list[data.id]) {
            return;
        }
        this.list[data.id] = data;
        $("#article-list").append(`
            <div class="article module" articleid=${data.id}>
                    <div class="author">
                        <img class="people-head" src="${data.head}">
                        <div class="container">
                            <div class="name people-name">${data.name}
                                <img class="vip" src="./images/icon/VIP-active.svg">
                            </div>
                            <div>
                                <span class="time">${getTimeAgo(data.updateDate)}</span>
                                <span class="badge official">官方</span>
                                <span class="badge selected">精选</span>
                                <span class="badge top">置顶</span>
                            </div>
                        </div>
                    </div>
                    <div class="title">${data.title}</div>
                    <div class="tags">
                    </div>
                    <div class="outline">${data.outline}</div>
                    <div class="images">
                        <div class="more"></div>
                    </div>
                    <div class="line"></div>
                    <div class="bottom">
                        <div class="item hot">
                            <img src="./images/icon/hot.svg">
                            <span class="count">${data.views}</span>
                        </div>
                        <div class="item likes">
                            <img src="./images/icon/like.svg">
                            <span class="count">${data.likes}</span>
                        </div>
                        <div class="item comments">
                            <img src="./images/icon/comment.svg">
                            <span class="count">${data.comments}</span>
                        </div>
                        <div class="item stars">
                            <img src="./images/icon/star.svg">
                            <span class="count">${data.stars}</span>
                        </div>
                    </div>
                </div>
            `)
        var article = Article.getArticleModule(data.id)
        if (data.isVIP) {
            article.find(".vip").show()
        }
        if (data.official) {
            article.find(".badge.official").css("display", "inline-block")
        }
        if (data.selected) {
            article.find(".badge.selected").css("display", "inline-block")
        }
        if (data.top) {
            article.find(".badge.top").css("display", "inline-block")
        }
        for (let i = 0; i < data.tags.length; i++) {
            article.find(".tags").append(`<span class="tag">#${data.tags[i]}</span>`)
        }
        for (let i = 0; i < data.images.length && i < 3; i++) {
            article.find(".images").append(`
                <div class="img">
                    <img src="${data.images[i]}">
                </div>`)
        }
        if (data.images.length > 3) {
            article.find(".more").show().text("+" + (data.images.length - 3))
        }
    },
    init: async function () {
        $("#article-list").on("click", ".article .title",function () {
            //获取当前文章的id
            var id = $(this).parent().attr("articleid")
            Article.openArticle(id)
        })

        var recommendedArticleIDs = await Article.getRecommendedArticles()
        var recommendedArticles = await Article.getArticles(recommendedArticleIDs)
        console.log(recommendedArticles)
        for (let i in recommendedArticles) {
            this.addArticle(recommendedArticles[i])
        }
    }
}

Article.init()

function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

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