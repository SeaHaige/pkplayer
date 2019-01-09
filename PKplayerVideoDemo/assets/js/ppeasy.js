
PPeasyPlayer=(function(){
//document.webkitCancelFullScreen();
	var playpara=null; 
	var player;
	var play_progress;
	var fullscreen;
	var curtime; 
	var duration;
	var slience;
	var voice_volume;
	var controls;
	var voice_btn;
	var mutepos=-1;
	var controltimeout=0;
	var adtick=null;
	var playerstart=0;
	function setplaystate(playstate){
		if(playstate==1){
			curtime.parentNode.childNodes[0].childNodes[0].classList.remove("fa-play");
			curtime.parentNode.childNodes[0].childNodes[0].classList.add("fa-pause");
			document.getElementById("ppeasylgplay").style.display="none";
		}else{
			document.getElementById("ppeasylgplay").style.display="block";
			curtime.parentNode.childNodes[0].childNodes[0].classList.remove("fa-pause");
			curtime.parentNode.childNodes[0].childNodes[0].classList.add("fa-play");
		}
	}
	function play(para)
	{	 
		var js='<div id="ppeasymediaplayer" style="position:relative;border:1px solid;width:100%;height:100%;">'+
'<div style="position:absolute;left:30px;top:50px;'+
'	background-color: #1c1c1c;color:#FFFFFF;border-radius:5px;padding:5px;display:none;">广告倒计时还有'+
'		<span id="adtick" style="color:#FF0000;width:15px;display:inline-block;text-align:right;padding-right:6px;">1</span>秒</div>'+
'<div  id="ppeasylgplay"></div>'+
'<video poster=null id=ppeasyvd  preload="none"  autoplay="autoplay" style="width:100%;height:100%;background-color: #000000;"></video>'+
'			<div class="ppeasy-wrap" style="width:100%;bottom:0px;display:none;">'+
'				<div id="progress-list" class="progress-list">'+
'					<div id="play-progress" class="play-progress">'+
'					</div>'+
'				</div>'+
'				<div id="ppeasycontrols" class="controlsppeasy3" >'+
'					<div class="left-box"><span id="video-btn"><i class="fa fa-play"></i></span><span id="ppeasycurtime">'+
'							00:00:00</span><span class="left-box-div">/</span><span id="ppeasyduration">'+
'								00:00:00</span> '+
'					</div>'+
'					<div id="ppeasybox">'+
'						<ul>'+
'							<span id="slience"> <i class="fa fa-volume-up"></i></span><span id="voice-box" class="volume_wrap voice-box">'+
'								    <div class="voice-line"></div>'+
'									<div id="voice-volume" class="voice-volume"></div>'+
'									<div id="voice-btn" class="voice-btn"></div>'+
'		               	    </span> '+
'							<span id="fullScreen" style="outline: none;"> <i class="fa fa-arrows-alt"></i></span>'+
'						</ul>'+
'					</div>'+
'				</div>'+
'			</div>'+
'		';
		//alert(typeof orientation); 
		
		
		playpara=para;
		document.getElementById(playpara.player).innerHTML=js;	
		adtick=document.getElementById("adtick");

		if(typeof playpara.adCountDowns!='undefined')
			adtick.innerHTML=playpara.adCountDowns;
		else
		{
		}
			
		voice_box = document.getElementById("voice-box");
		slience=document.getElementById("slience");
		slience.style.display="none";
		voice_box.style.display="none";
		
		curtime=document.getElementById("ppeasycurtime");
		duration=document.getElementById("ppeasyduration");
		player=document.getElementById("ppeasyvd");
		voice_volume = document.getElementById("voice-volume");
		voice_btn = document.getElementById("voice-btn");
		controls = document.getElementById("ppeasycontrols");
		fullscreen = document.getElementById("fullScreen");
		play_progress = document.getElementById("progress-list");
		
		if(window.navigator.userAgent.indexOf('Chrome/')>=0 && parseInt(window.navigator.userAgent.split('Chrome/')[1].split('.')[0])<66 && typeof orientation=='undefined' || window.navigator.userAgent.indexOf('Chrome/')<0
			)
		{
			adtick.parentNode.style.display="block";
			playerstart=1;
		}
		
		if(window.navigator.userAgent.indexOf('Chrome/')>=0 && parseInt(window.navigator.userAgent.split('Chrome/')[1].split('.')[0])>=66 && typeof orientation=='undefined'  || typeof orientation!='undefined')		 
		{
			
			document.getElementById("ppeasylgplay").style.display="block";
		}
		
		
		voice_btn.onmousedown=function(event) { 
			var boxOffset =  voice_box.getBoundingClientRect().left; 
			document.onmousemove = function(event) {    
				var oX = event.clientX - boxOffset;  
				console.log(oX);
				var maxW = voice_box.offsetWidth;
				var minW = 0;
				oX > minW ? oX : oX = minW;
				oX > maxW ? oX = maxW : oX;
				voice_btn.style.left = oX + "px";
				voice_volume.style.width = oX + "px"; 
				player.volume = (oX / voice_box.offsetWidth).toFixed(2); 
				switch(true) {
					case player.volume >= 0.5:
						slience.innerHTML = "<i class='fa fa-volume-up'></i>";
						break;
					case player.volume > 0:
						slience.innerHTML = "<i class='fa fa-volume-down'></i>";
						break;
					case player.volume == 0:
						slience.innerHTML = "<i class='fa fa-volume-off'></i>";
						break;
				} 
			};
			document.onmouseup = function() { 
				document.onmousemove = null; 
				document.onmouseup = null;  
			}
			return false;//preventDefault(event);
		}; 
		slience.onclick=function(){
			player.muted = !player.muted; 
			if(player.muted) { 
				mutepos=voice_volume.offsetWidth; 
				voice_volume.style.width = 0 + "px";
				voice_btn.style.left = 0 + "px"; 
				slience.innerHTML = "<i class='fa fa-volume-off'></i>";
			}else{
				if(mutepos!=-1)
				{
					voice_volume.style.width = mutepos + "px";
					voice_btn.style.left = mutepos + "px";
				}
				slience.innerHTML = "<i class='fa fa-volume-up'></i>";
			}
		};
		fullscreen.onclick=function(){  
			if(document.fullscreenElement|| document.webkitFullscreenElement)
			{
				document.webkitExitFullscreen();
				controltimeout=8;
			}
			else
			{
				document.getElementById("ppeasymediaplayer").webkitRequestFullScreen();
				screen.orientation.lock("landscape-primary");
				controltimeout=8;
			}
		};
		
		document.getElementById("ppeasylgplay").onclick=player.onclick=curtime.parentNode.childNodes[0].onclick=function(){
			//play
			if(!playerstart && adtick.parentNode.style.display=='none') 
			{
				adtick.parentNode.style.display="block";
				playerstart=1;
				player.play();
				document.getElementById("ppeasylgplay").style.display="none";
			}
			if(adtick.parentNode.style.display!="none")
			{
				return;
			}
			if (player.ended === true||player.paused)
			{ 
				player.play();
				setplaystate(1);
			}
			else{				
				player.pause();
				setplaystate(0);
			}
			//togglestate();
		}
		controls.onmouseover=function(){			
			if(adtick.parentNode.style.display=="none")
			{
				controltimeout=0;
				controls.style.display="block";
			}
		}
		controls.onmouseout=function(){
			if(adtick.parentNode.style.display=="none")
				controltimeout=8;
		}
		player.onmouseover=function(){		
			if(playerstart)
			if(adtick.parentNode.style.display=="none")
			{
				controltimeout=0;
				controls.parentNode.style.display="block";
			}
		}
		player.onmouseout=function(){
			if(playerstart)
			if(adtick.parentNode.style.display=="none")
			controltimeout=8;
		}
		player.onplay=function(){ 
			playerstart=1;
			if(adtick.parentNode.style.display=="none"){
				//player.muted=false;
				controls.parentNode.style.display="block";
				controltimeout=8;
				setplaystate(1);
			}
			//alert(curtime.parentNode.childNodes[0].childNodes[0].outerHTML);
		};
		play_progress.onclick=function(){
			var pos = play_progress.getBoundingClientRect(); 
			var curPlay =event.clientX-pos.left, 			 
				progress_list_width = pos.width; 
			var newLocation = curPlay / progress_list_width * player.duration;			
			player.currentTime = newLocation;			
			document.getElementById("play-progress").style.width = curPlay + "px";
		};
		if(para.adVideoPath){ 
			player.src=playpara.adVideoPath; 
			player.play();
		}else{
			adtick.parentNode.style.display='none';
			playerstart=1;
			player.src="http://127.0.0.1:1960/play/"+playpara.videoPath.substring(7);
			player.play();
			
		}
		var adint=setInterval(function(){ 
			if(!playerstart) return;
			if(controltimeout) 
			{
				controltimeout--;
				if(controltimeout==0){
					controls.parentNode.style.display="none";
				}
			}
			if(adtick.parentNode.style.display!="none"){
				var t=parseInt(document.getElementById("adtick").innerHTML)-1;	
				if(t==0){
					player.muted=false;
					player.src="http://127.0.0.1:1960/play/"+playpara.videoPath.substring(7);
					player.play();
					document.getElementById("adtick").parentNode.style.display="none";
					controls.parentNode.style.display="block";
					
					setplaystate(0);
				}else
					document.getElementById("adtick").innerHTML=t;
			}
			else
			{ 
				var pos = play_progress.getBoundingClientRect();
				if(!isNaN(player.currentTime))
				{
					var cur = Math.floor(player.currentTime); 
					var min=Math.floor(cur/60)%60;
					var hour=Math.floor(cur/3600);
					cur=(hour<10?("0"+hour):hour)+":"+(min<10?("0"+min):min)+":"+(((cur%60)<10)?("0"+(cur%60)):(cur%60)); 
					curtime.innerHTML = cur;
				}
				if(!isNaN(player.duration))
				{
					var cur = Math.floor(player.duration); 
					var min=Math.floor(cur/60)%60;
					var hour=Math.floor(cur/3600);
					cur=(hour<10?("0"+hour):hour)+":"+(min<10?("0"+min):min)+":"+(((cur%60)<10)?("0"+(cur%60)):(cur%60)); 
					duration.innerHTML = cur;
				} 
				if (player.ended === true) 
				{
					setplaystate(0); 
					//player.stop();
					//btn.innerHTML = "<i class='fa fa-play'></i>";
				}
				document.getElementById("play-progress").style.width = player.currentTime * pos.width / player.duration + "px";
			}
			
		},1000);
	} 
	return {play:play };
})();