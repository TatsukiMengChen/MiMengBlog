if (window.innerWidth < 680) {
    Qmsg.warning("博客暂未适配小屏幕设备，建议使用大屏访问")
}

//----------------------------导航栏

const nav = {
    indicator: $("#nav-left-menu-indicator"),
    menu: $("#nav-left-menu"),
    items: {
        home: $("#nav-left-menu-home"),
        user: $("#nav-left-menu-user")
    },
    search: {
        container: $(".search-container"),
        input: $("#search-input"),
        button: $("#search-button")
    },
    changeIndicator: function (item) {
        // 取消选中其他项
        $(this.items.home).removeClass("active");
        $(this.items.user).removeClass("active");
    
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

        this.search.input.focus(function () {
            console.log(1)
            nav.search.container.addClass("active");
        })

        this.search.input.blur(function () {
            nav.search.container.removeClass("active");
        })

    },
}

nav.init()


