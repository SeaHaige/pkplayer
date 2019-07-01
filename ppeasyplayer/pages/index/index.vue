<template>
    <view>
	<video id="myVideo" :src="videoUrl" style="width:100%" :autoplay="autoPlay"
                    @error="videoErrorCallback"  controls
					 ></video> 
	<view>
		<radio-group @change="radioChange">
	    <label class="radio"><radio value="r1" checked="true" />点播</label>
	    <label class="radio"><radio value="r2" />直播</label>
		</radio-group>
	</view>
	<text>播放地址 ：</text>
	<input type="text" style="width:100%;border:1px solid gray;"
                @input="onKeyUserNameInput"     placeholder="请输入播放地址"  /> 
	
	<button :id="index" @tap="btn">播放</button> 
	
	<text>提示：请先前往http://www.p2pdownload.cn:8000/,注册并进行域名绑定，验证域名后，进行P2P播放。</text>
    </view> 
</template>

<script>
	var curl="";
	export default { 
		data() {
			return {
				current:0,
				autoPlay:false,
				videoUrl:"https://img-cdn-qiniu.dcloud.net.cn/uniapp/doc/uni-app20190127.mp4" 
			}
		},
		onReady() {
			this.videoContext = uni.createVideoContext('myVideo');
		},  
		onLoad() {
		},
		methods: { 
			onKeyUserNameInput: function(event) {  
                curl = event.target.value ; 
            },  
			radioChange: function(evt) {
				if (evt.target.value=="r1") this.current=0;
				if (evt.target.value=="r2") this.current=1;
			},
			btn:function(e){ 
				
				
				if(this.current==0){
					console.log("video:",curl);   
					this.videoUrl=this.p2pvideo(curl);
				}
				else{
					console.log("live:",curl);   
					this.videoUrl=this.p2plive(curl);
				}
				this.autoPlay=true; 
			},
			videoErrorCallback: function(e) {
				 
			}

		}
	}
</script>

<style>
	.content {
		text-align: center;
		height: 400upx;
	}

	.logo {
		height: 200upx;
		width: 200upx;
		margin-top: 200upx;
	}

	.title {
		font-size: 36upx;
		color: #8f8f94;
	}
</style>
