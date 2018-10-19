/* power by 风情剑客 www.uu6c.com 2013.11.20*/
/*banner*/
$(function(){
var timer=5000;
var showtime = 800;
var showbox = $("#banner_show");
var inbox = $(".bannger_inbox");
var movelist = $("#yq_banner_list");
var s;
var b = 0;
var size =inbox.size();
var play = 1;
function move(){
b++;
if(b>size-1){
b=0;
}
inbox.each(function(e){
inbox.eq(e).hide(0);
$("#banner_magbox"+e).hide();
movelist.find("a").eq(e).removeClass("hover");
if(e == b){
inbox.eq(b).fadeIn(showtime);
$("#banner_magbox"+b).show();
movelist.find("a").eq(b).addClass("hover");
}
});
}
s = setInterval(move,timer);
function stopp(obj){
$(obj).hover(function(){
if(play){
clearInterval(s);
play = 0;
}	  
},
function(){
if(!play){
s = setInterval(move,timer); 
play = 1;
}	
}		  
);
}
stopp(".banner_show");
$(".banner_btn_right").click(function(){
move(); 
});
$(".banner_btn_left").click(function(){
b--;
if(b<0){
b=size-1
}
inbox.each(function(e){
inbox.eq(e).hide(0);
movelist.find("a").eq(e).removeClass("hover");
if(e == b){
inbox.eq(b).fadeIn(showtime);
movelist.find("a").eq(b).addClass("hover");
}
}); 
});
movelist.find("a").click(function(){
var rel = $(this).attr("rel");
inbox.each(function(e){
inbox.eq(e).hide(0);
movelist.find("a").eq(e).removeClass("hover");
$("#banner_magbox"+e).hide(0);
if(e == rel){
inbox.eq(rel).fadeIn(showtime);
movelist.find("a").eq(rel).addClass("hover");
$("#banner_magbox"+rel).show(0);	
}
});
});
$(".bannger_inbox").each(function(e){
var inboxsize = $(".bannger_inbox").size();
inboxwimg = $(this).find("img").width();
$(".bannger_inbox").eq(e).css({"margin-left":(-1)*inboxwimg/2+"px","z-index":inboxsize-e});
});
/*
$(".banner").hover(
function(){
	$(".banner_pre_next").fadeIn();
	},function(){
		$(".banner_pre_next").fadeOut();
		})
		*/
});

/*menu*/
$(function(){
var tt1;
$(".content_bottom_tig").bind({
mouseenter:function(){
$(this).find(".h_bg").addClass("hover");
that = $(this)
tt1= setTimeout(function(){
that.animate({
height:130
}); 
},200);
},
click:function(){
},
mouseleave:function(){
$(this).find(".h_bg").removeClass("hover");
clearTimeout(tt1);
that.animate({
height:25
}); 
}	
});
})




$(function() {

				$('#carousel ul').carouFredSel({
					prev: '#prev',
					next: '#next',
					scroll: 1000
				});
	
			});