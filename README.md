pkplayer是一个P2P播放器，支持Android、IOS平台。

基于ppeasy开发，P2P方式直播或点播，观众越多,播放越流畅。

网络通信（内网穿透）的模块，使用ppeasy（P2P传输SDK），其特点是无需架设穿透服务器，用户之间直接进行数据的交换。


## Features
- 支持HTTP/HTTPS文件的在线P2P播放
- 点播文件类型支持MP4,FLV,M3U8文件
- 直播支持HLS/Rtmp/Http-Flv直播协议，具有低延迟、流畅的特点
- SDK支持Android/IOS/Windows/Linux等平台
- 添加了uni-app程序的支持
- 支持web网页调用，底层使用webrtc传输，无需安装任何插件

网页调用方式

  1)在网页中可以使用Iframe方式进行调用p2p播放器，  
  https://p2pdownload.cn/?nogui=2&url=
  在url=后面输入真实https://*.m3u8形式的播放地址
  注：如果需要启动自动播放方式，需要添加iframe属性 allow="autoplay"
  
  2)在苹果CMS10.0中调用p2p播放器
  使用"iframe外链数据"播放器,播放器代码更改为
  MacPlayer.Html = '<iframe width="100%" height="100%" src="https://p2pdownload.cn/?nogui=2&url='+MacPlayer.PlayUrl+'" frameborder="0" border="0" marginwidth="0" marginheight="0" scrolling="no" allowfullscreen="allowfullscreen" mozallowfullscreen="mozallowfullscreen" msallowfullscreen="msallowfullscreen" oallowfullscreen="oallowfullscreen" webkitallowfullscreen="webkitallowfullscreen" allow="autoplay"></iframe>';
  MacPlayer.Show();
	在"src="后添加"https://p2pdownload.cn/?nogui=2&url=" ,iframe添加属性allow="autoplay"
	
  注：ppeasy免费版提供每日p2p流量50G，超出限制后，播放器将使用普通播放器功能正常播放，如需使用更多流量登录https://p2pdownload.cn进行注册使用
  
  QQ技术交流群: 466907566

