initGeetest4({
    captchaId: '9b22d31aedbba68fee79cdd8438521a1'
}, function (captcha) {
    // captcha为验证码实例
    Captcha = captcha
    captcha.appendTo("#captcha");// 调用appendTo将验证码插入到页的某一个元素中，这个元素用户可以自定义
});

function parseParams(url) {
    // 创建一个URL对象
    let urlObj = new URL(url);

    // 使用URL对象的search属性来获取查询参数
    let query = urlObj.search;

    let params = new URLSearchParams(query);
    let result = {};
    for (let param of params) {
        let [key, value] = param;
        result[key] = value;
    }
    return result;
}

const Params = parseParams(window.location.href)

if (Params.origin) {
    $("#login-register").attr("href", "./register.html?origin=" + encodeURIComponent(Params.origin))
}

const hostname = window.location.hostname;

// 判断是否为 IP 地址
const isIP = () => {
    const ipRegex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    return ipRegex.test(hostname);
};

// 获取顶级域名
function getTopLevelDomain() {
    if (isIP()) {
        return hostname;
    } else {
        const domainParts = hostname.split('.');
        return domainParts.slice(-2).join('.');
    }
};

function setCookie(name, value, days) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    const topLevelDomain = getTopLevelDomain();
    let cookieValue = encodeURIComponent(name) + "=" + encodeURIComponent(value) + "; expires=" + expirationDate.toUTCString() + "; path=/; domain=" + topLevelDomain;
    document.cookie = cookieValue;
}

function setCookiesForJson(json, days) {
    // 检查 json 是否为 null 或 undefined
    if (json === null || json === undefined) {
        console.error('setCookiesForJson was called with null or undefined json');
        return;
    }

    // 现在可以安全地对 json 使用 Object.keys
    Object.keys(json).forEach(function (key) {
        const value = json[key];

        if (typeof value === 'object' && value !== null) { // 确保 value 也不是 null
            // 如果属性值是对象（且不是 null），则递归调用 setCookiesForJson 函数
            setCookiesForJson(value, days);
        } else {
            // 否则，对当前属性执行 setCookie 函数
            setCookie(key, value, days);
        }
    });
}

async function sha256HashWithSalt(password, salt) {
    let data = new TextEncoder().encode(password + salt)
    var hashHex = "";
    for (let i = 0; i < 5000; i++) {
        let hashBuffer = await crypto.subtle.digest('SHA-256', data);
        let hashArray = Array.from(new Uint8Array(hashBuffer));
        hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        data = new TextEncoder().encode(hashHex + salt)
    }
    return hashHex;
}

function isValidID(id) {
    // 验证账号是否由数字、字母和下划线组成，长度为6~20位
    const regex = /^\w{6,20}$/;
    return regex.test(id);
}

function isValidPassword(password) {
    // 验证密码长度为8~20位
    return password.length >= 8 && password.length <= 20;
}

function isValidQQ(qq) {
    // 验证QQ号是否为纯数字，长度为5~10位
    const regex = /^\d{5,10}$/;
    return regex.test(qq);
}

$("#login-button").click(async function (e) {
    e.preventDefault();
    var result = Captcha.getValidate()
    if (!result) {
        Qmsg.warning('请完成验证')
        return;
    }
    result.captcha_id = "9b22d31aedbba68fee79cdd8438521a1"
    //数据校验
    var id = $("#login-id").val()
    var password = $("#login-password").val()
    if (!isValidID(id)) { // 验证账户
        $("#login-id").removeClass("input-primary")
        $("#login-id").addClass("is-danger")
        $("#login-id").parent().children(".help").css("display", "")
        return
    }
    $("#login-id").removeClass("is-danger")
    $("#login-id").addClass("input-primary")
    $("#login-id").parent().children(".help").css("display", "none")
    if (!isValidPassword(password)) { // 验证密码
        $("#login-password").removeClass("input-primary")
        $("#login-password").addClass("is-danger")
        $("#login-password").parent().children(".help").css("display", "")
        return
    }
    $("#login-password").removeClass("is-danger")
    $("#login-password").addClass("input-primary")
    $("#login-password").parent().children(".help").css("display", "none")
    if (!$("#login-check").prop("checked")) { // 验证是否同意协议
        $("#login-check").parent().parent().children(".help").css("display", "")
        return
    }
    $("#login-check").parent().parent().children(".help").css("display", "none")
    //尝试登录
    $(this).addClass("is-loading")
    var logining = Qmsg.loading("正在登录账号")
    var hashHex = await sha256HashWithSalt(password, "mimeng")
    await Core.login(id, hashHex, result)
        .then((data) => {
            setCookiesForJson(data)
            if (Params.origin) {
                Qmsg.success("登录成功，正在跳转...")
                window.open(Params.origin, "_self")
            } else {
                Qmsg.success("登录成功")
            }
        })
        .catch((error) => {
            console.log(error)
            Captcha.reset();
            Qmsg.error("账号或密码错误")
            $(this).removeClass("is-loading")
        })
        .finally(() => {
            logining.close()
        })
})