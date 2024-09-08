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
    checked: false,
    isLogin: async function () {
        var id = getCookie("id");
        var token = getCookie("token");
        if (id != '' && token != '') {
            if (!this.checked) {
                this.checked = true;
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
                return true;
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

const Content = {
    loadNotice: function () {
        if (this.noticeData) {
            $(this.notice).text(this.noticeData.content)
            $(this.noticeTime).text(getTimeAgo(this.noticeData.publishDate))
            return
        }
        Core.Content.getNotice().then(function (res) {
            Content.noticeData = res
            $(Content.notice).text(res.content)
            $(Content.noticeTime).text(getTimeAgo(res.publishDate))
        })
    },
    loadHotTags: async function () {
        var tags = await Core.Content.getHotTags()
        for (var i in tags) {
            if (i < 3) {
                var tagElement = $(`
                    <div class="item">
                        <img class="icon" src="./images/icon/hot-colorful.svg">
                        <div class="container">
                            <div class="name">${tags[i].name}</div>
                            <div class="count">${tags[i].views}次浏览</div>
                        </div>
                    </div>
                `)
            } else {
                var tagElement = $(`
                    <div class="item">
                        <img class="icon" style="display: hidden">
                        <div class="container">
                            <div class="name">${tags[i].name}</div>
                            <div class="count">${tags[i].views}次浏览</div>
                        </div>
                    </div>
                `)
            }
            $("#hot-tags-list").append(tagElement)
        }
    },
    init: function (page) {
        if (page == "home") {
            var noticeElement = $(`
            <div id="notice" class="module">
                <div class="title">公告
                    <span id="notice-time" class="time"></span>
                </div>
                <div id="notice-content" class="content"></div>
            </div>`)
            $("#main-center").append(noticeElement)
            noticeElement.hide().fadeIn(500);
            $("#edit-publish").hide()
            $("#edit-update").hide()
            $("#edit-delete").hide()
            this.notice = $("#notice-content")
            this.noticeTime = $("#notice-time")
            this.loadNotice()
            this.loadHotTags()
        } else if (page == "user") {
            var editElement = $(`
            <div class="module">
                <input type="text" placeholder="标题" id="edit-title" class="input" autocomplete="off">
                <input type="text" placeholder="概述" id="edit-outline" class="input" autocomplete="off">
                <input type="text" placeholder="标签：例如 #标签1 #标签2" id="edit-tags" class="input" autocomplete="off">
                <textarea type="text" placeholder="封面图，请输入图片链接，每行一个，建议1~3个" id="edit-images" class="input" autocomplete="off"></textarea>
                <textarea type="text" placeholder="正文，支持Markdown语法" id="edit-content" class="input" autocomplete="off"></textarea>
            </div>`)
            $("#main-center").append(editElement)
            editElement.hide().fadeIn(500);
            $("#edit-publish").fadeIn(500);
            $("#edit-update").hide()
            $("#edit-delete").hide()
        }
    }
}

Article = {
    list: [],
    removeSortOrder: function () {
        $("#sort-order-default").removeClass("active")
        $("#sort-order-hot").removeClass("active")
        $("#sort-order-time").removeClass("active")
    },
    publishArticle: async function (title, content, tags, outline, images) {
        if (User.isLogin()) {
            var loading = Qmsg.loading("正在发布文章")
            var id = getCookie("id")
            var token = getCookie("token")
            var res = await Core.Article.publishArticle(id, token, title, content, tags, outline, images)
            if (res.code == 0) {
                loading.close()
                Qmsg.success("发布成功")
            } else if (res.code == 1) {
                loading.close()
                Qmsg.error("请等待一分钟后发布")
            }
        } else {
            Qmsg.warning("请先登录")
        }
    },
    updateArticle: async function (id, title, content, tags, outline, images) {
        if (User.isLogin()) {
            var loading = Qmsg.loading("正在更新文章")
            var userID = getCookie("id")
            var token = getCookie("token")
            var res = await Core.Article.editArticle(userID, token, id, title, content, tags, outline, images)
            if (res.code == 0) {
                loading.close()
                Qmsg.success("更新成功")
            } else if (res.code == 1) {
                loading.close()
                Qmsg.error("请等待一分钟后更新")
            }
        } else {
            Qmsg.warning("请先登录")
        }
    },
    deleteArticle: async function (id) {
        if (User.isLogin()) {
            var loading = Qmsg.loading("正在删除文章")
            var userID = getCookie("id")
            var token = getCookie("token")
            var res = await Core.Article.deleteArticle(userID, token, id)
            if (res.code == 0) {
                loading.close()
                Qmsg.success("删除成功")
            }
        } else {
            Qmsg.warning("请先登录")
        }
    },
    clear: function () {
        $("#article-list").empty()
        this.list = []
    },
    modifyLike: function (id) {
        if (User.isLogin()) {
            Core.Article.modifyLike(id, getCookie("id"), getCookie("token")).then(function (res) {
                var article = Article.getArticleModule(id)
                if (res.code == 0) {
                    Qmsg.success("点赞成功")
                    article.find(".likes .count").text(parseInt(article.find(".likes .count").text()) + 1)
                    article.find(".likes img").attr("src", "./images/icon/like-filling.svg")
                } else if (res.code == 1) {
                    Qmsg.success("取消点赞")
                    article.find(".likes .count").text(parseInt(article.find(".likes .count").text()) - 1)
                    article.find(".likes img").attr("src", "./images/icon/like.svg")
                } else {
                    Qmsg.error("点赞失败")
                }
            })
        } else {
            Qmsg.warning("请先登录")
        }
    },
    getContent: async function (id) {
        return Core.Article.getContent(id)
    },
    openArticle: function (id) {
        window.open(`/article.html?id=${id}`)
    },
    getArticles: function (list, id, token) {
        return Core.Article.getArticles(list, id, token)
    },
    getRecommendedArticles: function () {
        return Core.Content.getRecommendedArticles()
    },
    getArticleModule: function (id) {
        return $(`div[articleID=${id}]`)
    },
    addArticle: function (data, ignore) {
        //判断文章是否已经添加
        if (!ignore && this.list[data.id]) {
            return
        }
        this.list[data.id] = data;
        var articleElement = $(`
                <div class="article module" articleid=${data.id}>
                    <img class="edit" src="./images/icon/edit.svg">
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
        $("#article-list").append(articleElement)
        articleElement.hide().fadeIn(500)
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
        if (data.liked) {
            article.find(".likes img").attr("src", "./images/icon/like-filling.svg")
        }
        var page = getUrlParam("page")
        var id = getUrlParam("id")
        if (page == "user" && id == data.authorId) {
            article.find(".edit").show()
        }
    },
    init: async function (page, noSortOrder) {
        if (page == "home") {
            if (!noSortOrder) {
                var sortOrderElement = $(`
                    <div id="sort-order" class="module">
                        <div id="sort-order-default" class="item active">默认</div>
                        <div id="sort-order-hot" class="item">热门</div>
                        <div id="sort-order-time" class="item">时间</div>
                    </div>`)
                $("#main-center").append(sortOrderElement)
                sortOrderElement.hide().fadeIn(500)
                $("#sort-order-default").click(function () {
                    Article.removeSortOrder()
                    $(this).addClass("active")
                })
            }
            $("#sort-order-hot").click(function () {
                Article.removeSortOrder()
                $(this).addClass("active")
            })
            $("#sort-order-time").click(function () {
                Article.removeSortOrder()
                $(this).addClass("active")
            })
            $("#main-center").append(`<div id="article-list"></div>`)
            if (this.list.length > 0) {
                for (let i in this.list) {
                    this.addArticle(this.list[i], true)
                }
                if (this.list.length >= 10) {
                    $("#article-list").append(`<div class="module" id="article-more">加载更多</div>`)
                } else {
                    $("#article-list").append(`<div id="article-empty">到底了（；´д｀）ゞ</div>`)
                }
                return
            }
            var recommendedArticleIDs = await Article.getRecommendedArticles()
            if (await User.isLogin()) {
                var id = getCookie("id")
                var token = getCookie("token")
                var recommendedArticles = await Article.getArticles(recommendedArticleIDs, id, token)
            } else {
                var recommendedArticles = await Article.getArticles(recommendedArticleIDs)
            }
            for (let i in recommendedArticles) {
                recommendedArticles[i].top = true
                this.addArticle(recommendedArticles[i])
            }
            Search.keyword = ""
            Search.sort = "hot"
            Search.reverse = false
            Search.searchArticles()
        } else if (page == "user") {
            if (!noSortOrder) {
                var sortOrderElement = $(`
                    <div id="sort-order" class="module">
                        <div id="sort-order-default" class="item">默认</div>
                        <div id="sort-order-hot" class="item">热门</div>
                        <div id="sort-order-time" class="item active">时间</div>
                    </div>`)
                $("#main-center").append(sortOrderElement)
                sortOrderElement.hide().fadeIn(500)
                $("#sort-order-time").click(function () {
                    Article.removeSortOrder()
                    $(this).addClass("active")
                })
            }
            $("#sort-order-hot").click(function () {
                Article.removeSortOrder()
                $(this).addClass("active")
            })
            $("#sort-order-time").click(function () {
                Article.removeSortOrder()
                $(this).addClass("active")
            })
            $("#main-center").append(`<div id="article-list"></div>`)
            if (await User.isLogin()) {
                Search.keyword = getCookie("id")
                Search.sort = "time"
                Search.reverse = false
                Search.searchArticlesByAuthor()
            }

        }
    }
}

//Article.init("home")

$("#main-center").on("click", "#article-list .article .title", function () {
    //获取当前文章的id
    var id = $(this).parent().attr("articleid")
    Article.openArticle(id)
})

$("#main-center").on("click", "#article-list .article .likes img", function () {
    //获取当前文章的id
    var id = $(this).parent().parent().parent().attr("articleid")
    Article.modifyLike(id)
})

$("#main-center").on("click", "#sort-order .item", function () {
    $("#sort-order .item").removeClass("active")
    $(this).addClass("active")
    Article.clear()
    var page = getUrlParam("page")
    if ($(this).attr("id") == "sort-order-default") {
        Search.page = 1
        Search.sort = "hot"
        Search.reverse = false
        Article.init(page, true)
        return
    } else if ($(this).attr("id") == "sort-order-hot") {
        Search.page = 1
        Search.sort = "hot"
        Search.reverse = false
    } else if ($(this).attr("id") == "sort-order-time") {
        Search.page = 1
        Search.sort = "time"
        Search.reverse = false
    }
    if (page == "home") {
        Search.searchArticles()
    } else if (page == "user") {
        Search.searchArticlesByAuthor()
    }
})

$("#main-center").on("click", ".article .edit", async function () {
    var id = $(this).parent().attr("articleid")
    Article.currentArticleID = id
    var loading = Qmsg.loading("正在加载文章信息...")
    var article = await Article.getContent(id)
    $("#edit-title").val(article.title)
    $("#edit-content").val(article.content)
    console.log(article.outline)
    $("#edit-outline").val(article.outline)
    $("#edit-tags").val("")
    for (let i in article.tags) {
        $("#edit-tags").val($("#edit-tags").val() + "#" + article.tags[i] + " ")
    }
    $("#edit-images").val("")
    for (let i in article.images) {
        $("#edit-images").val($("#edit-images").val() + article.images[i] + "\n")
    }
    loading.close()
    Qmsg.success("文章信息加载成功")
    //$("#edit-update").show()
    //$("#edit-delete").show()
    $("#edit-update").fadeIn(500)
    $("#edit-delete").fadeIn(500)
})

$("#edit-publish").click(function () {
    var title = $("#edit-title").val();
    var content = $("#edit-content").val();
    var outline = $("#edit-outline").val();
    var tags = extractTags($("#edit-tags").val());
    var images = extractImages($("#edit-images").val());
    if (title.length < 5) {
        Qmsg.error("标题长度不能少于5个字符");
        return;
    }
    if (content.length < 10) {
        Qmsg.error("内容长度不能少于10个字符");
        return;
    }
    if (outline.length < 10) {
        Qmsg.error("概述长度不能少于10个字符");
        return;
    }
    Article.publishArticle(title, content, tags, outline, images);
})

$("#edit-update").click(function () {
    var title = $("#edit-title").val();
    var content = $("#edit-content").val();
    var outline = $("#edit-outline").val();
    var tags = extractTags($("#edit-tags").val());
    var images = extractImages($("#edit-images").val());
    if (title.length < 5) {
        Qmsg.error("标题长度不能少于5个字符");
        return;
    }
    if (content.length < 10) {
        Qmsg.error("内容长度不能少于10个字符");
        return;
    }
    if (outline.length < 10) {
        Qmsg.error("概述长度不能少于10个字符");
        return;
    }
    Article.updateArticle(Article.currentArticleID, title, content, tags, outline, images);
})

$("#edit-delete").click(function () {
    Article.deleteArticle(Article.currentArticleID);
})

$("#hot-tags-list").on("click", ".name", function () {
    Search.keyword = $(this).text()
    Search.sort = "hot"
    Search.reverse = false
    Search.page = 1
    Article.clear()
    Search.searchArticlesByTag()
})

const Search = {
    keyword: "",
    page: 1,
    sort: "hot",
    reverse: false,
    loadMore: function (articles) {
        console.log(articles)
        if (articles.length > 0) {
            for (let i in articles) {
                Article.addArticle(articles[i])
            }
            if (articles.length >= 10) {
                $("#article-list").append(`<div class="module" id="article-more">加载更多</div>`)
            } else {
                $("#article-list").append(`<div id="article-empty">到底了（；´д｀）ゞ</div>`)
            }
        } else {
            $("#article-list").append(`<div id="article-empty">到底了（；´д｀）ゞ</div>`)
        }
    },
    searchArticles: async function () {
        var id = getCookie("id");
        var token = getCookie("token");
        var articles
        if (await User.isLogin()) {
            articles = await Core.Search.searchArticles(this.keyword, this.page, this.sort, this.reverse, id, token)
        } else {
            articles = await Core.Search.searchArticles(this.keyword, this.page, this.sort, this.reverse)
        }
        this.loadMore(articles)
    },
    searchArticlesByTag: async function () {
        var id = getCookie("id");
        var token = getCookie("token");
        var articles
        if (await User.isLogin()) {
            articles = await Core.Search.searchArticlesByTag(this.keyword, this.page, this.sort, this.reverse, id, token)
        } else {
            articles = await Core.Search.searchArticlesByTag(this.keyword, this.page, this.sort, this.reverse)
        }
        this.loadMore(articles)
    },
    searchArticlesByAuthor: async function () {
        var id = getCookie("id");
        var token = getCookie("token");
        var articles
        if (await User.isLogin()) {
            articles = await Core.Search.searchArticlesByAuthor(this.keyword, this.page, this.sort, this.reverse, id, token)
        } else {
            articles = await Core.Search.searchArticlesByAuthor(this.keyword, this.page, this.sort, this.reverse)
        }
        this.loadMore(articles)
    }
}

$("#main-center").on("click", "#article-more", function () {
    $(this).remove()
    Search.page++
    Search.searchArticles()
})

const nav = {
    pages: ["home", "user", "admin"],
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
    changeIndicator: async function (item) {
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

        $("#main-center").empty();

        $("#hot-tags").hide();
        $("#hot-tags-list").empty();

        if (item.attr("id") == this.items.home.attr("id")) {
            setUrlParam("page", "home");
            $("#hot-tags").show();
            Content.init("home");
            Article.list = [];
            Article.init("home");
        } else if (item.attr("id") == this.items.user.attr("id")) {
            setUrlParam("page", "user");
            Content.init("user");
            Article.list = [];
            Article.init("user");
            autosize($("textarea"))
        } else if (item.attr("id") == this.items.admin.attr("id")) {
            setUrlParam("page", "admin");
            Content.init("admin");
        }
    },
    init: function () {
        //初始化指示条
        var page = getUrlParam("page")

        if (this.pages.includes(page)) {
            this.changeIndicator(this.items[page]);
        } else {
            this.changeIndicator(this.items.home);
        }

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
                Article.clear();
                var keyword = nav.search.input.val();
                var firstChar = keyword.charAt(0);
                if (firstChar == "#") {
                    keyword = keyword.substring(1);
                    Search.keyword = keyword;
                    Search.searchArticlesByTag()
                } else if (firstChar == "@") {
                    console.log("author")
                    keyword = keyword.substring(1);
                    Search.keyword = keyword;
                    Search.searchArticlesByAuthor()
                } else {
                    Search.keyword = keyword;
                    Search.searchArticles()
                }
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
                    nav.items.admin.css("visibility", "");
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

//提取标签
function extractTags(inputString) {
    const tags = inputString.replace(/^#+|#+$/g, '').split('#');
    return tags.filter(tag => tag !== '');
}

function extractImages(inputString) {
    return inputString.split('\n').filter(image => image !== '');
}

//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return decodeURI(r[2]);
    return null; //返回参数值
}

function updateQueryStringParameter(key, value) {
    var uri = window.location.href
    if (!value) {
        return uri;
    }
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

//设置url中的参数
function setUrlParam(key, value) {
    var newurl = updateQueryStringParameter(key, value)
    //向当前url添加参数，没有历史记录
    window.history.replaceState({
        path: newurl
    }, '', newurl);
}

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