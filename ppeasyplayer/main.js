import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

App.mpType = 'app'

uni.setStorageSync('ppeasy_p2penable', 1);
Vue.prototype.p2penable=function(inurl){  
	var f=0; 
	f=uni.getStorageSync('ppeasy_p2penable'); 
	return f;
}   
if( Vue.prototype.p2penable()) 
{
	const ppeasySerivce = uni.requireNativePlugin('PPeasy-P2P');   
	ppeasySerivce.start();   
	var savestate=Vue.prototype.p2penable();
	uni.setStorageSync('ppeasy_p2penable', 0);
	uni.request({
		url: 'http://127.0.0.1:1960/?Action=clear', 
		success:  (res) => {  			
			if(savestate)
			{				 
				uni.setStorageSync('ppeasy_p2penable', 1);  
			}
		},
	});
}
Vue.prototype.p2plive=function(inurl){
	 
	if(!Vue.prototype.p2penable())
	return inurl;
 	var playhandle=1000;  
 	 		
	playhandle=uni.getStorageSync('playhandle');
	if(playhandle==0) playhandle=1000; 
 	playhandle++; 
 	uni.setStorageSync('playhandle', playhandle); 
	if(inurl.substring(0,5)=="https")
	return "http://127.0.0.1:1960/playssl/"+(playhandle-1)+"/"+inurl.substring(8);
	else
 	return "http://127.0.0.1:1960/play/"+(playhandle-1)+"/"+inurl.substring(7);
 };
Vue.prototype.p2pvideo=function(inurl){ 
	if(!Vue.prototype.p2penable() )
	return inurl;
	var playhandle=1000;  
	playhandle=uni.getStorageSync('playhandle');
	if(playhandle==0) playhandle=1000; 
	playhandle++;  
	uni.setStorageSync('playhandle', playhandle); 
	if(inurl.substring(0,5)=="https")
	return "http://127.0.0.1:1960/videossl/"+(playhandle-1)+"/"+inurl.substring(8);
	else
	return "http://127.0.0.1:1960/video/"+(playhandle-1)+"/"+inurl.substring(7);

};

const app = new Vue({
    ...App
})
app.$mount()
