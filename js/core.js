//后端url配置,以/结尾
const CoreURL = "http://localhost:3000/";

const Core = {}

Core.login = async function (id, password, result) {
    const url = CoreURL + "account";

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

Core.register = async function Register(id, password, qq, name, result) {
    const url = CoreURL + "account";

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