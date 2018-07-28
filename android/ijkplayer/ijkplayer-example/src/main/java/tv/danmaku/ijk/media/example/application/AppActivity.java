/*
 * Copyright (C) 2015 Bilibili
 * Copyright (C) 2015 Zhang Rui <bbcallen@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package tv.danmaku.ijk.media.example.application;

import android.util.Log;    

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.*;

import tv.danmaku.ijk.media.example.R;
import tv.danmaku.ijk.media.example.activities.RecentMediaActivity;
import tv.danmaku.ijk.media.example.activities.SampleMediaActivity;
import tv.danmaku.ijk.media.example.activities.SettingsActivity;
import tv.danmaku.ijk.media.example.activities.VideoActivity;


import java.net.ConnectException;  
import java.net.HttpURLConnection;  
import java.net.URL;  
import java.io.InputStream;  
import java.io.InputStreamReader;  
import java.io.BufferedReader; 

import java.io.File;
import java.io.FileInputStream;  

import org.json.JSONObject;  

import android.widget.Toast;
import android.os.Handler;
import android.os.Message;

import android.webkit.WebChromeClient;  
import android.webkit.WebSettings;  
import android.webkit.WebView;  
import android.webkit.WebViewClient;  
import android.webkit.JavascriptInterface;
import java.io.*;
import android.webkit.ValueCallback;
import android.os.Handler;   
import tv.danmaku.ijk.media.example.widget.media.IjkVideoView;
import tv.danmaku.ijk.media.player.IMediaPlayer;
import tv.danmaku.ijk.media.player.IjkMediaPlayer;
import android.net.Uri;

@SuppressLint("Registered")
public class AppActivity extends AppCompatActivity {
    private static final int MY_PERMISSIONS_REQUEST_READ_EXTERNAL_STORAGE = 1; 
    private WebView webView;  
    private IjkVideoView videoview; 
	static {  
		System.loadLibrary("ppeasy");
	} 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_app);
		
        videoview = (IjkVideoView) findViewById(R.id.video_view2);  
        int width = videoview.getContext().getResources().getDisplayMetrics().widthPixels;  
        LinearLayout.LayoutParams linearParams = (LinearLayout.LayoutParams) videoview.getLayoutParams();  
        linearParams.height = width*9/16;  
        videoview.setLayoutParams(linearParams); 
		  
        //Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        //setSupportActionBar(toolbar);
    
        if (ContextCompat.checkSelfPermission(this,
                Manifest.permission.READ_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED) {
            if (ActivityCompat.shouldShowRequestPermissionRationale(this,
                    Manifest.permission.READ_EXTERNAL_STORAGE)) {
                // TODO: show explanation
            } else {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.READ_EXTERNAL_STORAGE},
                        MY_PERMISSIONS_REQUEST_READ_EXTERNAL_STORAGE);
            }
        }
		init();
    }  
	 

    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        switch (requestCode) {
            case MY_PERMISSIONS_REQUEST_READ_EXTERNAL_STORAGE: {
                if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    // permission was granted, yay! Do the task you need to do.
                } else {
                    // permission denied, boo! Disable the functionality that depends on this permission.
                }
            }
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_app, menu);
        return true;
    }
 
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
		
        if (id == R.id.action_settings) {
            SettingsActivity.intentTo(this);
            return true;
        }		
		else if (id == R.id.action_recent) {
            RecentMediaActivity.intentTo(this);			
        } else if (id == R.id.action_sample) {
            SampleMediaActivity.intentTo(this);
        }
		

        return super.onOptionsItemSelected(item);
    }

    @Override
    public boolean onPrepareOptionsMenu(Menu menu) {
        boolean show = super.onPrepareOptionsMenu(menu);
        if (!show)
            return show;

        return true;
    }
    static String fileName="ppeasy.cfg";
    private String ReadFile() {
        FileInputStream inputStream;
        byte[] buffer = null;
        try {
            inputStream = this.openFileInput(fileName);
            try { 
                int fileLen = inputStream.available(); 
                buffer = new byte[fileLen];
                inputStream.read(buffer);
            } catch (IOException e) {
                e.printStackTrace();
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } 
        if (buffer != null)
            return new String(buffer);//EncodingUtils.getString(buffer, "utf-8");
        else
            return "";

    } 
    private void WriteFile(String message) {
        try { 
            FileOutputStream outStream = this.openFileOutput(fileName,
                    MODE_PRIVATE); 
            byte[] data = message.getBytes();
            try { 
                outStream.write(data);
                outStream.flush();
                outStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
    }
	public class JsInteration {
 
		@JavascriptInterface
        public void save(String value){
            WriteFile(value);
        }
		@JavascriptInterface
        public String load(){
            return ReadFile();  
        } 
		@JavascriptInterface
		public void showVideo() { 
            Message msg = new Message();
            msg.what=1; 
            msg.arg1=1;
            mHandler.sendMessage(msg); 
		}
		@JavascriptInterface
		public void hideVideo() { 
            Message msg = new Message();
            msg.what=1; 
            msg.arg1=0;
            mHandler.sendMessage(msg); 
		}
		@JavascriptInterface
		public void PlayPath(String playurl,String name) { 
            Log.d("ppeasy","info playpath...");
			
			Message msg = new Message();
			msg.what=0;
			msg.obj =playurl; 
			mHandler.sendMessage(msg);
			
			/*
            channelname=name;
            retry=0;
            if(url!=null && server!=null)
            server.closeport(url);
            {
            } 
			*/
		} 
	} 
    public Handler mHandler=new Handler(){    
        public void handleMessage(Message msg) { 
			if(msg.what==0){
                String str =(String)msg.obj;   
                //if(url!=null)                videoview.stopPlayback();  
				
				videoview.setVideoURI(Uri.parse(str));
				videoview.start(); 
				 
            } 
			/*
            if(msg.what==1){
                if(msg.arg1==0)
				videoview.setVisibility(View.GONE); 
                if(msg.arg1==1)
				videoview.setVisibility(View.VISIBLE); 
			}
			*/
			 
                            
        }        
    };    
    
    private void init() {  
        webView = (WebView) findViewById(R.id.webView);   
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.loadUrl("file:///android_asset/index.html");   
        //webView.loadUrl("http://101.201.104.27/m3u8/");  
        webView.addJavascriptInterface(new JsInteration(), "control");
        webView.setWebViewClient(new WebViewClient(){  
            @Override  
            public boolean shouldOverrideUrlLoading(WebView view, String url) {   
                view.loadUrl(url);  
                return true;  
            }  
			
			@Override  
			public void onPageFinished(WebView view, String url) {  
				// TODO Auto-generated method stub  x
				super.onPageFinished(view, url);   
				//view.loadUrl("javascript:play()");   
			}  
			  
            //WebViewClient帮助WebView去处理一些页面控制和请求通知  
        });  
		//webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        //启用支持Javascript  
        WebSettings settings = webView.getSettings();  
        settings.setJavaScriptEnabled(true); 		
        //WebView加载页面优先使用缓存加载  
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);  
        webView.setWebChromeClient(new WebChromeClient() {  
            /** 
             * 显示自定义视图，无此方法视频不能播放 
             */  
            @Override  
            public void onShowCustomView(View view, CustomViewCallback callback) {  
                super.onShowCustomView(view, callback);  
            }  
        });   
    }  
}
