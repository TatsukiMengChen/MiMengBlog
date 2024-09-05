initGeetest4({
  captchaId: '91e6939a92f9a29ea956bde72818d86a'
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
  $("#register-login").attr("href", "./?origin=" + encodeURIComponent(Params.origin))
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

function isValidName(name) {
  const regex = /^[\u4e00-\u9fa5\w]{1,20}$/;
  return regex.test(name);
}

$("#register-button").click(async function (e) {
  e.preventDefault();
  var result = Captcha.getValidate()
  if (!result) {
    Qmsg.warning('请完成验证')
    return;
  }
  result.captcha_id = "91e6939a92f9a29ea956bde72818d86a"
  //数据校验
  var name = $("#register-name").val()
  var qq = $("#register-qq").val()
  var id = $("#register-id").val()
  var password = $("#register-password").val()
  var twicePassword = $("#register-password-twice").val()
  if (!isValidName(name)) { // 验证用户名
    $("#register-name").removeClass("input-primary")
    $("#register-name").addClass("is-danger")
    $("#register-name").parent().children(".help").css("display", "")
    return
  }

  $("#register-name").removeClass("is-danger")
  $("#register-name").addClass("input-primary")
  $("#register-name").parent().children(".help").css("display", "none")
  if (!isValidQQ(qq)) { // 验证QQ
    $("#register-qq").removeClass("input-primary")
    $("#register-qq").addClass("is-danger")
    $("#register-qq").parent().children(".help").css("display", "")
    return
  }
  $("#register-qq").removeClass("is-danger")
  $("#register-qq").addClass("input-primary")
  $("#register-qq").parent().children(".help").css("display", "none")

  if (!isValidID(id)) { // 验证账户
    $("#register-id").removeClass("input-primary")
    $("#register-id").addClass("is-danger")
    $("#register-id").parent().children(".help").css("display", "")
    return
  }
  $("#register-id").removeClass("is-danger")
  $("#register-id").addClass("input-primary")
  $("#register-id").parent().children(".help").css("display", "none")
  if (!isValidPassword(password)) { // 验证密码
    $("#register-password").removeClass("input-primary")
    $("#register-password").addClass("is-danger")
    $("#register-password").parent().children(".help").css("display", "")
    return
  }
  $("#register-password").removeClass("is-danger")
  $("#register-password").addClass("input-primary")
  $("#register-password").parent().children(".help").css("display", "none")
  if (twicePassword != password) { // 验证二次密码
    $("#register-password-twice").removeClass("input-primary")
    $("#register-password-twice").addClass("is-danger")
    $("#register-password-twice").parent().children(".help").css("display", "")
    return
  }
  $("#register-password-twice").removeClass("is-danger")
  $("#register-password-twice").addClass("input-primary")
  $("#register-password-twice").parent().children(".help").css("display", "none")

  if (!$("#register-check").prop("checked")) { // 验证是否同意协议
    $("#register-check").parent().parent().children(".help").css("display", "")
    return
  }
  $("#register-check").parent().parent().children(".help").css("display", "none")
  //尝试注册
  $(this).addClass("is-loading")
  var registering = Qmsg.loading("正在注册账号")
  var hashHex = await sha256HashWithSalt(password, "mimeng")
  await Core.register(id, hashHex, qq, name, result)
    .then((data) => {
      if (data) {
        Qmsg.success("账号注册成功，正在前往登录")
        if (Params.origin) {
          window.open("./login.html?origin=" + encodeURIComponent(Params.origin), "_self")
        } else {
          window.open("./login.html", "_self")
        }
      }
    })
    .catch((error) => {
      console.log(error)
      Captcha.reset();
      Qmsg.error("账号已注册")
      $(this).removeClass("is-loading")
    })
    .finally(() => {
      registering.close()
    })
})