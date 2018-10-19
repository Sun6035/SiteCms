function getcookie(name) {
    var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr != null) {
        name1 = unescape(arr[2]);
        var name = name1.replace(/[\',\"]/g, "");
        return name;
    } else {
        return "";
    }
}
var login_str='<a href="http://xnfz.gxtc.edu.cn/online/index.php?g=User&m=Login&a=index"><img src="/v6f/r/cms/www/default/myimg//login_bt_index.png"/></a>';
var login_str2='<img src="/${res}/myimg/login_bt_index2.png"/>';
var auth=getcookie('JX_auth');
if(auth==''){
    document.write(login_str);
}
else{
    document.write(login_str2);
}