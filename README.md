pkplayer是一个P2P播放器，支持Android、IOS平台。

基于ijkplayer,ppeasy开发，P2P方式播放rtmp直播源，观众越多,播放越流畅。

网络通信（内网穿透）的模块，使用ppeasy（P2P传输SDK），其特点是无需架设穿透服务器，用户之间直接进行数据的交换。

以GPL协议发布, 任何人请在遵守协议的前提下复制、发布、修改.

最后本程序作者不承担使用该程序所带来的任何问题并拥有一切解释权.

QQ技术交流群: 466907566



### Build Android

windows编译

ffmpeg静态库已编译好放置在jniLibs目录下，直接编译ijkplayer-example项目即可。
运行前需设置ANDROID_SDK环境变量ANDROID_HOME，及安装Java。

cd e:\pkplayer-master\android\ijkplayer
gradlew build


Linux编译
```
git clone https://github.com/SeaHaige/pkplayer.git pkplayer-android
cd pkplayer-android
git checkout -B latest k0.8.2

./init-android.sh

cd android/contrib
./compile-ffmpeg.sh clean
./compile-ffmpeg.sh all

cd ..
./compile-ijk.sh all

# Android Studio:
#     Open an existing Android Studio project
#     Select android/ijkplayer/ and import
#
#     define ext block in your root build.gradle
#     ext {
#       compileSdkVersion = 23       // depending on your sdk version
#       buildToolsVersion = "23.0.0" // depending on your build tools version
#
#       targetSdkVersion = 23        // depending on your sdk version
#     }
#
# If you want to enable debugging ijkplayer(native modules) on Android Studio 2.2+: (experimental)
#     sh android/patch-debugging-with-lldb.sh armv7a
#     Install Android Studio 2.2(+)
#     Preference -> Android SDK -> SDK Tools
#     Select (LLDB, NDK, Android SDK Build-tools,Cmake) and install
#     Open an existing Android Studio project
#     Select android/ijkplayer
#     Sync Project with Gradle Files
#     Run -> Edit Configurations -> Debugger -> Symbol Directories
#     Add "ijkplayer-armv7a/.externalNativeBuild/ndkBuild/release/obj/local/armeabi-v7a" to Symbol Directories
#     Run -> Debug 'ijkplayer-example'
#     if you want to reverse patches:
#     sh patch-debugging-with-lldb.sh reverse armv7a
#
# Eclipse: (obselete)
#     File -> New -> Project -> Android Project from Existing Code
#     Select android/ and import all project
#     Import appcompat-v7
#     Import preference-v7
#
# Gradle
#     cd ijkplayer
#     gradle

```
Build iOS
