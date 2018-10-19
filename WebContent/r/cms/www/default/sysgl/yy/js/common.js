
var content_str = '';

var N = ["","涓€", "浜�", "涓�", "鍥�", "浜�", "鍏�", "鏃�"];

var ue;

var reObj = function (id) {
    return "string" == typeof id ? document.getElementById(id) : id;
}
var Bind = function(object, fun) {
    return function() {
        return fun.apply(object, arguments);
    }
}
function AutoComplete(obj,autoObj,arr){
    this.obj=reObj(obj);        //杈撳叆妗�
    this.autoObj=reObj(autoObj);//DIV鐨勬牴鑺傜偣
    this.value_arr=arr;        //涓嶈鍖呭惈閲嶅鍊�
    this.index=-1;          //褰撳墠閫変腑鐨凞IV鐨勭储寮�
    this.search_value="";   //淇濆瓨褰撳墠鎼滅储鐨勫瓧绗�
}
AutoComplete.prototype={
    //鍒濆鍖朌IV鐨勪綅缃�
    init: function(){
        this.autoObj.style.left = this.obj.offsetLeft + "px";
        this.autoObj.style.top  = this.obj.offsetTop + this.obj.offsetHeight + "px";
        this.autoObj.style.width= this.obj.offsetWidth - 2 + "px";//鍑忓幓杈规鐨勯暱搴�2px  
    },
    //鍒犻櫎鑷姩瀹屾垚闇€瑕佺殑鎵€鏈塂IV
    deleteDIV: function(){
        while(this.autoObj.hasChildNodes()){
            this.autoObj.removeChild(this.autoObj.firstChild);
        }
        this.autoObj.className="auto_hidden";
    },
    //璁剧疆鍊�
    setValue: function(_this){
        return function(){
            _this.obj.value=this.seq;
            _this.autoObj.className="auto_hidden";
        }      
    },
    //妯℃嫙榧犳爣绉诲姩鑷矰IV鏃讹紝DIV楂樹寒
    autoOnmouseover: function(_this,_div_index){
        return function(){
            _this.index=_div_index;
            var length = _this.autoObj.children.length;
            for(var j=0;j<length;j++){
                if(j!=_this.index ){      
                    _this.autoObj.childNodes[j].className='auto_onmouseout';
                }else{
                    _this.autoObj.childNodes[j].className='auto_onmouseover';
                }
            }
        }
    },
    //鏇存敼classname
    changeClassname: function(length){
        for(var i=0;i<length;i++){
            if(i!=this.index ){      
                this.autoObj.childNodes[i].className='auto_onmouseout';
            }else{
                this.autoObj.childNodes[i].className='auto_onmouseover';
                this.obj.value=this.autoObj.childNodes[i].seq;
            }
        }
    }
    ,
    //鍝嶅簲閿洏
    pressKey: function(event){
        var length = this.autoObj.children.length;
        //鍏夋爣閿�"鈫�"
        if(event.keyCode==40){
            ++this.index;
            if(this.index>length){
                this.index=0;
            }else if(this.index==length){
                this.obj.value=this.search_value;
            }
            this.changeClassname(length);
        }
        //鍏夋爣閿�"鈫�"
        else if(event.keyCode==38){
            this.index--;
            if(this.index<-1){
                this.index=length - 1;
            }else if(this.index==-1){
                this.obj.value=this.search_value;
            }
            this.changeClassname(length);
        }
        //鍥炶溅閿�
        else if(event.keyCode==13){
            this.autoObj.className="auto_hidden";
            this.index=-1;
        }else{
            this.index=-1;
        }
    },
    //绋嬪簭鍏ュ彛
    start: function(event){
        if(event.keyCode!=13&&event.keyCode!=38&&event.keyCode!=40){
            this.init();
            this.deleteDIV();
            this.search_value=this.obj.value;
            var valueArr=this.value_arr;
            valueArr.sort();
            if(this.obj.value.replace(/(^\s*)|(\s*$)/g,'')==""){ return; }//鍊间负绌猴紝閫€鍑�
            try{ var reg = new RegExp("(" + this.obj.value + ")","i");}
            catch (e){ return; }
            var div_index=0;//璁板綍鍒涘缓鐨凞IV鐨勭储寮�
            for(var i=0;i<valueArr.length;i++){
                if(reg.test(valueArr[i])){
                    var div = document.createElement("div");
                    div.className="auto_onmouseout";
                    div.seq=valueArr[i];
                    div.onclick=this.setValue(this);
                    div.onmouseover=this.autoOnmouseover(this,div_index);
                    div.innerHTML=valueArr[i].replace(reg,"<strong>$1</strong>");//鎼滅储鍒扮殑瀛楃绮椾綋鏄剧ず
                    this.autoObj.appendChild(div);
                    this.autoObj.className="auto_show";
                    div_index++;
                }
            }
        }
        this.pressKey(event);
        window.onresize=Bind(this,function(){this.init();});
    }
}

$(function(){
    $(".unSelected").live('hover', function(event){
        if(event.type=='mouseenter') {
            $(this).html('<i class="iconfont icon-queren2"></i> <strong>鐐瑰嚮棰勭害</strong>'); 
        } else {
            $(this).html('');
        }
    });
});

function chooseDate(w, d, t, room, obj)
{
    // 鍒ゆ柇鐢ㄦ埛鏄惁宸茬粡鐧诲綍
    if (uid == 0) {
        layer.msg('璇峰厛鐧诲綍鍝');
        return false;
    }
    $(obj).attr('id', 'c-'+w+'-'+d+'-'+t);
    $.post(root+'getLesson', {
        "room" : room
    }, 
    function(res) {
        content_str = '<option value="0">璇烽€夋嫨鐝骇</option>';
        $.each(res, function(i, v){
            content_str += "<option value='"+v+"'>"+v+"</option>";
        }); 
        layer.open({
            type: 1,
            area: ['490px', '220px'],
            shadeClose: true,
            title: '<i class="iconfont icon-date"></i> 姝ｅ湪棰勭害锛�<strong><code>'+room+'</code>瀹為獙瀹わ紝绗�<code>'+w+'</code>鍛ㄦ槦鏈�<code>'+N[d]+'</code>锛岀<code>'+(2*t-1)+'~'+2*t+'</code>鑺傝</strong>',
            content: '<div class="bz-form bz-form-aligned"><fieldset><div class="bz-control-group"><label for="name">閫夋嫨鐝骇</label><select name="teachclass" id="teachclass" onchange="javascript:getLesson();">'+content_str+'</select></div><div class="bz-control-group"><label for="name">閫夋嫨璇剧▼</label><select name="lessonname" id="lessonname" onchange="javascript:getProject();"><option value="0">璇烽€夋嫨璇剧▼</option></select></div><div class="bz-control-group"><label for="name">瀹為獙椤圭洰</label><select name="projectname" id="projectname"><option value="">璇烽€夋嫨瀹為獙椤圭洰</option></select></div><div class="bz-controls"><button class="bz-button bz-button-primary" id="doSign-btn" onclick="doSign('+w+','+d+','+t+',\''+room+'\');"><i class="iconfont icon-queren2"></i> 纭棰勭害</button></div></fieldset></div>'
        });
    }, 'json'); 
}

function chooseAllDate(w, d, t, room, obj)
{
    // 鍒ゆ柇鐢ㄦ埛鏄惁宸茬粡鐧诲綍
    if (uid == 0) {
        layer.msg('璇峰厛鐧诲綍鍝');
        return false;
    }
    $(obj).attr('id', 'c-'+w+'-'+d+'-'+t);
    $.post(root+'getAllUser', {
        "room" : room
    }, 
    function(res) {
        content_str1 = '<option value="0">璇烽€夋嫨鏁欏笀</option>';
        $.each(res, function(i, v){
            content_str1 += "<option value='"+v.uid+"'>"+v.username+" ("+(v.uid)+")</option>";
        });
        layer.open({
            type: 1,
            area: ['490px', '280px'],
            shadeClose: true,
            title: '<i class="iconfont icon-date"></i> 姝ｅ湪琛ユ帓锛�<strong><code>'+room+'</code>瀹為獙瀹わ紝绗�<code>'+w+'</code>鍛ㄦ槦鏈�<code>'+N[d]+'</code>锛岀<code>'+(2*t-1)+'~'+2*t+'</code>鑺傝</strong>',
            content: '<div class="bz-form bz-form-aligned"><fieldset><div class="bz-control-group"><label for="name">閫夋嫨鏁欏笀</label><select name="teacher_no" id="teacher_no" onchange="getClass(\''+$.trim(room)+'\')">'+content_str1+'</select></div><div class="bz-control-group"><label for="name">閫夋嫨鐝骇</label><select name="teachclass" id="teachclass" onchange="getRenewLesson()"><option value="0">璇烽€夋嫨鐝骇</option></select></div><div class="bz-control-group"><label for="name">閫夋嫨璇剧▼</label><select name="lessonname" id="lessonname" onchange="getProject()"><option value="0">璇烽€夋嫨璇剧▼</option></select></div><div class="bz-control-group"><label for="name">瀹為獙椤圭洰</label><select name="projectname" id="projectname"><option value="">璇烽€夋嫨瀹為獙椤圭洰</option></select></div><div class="bz-controls"><button class="bz-button bz-button-primary" id="doSign-btn" onclick="doRenewSign('+w+','+d+','+t+',\''+room+'\')"><i class="iconfont icon-queren2"></i> 纭棰勭害</button></div></fieldset></div>'
        });
    }, 'json'); 
}

function cancelDate(w, d, t, room, obj)
{
    if (uid == 0) {
        layer.msg('璇峰厛鐧诲綍鍝');
        return false;
    }
    $(obj).attr('id', 'c-'+w+'-'+d+'-'+t);
    layer.open({
        type: 1,
        area: ['300px', '120px'],
        shadeClose: true, //鐐瑰嚮閬僵鍏抽棴
        title: '<i class="iconfont icon-date"></i> 鍗冲皢鍙栨秷璇ラ绾︼紝鏄惁纭畾锛�',
        content: '\<\div style="padding:20px;"><a href="javascript:doCancel('+w+','+d+','+t+',\''+room+'\');" class="bz-button bz-button-primary left" id="cancel-btn"><i class="iconfont icon-queren2"></i> <strong>纭畾鎵ц</strong></a><a href="javascript:hiddenShade();" class="bz-button bz-button-sm right"><strong>鍙栨秷</strong></a>\<\/div>'
    });
}

function editNotice(id)
{
    $.post(root+'getNoticeDetail', {
        'id': id
    }, function(res) {
        if (res.id == 0) {
            var t_str = '姝ｅ湪鏂板鍏憡';
        }else{
            var t_str = '姝ｅ湪缂栬緫鍏憡 - <strong>'+res.title+'</strong>';
        }
        layer.open({
            type: 1,
            area: ['900px', '600px'],
            shadeClose: true, //鐐瑰嚮閬僵鍏抽棴
            title: t_str,
            content: '<form method="post" class="bz-form bz-form-stacked" style="width:880px;margin:10px"><fieldset><input type="hidden" name="id" class="bz-input-1" value="'+res.id+'"><input type="text" name="title" class="bz-input-1" value="'+res.title+'"><textarea name="contents" style="display:none"></textarea><script id="container'+id+'" name="content" type="text/plain" style="height:380px;">'+res.content+'</script><script>showEditor("'+id+'");</script></fieldset><button type="submit" class="bz-button bz-button-primary" onclick="synContent();">纭畾鎻愪氦</button> <button type="button" onclick="hiddenShade();" class="bz-button bz-button-sm">鍙栨秷</button></form>'
        });
    }, 'json');
}

function getMyRes()
{
    var myClass = $('#myClass option:selected').val();
    if (myClass == 0) {
        layer.msg('璇烽€夋嫨浠绘暀鐝骇锛�');
        return false;
    };
    $('.bz-table').remove();
    $('#outxls-btn').remove();
    $('#print-btn').remove();
    $('#query-btn').attr('disabled', 'disabled'); 
    $.post(root+'getMyClassRes', {
        'class_name': myClass
    }, function(res) {
        $('.bz-panel').after('<table id="row-res" class="bz-table"><thead><tr><th>鍛ㄦ</th><th>鏃堕棿</th><th>璇剧▼</th><th>瀹為獙椤圭洰</th><th>瀹為獙鐝骇</th><th>瀹為獙瀹�</th></tr></thead>');
        $.each(res, function(i, v){
            $('.bz-table').append('<tr><td>绗� <code>'+v.week+'</code> 鍛�</td><td>'+v.time+'</td><td>'+v.classInfo.lesson_name+'</td><td>'+v.projectname+'</td><td>'+v.classInfo.class_name+'</td><td>'+v.roomName+'</td></tr>');
        }); 
        $('tr:last').after('</tbody></table>');
        $('#query-btn').removeAttr('disabled');
        xlsOUT('row-res', uid+'-'+$('#myClass option:selected').text()+'鐨勮绋嬪畨鎺�.xls');
    }, 'json');
}

function getQueryRes()
{
    var q_term = $('#q_term option:selected').val();
    var q_week = $('#q_week option:selected').val();
    var tid = $('#tid option:selected').val();
    var rid = $('#room option:selected').val();
    var t_str = '';

    if (q_term == 0) {
        layer.msg('璇烽€夋嫨瀛︽湡锛�');
        return false;
    }

    t_str = $('#q_term option:selected').text();

    if (q_week > 0) {
        t_str += ' - ' + $('#q_week option:selected').text();
    }
    if (tid > 0) {
        t_str += ' - ' + $('#tid option:selected').text();
    }
    if (rid > 0) {
        t_str += ' - ' + $('#room option:selected').text();
    }

    var post_data = {
        'q_term': q_term,
        'q_week': q_week,
        'tid': tid,
        'rid': rid
    };

    // 娣诲姞鐨勫弬鏁�
    var teacher_no = $('#teacher option:selected').val();// 鑰佸笀ID
    var class_no = $('#class option:selected').val();// 鐝骇ID
    // 濡傛灉閫夋嫨浜嗚€佸笀锛屽垯娣诲姞鑰佸笀绛涢€夋潯浠�
    if(teacher_no != '0'){
        post_data.q_teacher_no = teacher_no;
    }
    // 濡傛灉閫夋嫨浜嗙彮绾э紝鍒欐坊鍔犵彮绾х瓫閫夋潯浠�
    if(class_no != '0'){
        post_data.q_class_no = class_no;
    }

    $('.bz-table').remove();
    $('#outxls-btn').remove();
    $('#print-btn').remove();
    $('#query-btn').attr('disabled', 'disabled');
    $('#query-btn').html('<i class="iconfont icon-search"></i> 姝ｅ湪鏌ヨ...');
    $.post(root+'getQueryRes', post_data, function(res) {
        if (q_week > 0) {
            $('.bz-panel').after('<table id="row-res" class="bz-table"><thead><tr><td colspan="6"><b>'+t_str+'鐨勮琛�</b></td></tr><tr><th>鏃堕棿</th><th>鏁欏笀</th><th>璇剧▼</th><th>瀹為獙椤圭洰</th><th>瀹為獙鐝骇</th><th>瀹為獙瀹�</th></tr></thead>');
            $.each(res, function(i, v){
                $('.bz-table').append('<tr><td>'+v.time+'</td><td>'+v.teacher+'</td><td>'+v.classInfo.lesson_name+'</td><td>'+v.projectname+'</td><td>'+v.classInfo.class_name+'</td><td>'+v.roomName+'</td></tr>');
            }); 
        }else{
            $('.bz-panel').after('<table id="row-res" class="bz-table"><thead><tr><td colspan="7"><b>'+t_str+'鐨勮琛�</b></td></tr><tr><th>鍛ㄦ</th><th>鏃堕棿</th><th>鏁欏笀</th><th>璇剧▼</th><th>瀹為獙椤圭洰</th><th>瀹為獙鐝骇</th><th>瀹為獙瀹�</th></tr></thead>');
            $.each(res, function(i, v){
                $('.bz-table').append('<tr><td>绗� '+v.week+' 鍛�</td><td>'+v.time+'</td><td>'+v.teacher+'</td><td>'+v.classInfo.lesson_name+'</td><td>'+v.projectname+'</td><td>'+v.classInfo.class_name+'</td><td>'+v.roomName+'</td></tr>');
            }); 
        }
        
        $('tr:last').after('</tbody></table>');
        $('#query-btn').removeAttr('disabled');
        $('#query-btn').html('<i class="iconfont icon-search"></i> 鏌ヨ');
        xlsOUT('row-res', t_str+' 鐨勮绋嬪畨鎺掔粨鏋�.xls');
    }, 'json');
}

function getQueryLessonCount()
{
    var belong = $('#belong option:selected').val();
    var type = $('#type option:selected').val();
    var tid = $('#tid option:selected').val();

    var t_str = '';

    if (belong == 0) {
        layer.msg('璇烽€夋嫨绯诲埆锛�');
        return false;
    }

    t_str = $('#belong option:selected').text();

    if (type != 0) {
        t_str += ' - ' + $('#type option:selected').text();
    }
    if (tid > 0) {
        t_str += ' - ' + $('#tid option:selected').text();
    }

    $('.bz-table').remove();
    $('#outxls-btn').remove();
    $('#print-btn').remove();
    $('#query-btn').attr('disabled', 'disabled');
    $('#query-btn').html('<i class="iconfont icon-search"></i> 姝ｅ湪鏌ヨ...');
    $.post(root+'admin/lessonCount', {
        'belong': belong,
        'type': type,
        'tid': tid
    }, function(res) {
        $('.bz-panel').after('<table id="row-res" class="bz-table"><thead><tr><th>璇剧▼鍚嶇О</th><th>鐝骇鍚嶇О</th><th>瀹為獙绫诲埆</th><th>绯诲埆</th><th>閫夎浜烘暟</th><th>瀹為獙璁″垝瀛︽椂</th><th>瀹為獙浜烘椂鏁�</th></tr></thead>');
        $.each(res, function(i, v){
            $('.bz-table').append('<tr><td>'+v.lesson_name+'</td><td>'+v.class_name+'</td><td>'+v.type+'</td><td>'+v.belong+'</td><td>'+v.count+'</td><td>'+v.lesson_time+'</td><td>'+v.allCount+'</td></tr>');
        });
        $('tr:last').after('</tbody></table>');
        $('#query-btn').removeAttr('disabled');
        $('#query-btn').html('<i class="iconfont icon-search"></i> 鏌ヨ');
        xlsOUT('row-res', t_str+' 鐨勬満鏃剁粺璁�.xls');
    }, 'json');
}

function getClass(room)
{
    var teacher_no = $('#teacher_no option:selected').val();
    $.post(root+'getTeacherClass', {
        'teacher_no': teacher_no,
        'room' : room
    }, function(res) {
        $('#teachclass').html('<option value="0">璇烽€夋嫨鐝骇</option>');
        $.each(res, function(i, v){
            $('#teachclass').append("<option value='"+v+"'>"+v+"</option>");
        }); 
    }, 'json');
}

function getLesson()
{
    var teachclass = $('#teachclass option:selected').val();
    $.post(root+'getClassLesson', {
        'class_name': teachclass
    }, function(res) {
        $('#lessonname').html('<option value="0">璇烽€夋嫨璇剧▼</option>');
        $.each(res, function(i, v){
            $('#lessonname').append("<option value='"+v['lesson_no']+"'>"+v['lesson_name']+"</option>");
        }); 
    }, 'json');
}

function getRenewLesson()
{
    var teachclass = $('#teachclass option:selected').val();
    var teacher_no = $('#teacher_no option:selected').val();
    $.post(root+'getRenewClassLesson', {
        'class_name': teachclass,
        'teacher_no' : teacher_no
    }, function(res) {
        $('#lessonname').html('<option value="0">璇烽€夋嫨璇剧▼</option>');
        $.each(res, function(i, v){
            $('#lessonname').append("<option value='"+v['lesson_no']+"'>"+v['lesson_name']+"</option>");
        }); 
    }, 'json');
}

function getProject()
{
    var lesson = $('#lessonname option:selected').val();
    $.post(root+'getProject', {
        'lesson_no': lesson
    }, function(res) {
        $('#projectname').html('<option value="">璇烽€夋嫨瀹為獙椤圭洰</option>');
        $.each(res, function(i, v){
            $('#projectname').append("<option value='"+v+"'>"+v+"</option>");
        }); 
    }, 'json');
}

function doSign(w, d, t, room)
{
    var class_name = $('#teachclass option:selected').val();
    var lesson_no = $('#lessonname option:selected').val();
    var projectname = $('#projectname option:selected').val();

    if (class_name == 0) {layer.msg('璇烽€夋嫨鐝骇!');return false;}
    if (lesson_no == 0) {layer.msg('璇烽€夋嫨璇剧▼!');return false;}

    $('#doSign-btn').attr('disabled', 'disabled');
    $('#doSign-btn').html('<i class="iconfont icon-queren2"></i> 姝ｅ湪棰勭害涓�...');
    setTimeout(function () { 
        $.post(root+'doSign', {
            'week' : w,
            'x' : d,
            'y' : t,
            'room' : room,
            'projectname' : projectname,
            'class_name' : class_name,
            'lesson_no' : lesson_no
        }, function(res) {
            if (res.status > 0) {
                $('#c-'+w+'-'+d+'-'+t).attr('class', 'selected');

                $('#c-'+w+'-'+d+'-'+t).html(res.info);

                $('#c-'+w+'-'+d+'-'+t).attr('onclick', 'cancelDate('+w+', '+d+', '+t+', "'+room+'", this);');

                $('#doSign-btn').removeAttr('disabled');

                $('#doSign-btn').html('<i class="iconfont icon-queren2"></i> 纭棰勭害');
                
                $('.layui-layer-shade').click();

                layer.msg('棰勭害鎴愬姛锛�');
            } else {
                $('#doSign-btn').removeAttr('disabled');

                $('#doSign-btn').html('<i class="iconfont icon-queren2"></i> 纭棰勭害');

                layer.msg(res.message);
            }
        }, 'json');
    }, 800);
}

// 瀹為獙琛ユ帓棰勭害
function doRenewSign(w, d, t, room)
{
    var teacher_no = $('#teacher_no option:selected').val();
    var class_name = $('#teachclass option:selected').val();
    var lesson_no = $('#lessonname option:selected').val();
    var projectname = $('#projectname option:selected').val();

    if (teacher_no == 0) {layer.msg('璇烽€夋嫨鏁欏笀!');return false;}
    if (class_name == 0) {layer.msg('璇烽€夋嫨鐝骇!');return false;}
    if (lesson_no == 0) {layer.msg('璇烽€夋嫨璇剧▼!');return false;}

    $('#doSign-btn').attr('disabled', 'disabled');
    $('#doSign-btn').html('<i class="iconfont icon-queren2"></i> 姝ｅ湪琛ユ帓涓�...');
    setTimeout(function () { 
        $.post(root+'doRenewSign', {
            'teacher_no' : teacher_no,
            'week' : w,
            'x' : d,
            'y' : t,
            'room' : room,
            'projectname' : projectname,
            'class_name' : class_name,
            'lesson_no' : lesson_no
        }, function(res) {
            if (res.status > 0) {
                $('#c-'+w+'-'+d+'-'+t).attr('class', 'selected');

                $('#c-'+w+'-'+d+'-'+t).html(res.info);

                $('#c-'+w+'-'+d+'-'+t).attr('onclick', 'cancelDate('+w+', '+d+', '+t+', "'+room+'", this);');

                $('#doSign-btn').removeAttr('disabled');

                $('#doSign-btn').html('<i class="iconfont icon-queren2"></i> 纭棰勭害');
                
                $('.layui-layer-shade').click();

                layer.msg('棰勭害鎴愬姛锛�');
            } else {
                $('#doSign-btn').removeAttr('disabled');

                $('#doSign-btn').html('<i class="iconfont icon-queren2"></i> 纭棰勭害');

                layer.msg(res.message);
            }
        }, 'json');
    }, 800);
}

function doCancel(w, d, t, room)
{
    $('#cancel-btn').attr('disabled', 'disabled');
    $('#cancel-btn').html('<i class="iconfont icon-queren2"></i> 姝ｅ湪鍙栨秷涓�...');
    setTimeout(function () { 
        $.post(root+'doCancel', {
            'week' : w,
            'x' : d,
            'y' : t,
            'room' : room
        }, function(res) {
            $('#cancel-btn').removeAttr('disabled');
            $('#cancel-btn').html('<i class="iconfont icon-queren2"></i> 纭鎵ц');
            $('.layui-layer-shade').click();
            if (res.status > 0) {
                window.location.reload();
                $('#c-'+w+'-'+d+'-'+t).attr('class', 'unSelected');

                $('#c-'+w+'-'+d+'-'+t).attr('onclick', 'chooseDate('+w+', '+d+', '+t+', "'+room+', this");');

                $('#c-'+w+'-'+d+'-'+t).html('');

                layer.msg('鍙栨秷棰勭害鎴愬姛~');
            } else {
                layer.msg('鍙栨秷棰勭害澶辫触锛屼綘娌℃湁鏉冮檺鎵ц姝ゆ搷浣滐紒');
            }
        }, 'json');
    }, 500);
}

function checkroom() {
    var room = document.getElementById("room").value;
    if (room == 0)
    {
        alert("蹇呴』閫夋嫨瀹為獙鎴块棿锛�");
        return false
    }
}

function getroom() {
    var tid = $('#tid option:selected').val();
    $.post(root+'getRoom', {
        'tid': tid
    }, function(res) {
        if(res){
            $('#room').html('<option value="0">璇烽€夋嫨瀹為獙瀹�</option>');
            $.each(res, function(i, v){
                $('#room').append("<option value='"+v['rid']+"'>"+v['room']+"</option>");
            }); 
        }
    }, 'json').always(function(){
        // 鏇存柊鑰佸笀鍜岀彮绾ч€夋嫨鍒楄〃
        updateTeacherAndClass();
    });
}

/**
 * 鏇存柊鑰佸笀鍜岀彮绾ч€夋嫨鍒楄〃
 */
function updateTeacherAndClass(){
    getTeacherAndClasses();
}

/**
 * 鏍规嵁瀛︽湡绛変俊鎭紝鑾峰彇鑰佸笀鍒楄〃
 * 鍗曠嫭缂栧啓鐨勪簨浠�-浣嗘湭浣跨敤
 * @unused
 * @auther <caoruiy@plcent.com> 2018骞�6鏈�11鏃�18:06:24
 */
function getTeachers() {
    var term = $('#q_term option:selected').val();// 瀛︽湡
    var drive_name = $('#tid option:selected').html();// 瀹為獙妯″潡
    var tid = $('#tid option:selected').val();// 瀹為獙妯″潡ID

    var post_data= {
        'q_term': term
    };

    if(tid != '0'){
        post_data.q_device_name = drive_name;
    }

    $.post(root+'getTermClassList', post_data, function(res) {
        $('#teacher').html('<option value="0">璇烽€夋嫨鑰佸笀</option>');
        $.each(res, function(i, v){
            $('#teacher').append("<option value='"+v['teacher_no']+"'>"+v['teacher_name']+"</option>");
        }); 
    }, 'json');
}

/**
 * 鏍规嵁瀛︽湡绛変俊鎭紝鑾峰彇鐝骇鍒楄〃
 * @auther <caoruiy@plcent.com> 2018骞�6鏈�11鏃�18:06:24
 */
function getClasses() {
    var term = $('#q_term option:selected').val();// 瀛︽湡
    var drive_name = $('#tid option:selected').html();// 瀹為獙妯″潡
    var tid = $('#tid option:selected').val();// 瀹為獙妯″潡ID
    var teacher = $('#teacher option:selected').val();// 鑰佸笀ID

    var post_data= {
        'q_term': term
    };

    if(tid != '0'){
        post_data.q_device_name = drive_name;
    }
    if(teacher != '0'){
         post_data.q_teacher_no = teacher;
    }

    $.post(root+'getTermClassList', post_data, function(res) {
        $('#class').html('<option value="0">璇烽€夋嫨鐝骇</option>');
        $.each(res, function(i, v){
            $('#class').append("<option value='"+v['class_id']+"'>"+v['class_name']+"</option>");
        }); 
    }, 'json');
}

/**
 * 鏍规嵁瀛︽湡绛変俊鎭紝鑾峰彇鑰佸笀鍜岀彮绾у垪琛�
 * 鐢变簬鑾峰彇鏁欏笀鍜岀彮绾х殑鎺ュ彛浣跨敤鍚屼竴涓帴鍙ｏ紝鎵€浠ュ湪鍚庣杩斿洖鐨勬暟鎹腑锛屾病鏈夎繘琛屽幓閲嶏紝閫夋嫨鍦ㄥ墠绔幓閲嶃€�
 * @auther <caoruiy@plcent.com> 2018骞�6鏈�11鏃�18:06:24
 */
function getTeacherAndClasses() {
    var term = $('#q_term option:selected').val();// 瀛︽湡
    var drive_name = $('#tid option:selected').html();// 瀹為獙妯″潡
    var tid = $('#tid option:selected').val();// 瀹為獙妯″潡ID
    var teacher = $('#teacher option:selected').val();// 鑰佸笀ID

    var post_data= {
        'q_term': term
    };

    if(tid != '0'){
        post_data.q_device_name = drive_name;
    }
    if(teacher != '0'){
         post_data.q_teacher_no = teacher;
    }

    $.post(root+'getTermClassList', post_data, function(res) {
        $('#class').html('<option value="0">璇烽€夋嫨鐝骇</option>');
        $('#teacher').html('<option value="0">璇烽€夋嫨鑰佸笀</option>');
        var teacher_unique = [], class_unique = [];

        // 鐢熸垚鍒楄〃骞跺幓閲�
        $.each(res, function(i, v){
            if(class_unique.indexOf(v['class_id']) == -1){
                $('#class').append("<option value='"+v['class_id']+"'>"+v['class_name']+"</option>");
                class_unique.push(v['class_id'])
            }
            if(teacher_unique.indexOf(v['teacher_no']) == -1){
                $('#teacher').append("<option value='"+v['teacher_no']+"'>"+v['teacher_name']+"</option>");
                teacher_unique.push(v['teacher_no'])
            }
        });  
    }, 'json');
}



function goSearch()
{
    var tid = $('#tid option:selected').val();
    var rid = $('#room option:selected').val();

    if (tid == 0) {
        layer.msg('瀹為獙妯″潡鏈€夋嫨锛�');
        return false;
    }

    if (rid == 0) {
        layer.msg('瀹為獙瀹ゆ湭閫夋嫨锛�');
        return false;
    }

    window.location.href = root+"m/"+tid+"/"+rid+"/";
}

function goRenewSearch()
{
    var tid = $('#tid option:selected').val();
    var rid = $('#room option:selected').val();

    if (tid == 0) {
        layer.msg('瀹為獙妯″潡鏈€夋嫨锛�');
        return false;
    }

    if (rid == 0) {
        layer.msg('瀹為獙瀹ゆ湭閫夋嫨锛�');
        return false;
    }

    window.location.href = root+"admin/renew/"+tid+"/"+rid+"/";
}

function editInformation(class_id)
{
    layer.open({
        type: 1,
        area: ['380px', '450px'],
        shadeClose: true,
        title: '缂栬緫鐝骇淇℃伅',
        content: '<div class="bz-form bz-form-aligned"><form action="'+root+'admin/data/cclab_information" method="post"><fieldset><div class="bz-control-group"><label for="name">class_id</label><input type="text" name="class_id" value="'+$('#inf-'+class_id+' .class_id').text()+'" readonly></div><div class="bz-control-group"><label for="name">鐝骇鍚�</label><input type="text" name="class_name" value="'+$('#inf-'+class_id+' .class_name').text()+'"></div><div class="bz-control-group"><label for="name">璇剧▼鍙�</label><input type="text" name="lesson_no" value="'+$('#inf-'+class_id+' .lesson_no').text()+'"></div><div class="bz-control-group"><label for="name">璇剧▼鍚�</label><input type="text" name="lesson_name" value="'+$('#inf-'+class_id+' .lesson_name').text()+'"></div><div class="bz-control-group"><label for="name">璇炬椂鏁�</label><input type="text" name="lesson_time" value="'+$('#inf-'+class_id+' .lesson_time').text()+'"></div><div class="bz-control-group"><label for="name">妯″潡鍚�</label><input type="text" name="device_name" value="'+$('#inf-'+class_id+' .device_name').text()+'"></div><div class="bz-control-group"><label for="name">鏁欏笀鍙�</label><input type="text" name="teacher_no" value="'+$('#inf-'+class_id+' .teacher_no').text()+'"></div><div class="bz-control-group"><label for="name">鏁欏笀鍚�</label><input type="text" name="teacher_name"  value="'+$('#inf-'+class_id+' .teacher_name').text()+'"></div><div class="bz-control-group"><label for="name">瀛︽湡</label><input type="text" name="term" value="'+$('#inf-'+class_id+' .term').text()+'"></div><div class="bz-controls"><button type="submit" class="bz-button bz-button-primary"><i class="iconfont icon-queren2"></i> 纭缂栬緫</button></div></fieldset></form></div>'
    });
}

function editProject(id)
{
    layer.open({
        type: 1,
        area: ['380px', '280px'],
        shadeClose: true,
        title: '缂栬緫璇剧▼椤圭洰淇℃伅',
        content: '<div class="bz-form bz-form-aligned"><form action="'+root+'admin/data/cclab_project" method="post"><fieldset><div class="bz-control-group"><label for="name">id</label><input type="text" name="id" value="'+$('#pro-'+id+' .id').text()+'" readonly></div><div class="bz-control-group"><label for="name">璇剧▼鍙�</label><input type="text" name="lesson_no" value="'+$('#pro-'+id+' .lesson_no').text()+'"></div><div class="bz-control-group"><label for="name">璇剧▼鍚嶇О</label><input type="text" name="lesson_name" value="'+$('#pro-'+id+' .lesson_name').text()+'"></div><div class="bz-control-group"><label for="name">椤圭洰鍚嶇О</label><input type="text" name="projectname" value="'+$('#pro-'+id+' .projectname').text()+'"></div><div class="bz-controls"><button type="submit" class="bz-button bz-button-primary"><i class="iconfont icon-queren2"></i> 纭缂栬緫</button></div></fieldset></form></div>'
    });
}

function editUser(uid)
{
    layer.open({
        type: 1,
        area: ['380px', '320px'],
        shadeClose: true,
        title: '缂栬緫鏁欏笀淇℃伅',
        content: '<div class="bz-form bz-form-aligned"><form action="'+root+'admin/data/cclab_user" method="post"><fieldset><div class="bz-control-group"><label for="name">鏁欏笀宸ュ彿</label><input type="text" name="uid" value="'+$('#user-'+uid+' .uid').text()+'" readonly></div><div class="bz-control-group"><label for="name">鏁欏笀濮撳悕</label><input type="text" name="username" value="'+$('#user-'+uid+' .username').text()+'"></div><div class="bz-control-group"><label for="name">閭</label><input type="text" name="email" value="'+$('#user-'+uid+' .email').text()+'"></div><div class="bz-control-group"><label for="name">鐢ㄦ埛缁�</label><input type="text" name="groupid" value="'+$('#user-'+uid+' .groupid').text()+'"></div><div class="bz-control-group"><label for="name">瀵嗙爜</label><input type="password" name="password" placeholder="涓嶄慨鏀硅鐣欑┖"></div><div class="bz-controls"><button type="submit" class="bz-button bz-button-primary"><i class="iconfont icon-queren2"></i> 纭缂栬緫</button></div></fieldset></form></div>'
    });
}

function editDevice(id)
{
    layer.open({
        type: 1,
        area: ['400px', '410px'],
        shadeClose: false,
        title: '缂栬緫璁惧淇℃伅',
        content: '<div class="bz-form bz-form-aligned"><form action="'+root+'admin/data/cclab_device" method="post"><fieldset><input type="hidden" name="id" value="'+$('#device-'+id+' .id').val()+'"><div class="bz-control-group"><label>璁惧缂栧彿</label><input type="text" name="sid" value="'+$('#device-'+id+' .sid').text()+'"></div><div class="bz-control-group"><label>璁惧鍚嶇О</label><input type="text" name="name" value="'+$('#device-'+id+' .name').text()+'"></div><div class="bz-control-group"><label>璁惧鍨嬪彿</label><input type="text" name="model" value="'+$('#device-'+id+' .model').text()+'"></div><div class="bz-control-group"><label>鏁伴噺</label><input type="text" name="num" value="'+$('#device-'+id+' .num').text()+'"></div><div class="bz-control-group"><label>鐘舵€�</label><input type="text" name="status" value="'+$('#device-'+id+' .status').text()+'"></div><div class="bz-control-group"><label>璐熻矗浜�</label><input type="text" name="person" value="'+$('#device-'+id+' .person').text()+'"></div><div class="bz-control-group"><label>浣嶇疆</label><input type="text" name="location" value="'+$('#device-'+id+' .location').text()+'"></div><div class="bz-control-group"><label>鏃堕棿</label><input type="text" name="time" value="'+$('#device-'+id+' .time').text()+'"></div><div class="bz-controls"><button type="submit" class="bz-button bz-button-primary"><i class="iconfont icon-queren2"></i> 纭缂栬緫</button></div></fieldset></form></div>'
    });
}

function toggleFunc()
{
    $('#choose-tip-info').toggle('500');
}

function hiddenShade()
{
    $('.layui-layer-shade').click();
}

function myPrint(){
    window.print();
}

var xlsOUT = (function() {
  var uri = 'data:application/vnd.ms-excel;base64,'
    , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="Content-Type" charset=utf-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table border="1">{table}</table></body></html>'
    , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
    , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
  return function(table, name) {
    if (!table.nodeType) table = document.getElementById(table)
    var ctx = {worksheet:'Worksheet', table: table.innerHTML}
    $('#row-res').after('<a href="javascript:myPrint();" class="bz-button bz-button-sm right" id="print-btn">鎵撳嵃璇ヨ〃鏍�</a><a href="'+uri + base64(format(template, ctx))+'" download="'+name+'" class="bz-button bz-button-sm right" id="outxls-btn">瀵煎嚭涓簒ls鏂囦欢<em>锛堟帹鑽愪娇鐢╟hrome娴忚鍣ㄤ笅杞斤級</em></a><div class="clear"></div>');
  }
})();