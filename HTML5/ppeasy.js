
PPeasyService=(function(){
var localConnection=null; 
var sendChannel=null;
var websock1=null;
var remoteice=[]; 
var userid=0; 
var remoteid=0;
var channelOpened=0;
var websocketuserid=0;
var opcode="";
var findkeyoff=48*1024; 
var _this16=null;
var sendflag=0; 
let p2pfindres=0; 
var sendplayurl=null;
var lastplayurl=null;
var b1=0;
var b2=0;
var b3=0;
var disablep2pupload=0;
var send_net_type;
// 0 httpbuf 1 webbuff  2 webbuff->httpbuff 3 httpbuf
// 5 p2pbuf(httpbuff->p2pbuf) 6 p2pbuff->webbuff 
// 9 httpbuff(httpbuff->p2pbuf) 7 p2pbuf->httpbuff
 
function FifoBuffer()
{
	this.buff=new ArrayBuffer(1024*1024);
	this.UsedLength=0;
	this.FifoLength=0;
	this.startoffset=0;
	this.sendoffset=0;
	this.stampoff=0;
	this.clear=function(){
		this.UsedLength=0;
		this.FifoLength=0; 
	}
	this.total=function(){
		return this.UsedLength+this.FifoLength;
	}
	this.find=function (keystr,rtn){
		var key1=parseInt(keystr.substring(0,2),16);
		var key2=parseInt(keystr.substring(2,4),16);
		var key3=parseInt(keystr.substring(4,6),16);
		var key4=parseInt(keystr.substring(6,8),16);
		var httpArray=new Uint8Array(this.buff,0,this.UsedLength);
		for(var k=0;k<this.UsedLength-4;k++)
			if(httpArray[k]==key1 && httpArray[k+1]==key2 && httpArray[k+2]==key3 && httpArray[k+3]==key4){
				//console.log("find result 1:",k,this.UsedLength);
				rtn.num++;
				rtn.pos=k;
			} 
	}
	this.add=function(data){
		//var eventArray = ; 
		var httpArray = new Uint8Array(this.buff, 0, this.buff.byteLength); 
		if(this.UsedLength+data.byteLength>1024*1024){ 
			var p2pArray2 = new Uint8Array(this.buff, 256*1024, this.buff.byteLength-256*1024); 
			httpArray.set(p2pArray2,0); 
			this.UsedLength-=256*1024;
			this.FifoLength+=256*1024;
		} 
		httpArray.set(new Uint8Array(data, 0, data.byteLength),this.UsedLength); 
		this.UsedLength+=data.byteLength;   
	};
	this.stamp=function(startoffset,stampvalueoff)
	{
		if(this.startoffset==0){ 
			this.startoffset=this.findflvheaderstart(); 
			//console.log("startoffset:",this.startoffset,this.stampoff);
		}
		var p2pArray = new Uint8Array(this.buff, 0, this.buff.byteLength);
		var off;
		off=this.startoffset; 
		while(off<this.FifoLength+this.UsedLength){
			var off2=off-this.FifoLength;
			if(off2>=0 && off2+6<this.UsedLength){
				//console.log("stamp data:",off2+this.FifoLength);
				var curp2pstamp=p2pArray[off2+4]*256*256+p2pArray[off2+5]*256+p2pArray[off2+6]; 
				if(p2pArray[off2+0]!=9 &&p2pArray[off2+0]!=8)
				console.log("stamperrinfo:",this.startoffset,off-this.startoffset
					,buf2hex(this.buff.slice(off2,off2+10)),curp2pstamp,stampvalueoff,curp2pstamp+stampvalueoff);
				curp2pstamp+=stampvalueoff;
				p2pArray[off2+4]=curp2pstamp/(256*256);
				p2pArray[off2+5]=(curp2pstamp/256)%256;
				p2pArray[off2+6]=(curp2pstamp)%256;
			}else break;
			off+=p2pArray[off2+1]*256*256+p2pArray[off2+2]*256+p2pArray[off2+3]+11+4;
		}
		return off;
	};
	this.getflvflag=function(off2){ 
		return new Uint8Array(this.buff, off2, 1)[0]; 
	};
	this.iskeyflvflag=function(off2){ 
		if(off2>=0 && off2+13<this.UsedLength )
		{
			var headerarr=new Uint8Array(this.buff, off2, 13);
			var flag=headerarr[0]; 
			if(headerarr[8]==0&&headerarr[9]==0&&headerarr[10]==0
				&&headerarr[11]==0x17&&headerarr[12]==0x1
				)
			return headerarr[0]==9;
		}
		return 0;
	};
	this.isflvflag=function(off2){ 
		if(off2>=0 && off2+11<this.UsedLength )
		{
			var headerarr=new Uint8Array(this.buff, off2, 11);
			var flag=headerarr[0]; 
			if(headerarr[8]==0&&headerarr[9]==0&&headerarr[10]==0)
			return headerarr[0]==8 || headerarr[0]==9;
		}
		return 0;
	};
	this.getflvstamp=function(off2){
		var p2pArray = new Uint8Array(this.buff, 0, this.buff.byteLength);
		return p2pArray[off2+4]*256*256+p2pArray[off2+5]*256+p2pArray[off2+6]; 
	};
	this.getflvlen=function(off2){
		var p2pArray = new Uint8Array(this.buff, 0, this.buff.byteLength);
		return p2pArray[off2+1]*256*256+p2pArray[off2+2]*256+p2pArray[off2+3]; 
	};
	this.findflvheaderstart=function(){
		var httpArray = new Uint8Array(this.buff, 0, this.buff.byteLength); 
		for(var k=4;k<this.UsedLength-10;k++){
			if ((httpArray[k]==9||httpArray[k]==8) && httpArray[k+8]==0 && httpArray[k+8+1]==0 && httpArray[k+8+2]==0 && (k<4 || k>=4 && httpArray[k-4]==0))
			{ 
				return k+this.FifoLength; 
			}			
		}
		return 0;
	};
	this.findnextflvheader=function(off){
		var httpArray = new Uint8Array(this.buff, 0, this.buff.byteLength); 
		off-=this.FifoLength;
		if(off-3>=0){
			var nextlen=httpArray[off-1]+httpArray[off-2]*256+httpArray[off-3]*256*256;
			off-=nextlen+4;
			return off+this.FifoLength;
		}
		return 0;
	};
	this.findflvheader=function(){
		var httpArray = new Uint8Array(this.buff, 0, this.buff.byteLength); 
		for(var k=this.UsedLength-12;k>0;k--){
			if ((httpArray[k]==9||httpArray[k]==8) && httpArray[k+8]==0 && httpArray[k+8+1]==0 && httpArray[k+8+2]==0 && (k<4 || k>=4 && httpArray[k-4]==0))
			{ 
				return k+this.FifoLength; 
			}			
		}
		return 0;
	};
	
	this.switchdata=function(buff){
		this.FifoLength=buff.FifoLength+buff.UsedLength;
		this.startoffset=buff.findflvheader();
		if(this.startoffset+4<buff.total())
		{
			var len3=buff.getflvlen(this.startoffset-buff.FifoLength);
			this.startoffset+=len3+11+4; 
		}
		this.sendoffset=this.FifoLength;
	};

	this.fetch=function(){
		this.startoffset=this.stamp(this.startoffset,this.stampoff); 
		var off=this.sendoffset-this.FifoLength;
		var destlen=this.UsedLength;
		if(destlen>this.startoffset-this.FifoLength) 
			destlen=this.startoffset-this.FifoLength;
		if(off>=0 && off<destlen){   
			if(destlen-off>10*2048){
				//console.log("large block:",destlen-off);
			}
			_this16._onDataArrival(this.buff.slice(off,destlen),_this16._receivedLength,_this16._receivedLength+destlen-off);
			_this16._receivedLength+=destlen-off;
			this.sendoffset+=destlen-off; 
		}
	};		
}
httpbuff=new FifoBuffer;
p2pbuff=new FifoBuffer;
webbuff=new FifoBuffer; 
websocketstartpos=0;
var iplist=[];
var net_type=0; 
{	
	localConnection2 = new RTCPeerConnection({ iceServers: [{ urls: PPeasy_Config.stun1 },{ urls: PPeasy_Config.stun2 }] }); 
	localConnection2.onicecandidate = 
		function onIceCandidate( ice) { 
		if(ice.candidate!=null)
		{  
			var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;    
			var ip_addr = ip_regex.exec(ice.candidate.candidate)[1];
			//if (!ip_addr.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/))   
			if(ice.candidate.candidate.indexOf("typ host")<0)
			{
				if(net_type==0) net_type=3;
				for(var k=0;k<iplist.length;k++)
					if(iplist[k]==ip_addr)
					{						
						net_type=1;
					}
				iplist.push(ip_addr);
				console.log("ipaddrEx:",ip_addr);
				if(iplist.length>1){
					net_type=2;					
				}
			}
			else
				console.log("ipaddr:",ip_addr);
		}
	};
	localConnection2.createDataChannel("");
	localConnection2.createOffer().then(function (desc) {
		localConnection2.setLocalDescription(desc, function () { }, function () { });    
	});	
}
function init_connect(){
	closeDataChannels();
	remoteice=[];
	localConnection = new RTCPeerConnection({ iceServers: [{ urls: PPeasy_Config.stun1 },{ urls: PPeasy_Config.stun2}] }); 
	localConnection.onicecandidate = 
		function onIceCandidate( event) {  
			if(event.candidate!=null && remoteid)
			{  		  
				websock1.send("i,"+remoteid+","+userid+","+JSON.stringify(event.candidate)); 
				setTimeout(function(){
					websock1.send("a,0,"+userid+","+remoteid);
				},1000); 
			}
	};
	localConnection.ondatachannel = receiveChannelCallback; 
}
function createConnection(peerid) {
  remoteid=peerid; 
  p2pLive=timerVal;
  init_connect(); 
  sendChannel = localConnection.createDataChannel('sendDataChannel', {ordered: true});
  sendChannel.binaryType = 'arraybuffer'; 
  sendChannel.onopen = onChannelStateChange;
  //sendChannel.onclose = onChannelStateChange;
  sendChannel.onmessage = onReceiveMessageCallback;
  localConnection.createOffer().then(function (desc) { 
	  localConnection.setLocalDescription(desc);
	  websock1.send("n,"+remoteid+","+userid+","+JSON.stringify(desc));
	});
}   

 
function closeDataChannels() {
	if(sendChannel!=null){
		sendChannel.close(); 
		sendChannel=null;
	}
	if(localConnection==null) return;
	localConnection.close();
	localConnection = null;
	sendflag=0;	
	channelOpened=0;
} 
var timerVal=0; 

window.addEventListener('unload', function(){
	websock1.send("x,0,"+userid+",");	
});
function connect(){
	websock1= new WebSocket(PPeasy_Config.server); 
	websock1.binaryType = "arraybuffer";
	websock1.onclose = function(event) { 						
		setTimeout(function(){send_net_type=0; connect()},3000);
	};
	websock1.onopen=function(event){
		console.log("connected ");
	};
	websock1.onmessage = function(event) {		
		if(typeof event.data=="object"){
			if(p2pfindres==1 || p2pfindres==2||p2pfindres==8){
				webbuff.add(event.data);  
				webbuff.fetch();  				 
			}  
			else
			{
				websock1.send("x,0,"+userid);
			} 
		}
		if(typeof event.data=="string"){			
			var startid=event.data.indexOf(",")+1;
			var opcode=event.data.substring(0,startid-1);
			var nextid=event.data.indexOf(",",startid)+1;
			var lastid=event.data.indexOf(",",nextid)+1;
			var	destid=event.data.substring(nextid,event.data.indexOf(",",nextid));
			var messageid=event.data.indexOf(",",nextid+1)+1;						
			destid=parseInt(destid);			 
			var messagebody=event.data.substring(messageid);
			if(opcode=="u")
			{
				var messagedestid=parseInt(event.data.substring(startid,nextid-1));				
				userid=messagedestid;
				websock1.send("p,0,"+userid+","+messagebody);
				console.log("set userid:",userid,net_type); 				
			}   
			if(opcode=="w")
			{		 
				if(messagebody=="http"){
					if(p2pfindres==1){
						_this16.open(_this16._dataSource,_this16._range); 
						httpbuff.clear();
						p2pfindres=2;
					}else
					if(p2pfindres==5){
						httpbuff.clear();
						_this16.open(_this16._dataSource,_this16._range); 
						p2pfindres=7;
						//closeDataChannels();
						//remoteid=0;
					}else
					{
						console.log("error switch 1",p2pfindres);
					}
				}
				if(messagebody=="p2p"){
					if(p2pfindres==0){			
						p2pbuff.clear();
						createConnection(destid); 
					}else
					if(p2pfindres==3)
					{ 
						p2pbuff.clear();
						createConnection(destid);
						p2pfindres=9;					
					}else
					if(p2pfindres==1)
					{ 
						p2pbuff.clear();
						createConnection(destid);
						p2pfindres=8;
					}
					else{
						console.log("error switch 2",p2pfindres);
					}
				}
				if(messagebody=="websocket"){
					if(p2pfindres==5)
					{ 
						p2pfindres=6; 
						var startpos=p2pbuff.UsedLength-findkeyoff; 
						var stamp=p2pbuff.getflvstamp(p2pbuff.findflvheader()-p2pbuff.FifoLength);
						websock1.send("f"+","+destid+","+userid+","
							+p2pbuff.UsedLength+" "+p2pbuff.FifoLength+" "
							+p2pbuff.findflvheader()+" "+stamp+" "
							+startpos+" "+buf2hex(p2pbuff.buff.slice(startpos,startpos+4))
							); 
						closeDataChannels();
						webbuff.clear();
					}else{
						console.log("error switch 3",p2pfindres);
					}
				}
			}  
			if(0)
			if(opcode=="f")
			{ 
				if(p2pfindres==0 || p2pfindres==3){
					var rtn={num:0,pos:0};
					httpbuff.find(messagebody.split(" ")[5],rtn);
					if(rtn.num==1){
						websocketuserid=destid;
						websocketstartpos=httpbuff.FifoLength+rtn.pos+findkeyoff;		
						websock1.send("r,0,"+userid+","+destid);				
						var ulen=parseInt(messagebody.split(" ")[0]);
						var flen=parseInt(messagebody.split(" ")[1]);
						var voff=parseInt(messagebody.split(" ")[2]);
						var vstamp=parseInt(messagebody.split(" ")[3]);
						voff+=(websocketstartpos-ulen-flen);
						voff-=httpbuff.FifoLength;
						if(voff>=0 && voff<httpbuff.UsedLength)
						{
							websock1.send("r,"+destid+","+userid+","+(vstamp-httpbuff.getflvstamp(voff)));													
						}
					}
				}
				else{
					console.log("error state");
				}
			}  
			if(opcode=="r")
			{
				if(p2pfindres==6){
					webbuff.stampoff=parseInt(messagebody); 
					webbuff.switchdata(p2pbuff); 
					p2pfindres=1; 				


					_this16.open(_this16._dataSource,_this16._range); 
					httpbuff.clear();					
					p2pfindres=2;
					//console.log("switch2 http");
				}
				else{ 
					console.log("error find response"); 
				}								 
			}
			if(opcode=="a")
			{	 
				while(remoteice.length)
				{			
					localConnection.addIceCandidate(JSON.parse(remoteice.shift()));
				}			 
			}
			if(opcode=="i")
			{				 
				remoteice.push(messagebody);
			}
			if(opcode=="d")
			{ 
				localConnection.setRemoteDescription(JSON.parse(messagebody));
			}
			if(opcode=="n")
			{
				remoteid=destid;				
				p2pLive=timerVal;
				init_connect();   
				localConnection.setRemoteDescription(JSON.parse(event.data.substring(messageid)));
				localConnection.createAnswer().then(
					function (desc) {
					  localConnection.setLocalDescription(desc);
					  websock1.send("d,"+destid+","+userid+","+JSON.stringify(desc));
					}
				);
			}
		}
	};
}

function init_server_connect()
{
	setInterval(function (){
		timerVal++;
		if(userid){
			if(timerVal>10 && send_net_type!=net_type){
				send_net_type=net_type;
				websock1.send("t,0,"+userid+","+net_type);
			} 
			if((timerVal%5)==0 && timerVal>10){ 
				//console.log("state:",p2pfindres);			
				websock1.send("s,0,"+userid+","+p2pfindres+","+b1+","+b2+","+b3); 
				b1=0;b2=0;b3=0;
			}
		}
		if(disablep2pupload==0)
		if(sendChannel!=null && channelOpened && sendChannel.readyState=="open")
		{ 
			sendChannel.send('t');
		} 
		if(timerVal-p2pLive>4 && sendChannel!=null && channelOpened &&  remoteid)
		{
			if(p2pfindres==5)
			{  
				httpbuff.clear();
				_this16.open(_this16._dataSource,_this16._range); 
				p2pfindres=7;
				closeDataChannels();
				remoteid=0; 
			}else
			if(p2pfindres==0||p2pfindres==3)
			{
				closeDataChannels();
				remoteid=0;
			}else{ 
				console.log("skip change state:",p2pfindres);
			}
		} 
	},200);
	connect();
}  
 
init_server_connect();
function receiveChannelCallback(event) { 
  sendChannel = event.channel;
  sendChannel.binaryType = 'arraybuffer';
  sendChannel.onmessage = onReceiveMessageCallback;
  //sendChannel.onclose = onChannelStateChange;
  sendChannel.onopen = onChannelStateChange;
  sendflag=1;
} 
var p2pLive=0;  
function onReceiveMessageCallback(event){ 
	
	if(typeof event.data=='string'){ 
		p2pLive=timerVal;
		return;
	}
	b2+=event.data.byteLength; 
	if(p2pfindres==6 ||p2pfindres==3) return; 
	if(p2pbuff.UsedLength-findkeyoff>0 
		&& (p2pfindres==0 || p2pfindres==9 || p2pfindres==8))
	{   
		if(p2pfindres==8){
			var rtn={num:0,pos:0};
			var startpos=p2pbuff.UsedLength-findkeyoff;
			webbuff.find(buf2hex(p2pbuff.buff.slice(startpos,startpos+4)),rtn);
			if(rtn.num==1)
			{
				var offres=startpos+p2pbuff.FifoLength-(rtn.pos+webbuff.FifoLength);
				var startoff=webbuff.findflvheader();//httpfindflvheaderoff;
				while(1){ 
					var off2=startoff-webbuff.FifoLength;
					var movelen=webbuff.getflvlen(off2-4);
					var off=startoff+offres-p2pbuff.FifoLength;  
					if(off>=4 && off<p2pbuff.UsedLength-12
						&& (webbuff.isflvflag(off2))
						&& (p2pbuff.isflvflag(off)) 
						&& p2pbuff.getflvlen(off)==webbuff.getflvlen(off2)
						)
					{
						
						p2pbuff.startoffset=0;//off+p2pbuff.FifoLength;  
						p2pbuff.stampoff= webbuff.getflvstamp(off2)-p2pbuff.getflvstamp(off); 
						p2pbuff.sendoffset=webbuff.UsedLength+webbuff.FifoLength+offres; 
						p2pfindres=5;   
					}  
					if(off<4) break;
					if(movelen<=0) break;
					startoff-=movelen+4;
				} 
			}
		}
		else{
			var rtn={num:0,pos:0};
			var startpos=p2pbuff.UsedLength-findkeyoff;
			httpbuff.find(buf2hex(p2pbuff.buff.slice(startpos,startpos+4)),rtn);
			if(rtn.num==1)
			{
				var offres=startpos+p2pbuff.FifoLength-(rtn.pos+httpbuff.FifoLength);
				var startoff=httpbuff.findflvheader();//httpfindflvheaderoff;
				while(startoff>100){ 
					var off2=startoff-httpbuff.FifoLength;
					var movelen=httpbuff.getflvlen(off2-4);
					var off=startoff+offres-p2pbuff.FifoLength;  
					if(off>=4 && off<p2pbuff.UsedLength-12
						&& httpbuff.isflvflag(off2)
						&& p2pbuff.isflvflag(off)
						&& p2pbuff.getflvlen(off)==httpbuff.getflvlen(off2)
						)
					{
						var soff=httpbuff.UsedLength+httpbuff.FifoLength+offres; 
						{
							p2pbuff.startoffset=0;  
							p2pbuff.stampoff=httpbuff.getflvstamp(off2)-p2pbuff.getflvstamp(off); 
							p2pbuff.sendoffset=soff; 
							p2pfindres=5;   
						}
					}  
					if(off<4) break;
					if(movelen<=0) break;
					startoff-=movelen+4;
				}
				if(p2pfindres==5) 
				{
					_this16.abort();
					console.log("stampoff3:" ,p2pfindres); 
				}
			}
		}
	} 
	p2pbuff.add(event.data);
	if(_this16!=null && _this16._onDataArrival &&  (p2pfindres==5||p2pfindres==6||p2pfindres==7)){
		p2pbuff.fetch();
	}
}
function buf2hex(buffer) { 
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
} 
function onReceiveHTTPBufferCallback(data) {
	b1+=data.byteLength;
	if(sendplayurl!=null && userid){ 				
		websock1.send("u,0,0,"+sendplayurl);
		sendplayurl=null;		
	}
	if(p2pfindres) 
	{
		if(p2pfindres==2 || p2pfindres==3||p2pfindres==9||p2pfindres==7) 
		{ 
			httpbuff.add(data);
			if(0)
			if(p2pfindres==3 && websocketuserid!=0){
				if(websocketstartpos-httpbuff.FifoLength>=0 && websocketstartpos-httpbuff.FifoLength<httpbuff.UsedLength)
				{ 
					websock1.send(httpbuff.buff.slice(websocketstartpos-httpbuff.FifoLength,httpbuff.UsedLength));
					websocketstartpos=httpbuff.UsedLength+httpbuff.FifoLength;
				} 
			}
			if(disablep2pupload==0)
			if(p2pfindres==3 && sendChannel!=null && sendflag && sendChannel.readyState=="open")
			{ 
				b3+=data.byteLength;
				try{			
					sendChannel.send(data);
				}catch(err){}
			} 
		} 
		if(p2pfindres==7&&p2pbuff.UsedLength>findkeyoff)//120*1024
		{
			var destbuff=p2pbuff; 
			var off2=findkeyoff;			
			var flvheaderoffset=httpbuff.findflvheader();
			var headeroffset=flvheaderoffset;
			while(p2pfindres==7 && flvheaderoffset//&& off2<110*1024 
				){ 
				var rtn={num:0,pos:0};
				httpbuff.find(buf2hex(destbuff.buff.slice(destbuff.UsedLength-off2
					,destbuff.UsedLength-off2+4)),rtn);  	
				 
				if(rtn.num!=1)
				{
					off2-=100;
					httpbuff.find(buf2hex(destbuff.buff.slice(destbuff.UsedLength-off2
						,destbuff.UsedLength-off2+4)),rtn);  
				}
				if(rtn.num==1){ 
					var byteoffset=rtn.pos+httpbuff.FifoLength-(destbuff.UsedLength-off2+destbuff.FifoLength);
					
					var flvheaderpos=flvheaderoffset-httpbuff.FifoLength;
					var webheaderpos=flvheaderoffset-byteoffset-destbuff.FifoLength;
					 
					if(httpbuff.isflvflag(flvheaderpos) 
						&& destbuff.isflvflag(webheaderpos)
						&& destbuff.getflvlen(webheaderpos)==httpbuff.getflvlen(flvheaderpos)
						){
						console.log("find key flv",httpbuff.total());						
						httpbuff.sendoffset=httpbuff.FifoLength+rtn.pos+off2; 
						httpbuff.stampoff=destbuff.getflvstamp(webheaderpos)-httpbuff.getflvstamp(flvheaderpos);
						//if(httpbuff.stampoff) 
						httpbuff.startoffset=0;
						if(p2pfindres==7 && remoteid){
							closeDataChannels();
							remoteid=0; 
						} 
						p2pfindres=3;  
					}else{
						//httpbuff.isflvflag(flvheaderpos);
						//destbuff.isflvflag(webheaderpos);
					}
				}else break;
				flvheaderoffset=httpbuff.findnextflvheader(flvheaderoffset);				
			}
			flvheaderoffset=headeroffset;
			var findkey=0;
			while(flvheaderoffset){
				if(httpbuff.iskeyflvflag(flvheaderoffset)){
					findkey++;
				}
				flvheaderoffset=httpbuff.findnextflvheader(flvheaderoffset);	
			}
			//console.log("find key2:",findkey);
			if(findkey>2){
				console.log("reopen stream!!!!!!!!!!!!!!");
				httpbuff.clear();
				p2pfindres=0;
				flvPlayer.unload();
				flvPlayer.load();
				flvPlayer.play();				
			}
		}
		if(p2pfindres==2|| p2pfindres==127){ 
			var off2=findkeyoff; 
			var rtn={num:0,pos:0};
			var destbuff=webbuff;
			if(p2pfindres==7)
			{
				destbuff=p2pbuff;
				//startpos=p2pbuff.UsedLength-findoff;
				httpbuff.find(buf2hex(p2pbuff.buff.slice(destbuff.UsedLength-off2,destbuff.UsedLength-off2+4))				,rtn); 
			}
			else{
				httpbuff.find(buf2hex(destbuff.buff.slice(destbuff.UsedLength-off2,destbuff.UsedLength-off2+4))				,rtn);
				
			}
			
			if(rtn.num==1){
				var rtn2={num:0,pos:0};
				httpbuff.find(buf2hex(destbuff.buff.slice(destbuff.UsedLength-off2+4,destbuff.UsedLength-off2+8)),rtn2);
				//console.log("find result7",rtn.pos,rtn2.pos);
				//console.log("stampoff8:" ,p2pfindres);
				httpbuff.sendoffset=httpbuff.FifoLength+rtn.pos+off2;
				//_cmpstart=httpsendoffset;
				var byteoffset=rtn.pos+httpbuff.FifoLength-(destbuff.UsedLength-off2+destbuff.FifoLength);
				var flvheaderoffset=httpbuff.findflvheader();
				var flvheaderpos=flvheaderoffset-httpbuff.FifoLength;
				var webheaderpos=flvheaderoffset-byteoffset-destbuff.FifoLength;
				if(flvheaderoffset<httpbuff.sendoffset 
					&& webheaderpos+8<destbuff.UsedLength  && webheaderpos>=0
					&& flvheaderpos+8<httpbuff.UsedLength && flvheaderpos>=0
					&& webheaderpos+8+destbuff.FifoLength<destbuff.startoffset
					){
					httpbuff.stampoff=destbuff.getflvstamp(webheaderpos)
						-httpbuff.getflvstamp(flvheaderpos);
					if(httpbuff.stampoff)
					{
						httpbuff.startoffset=0;
						if(p2pfindres==7 && remoteid){
							closeDataChannels();
							remoteid=0;
						}
						p2pfindres=3;
						//console.log("set state 3",httpbuff.sendoffset,performance.now(),httpbuff.stampoff,httpbuff.total());
						//websock1.send("h,0,"+userid+",");
					}
					//console.log("stampoff1:" ,p2pfindres);
				}
			} 
		}
		
		if(p2pfindres==3||p2pfindres==9){  
			httpbuff.fetch();			
		}
		
		return;
	} 
	if(p2pfindres==0)
		httpbuff.add(data);
	if(0)
	if(websocketuserid!=0){
		if(websocketstartpos-httpbuff.FifoLength>=0 && websocketstartpos-httpbuff.FifoLength<httpbuff.UsedLength)
		{ 
			websock1.send(httpbuff.buff.slice(websocketstartpos-httpbuff.FifoLength,httpbuff.UsedLength));
			websocketstartpos=httpbuff.UsedLength+httpbuff.FifoLength;
		} 
	}
	if(disablep2pupload==0)
	if(sendChannel!=null && sendflag && sendChannel.readyState=="open")
	{ 
		b3+=data.byteLength;
		try{			
			sendChannel.send(data);
		}catch(err){}
	} 
}


function onChannelStateChange() {
	console.log("onopened data channel");
	channelOpened=1;
	p2pLive=timerVal;
	return;
	const readyState = sendChannel.readyState; 
	if (readyState === 'closed') { 

	if(p2pbuff.UsedLength){
	}
	else
	{
		sendflag=0;
	}
	}
}
	function setObject(obj,url){
		if(_this16==null)		_this16=obj;		
		if(lastplayurl!=url){
			lastplayurl=url;
			sendplayurl=url;
		}
	}
	function getState(){return p2pfindres;}
	return { 
		setObject:setObject,
		getState:getState,
		onReceiveHTTPBufferCallback:onReceiveHTTPBufferCallback
	};
})();