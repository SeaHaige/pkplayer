package com.ppeasy.videodemo;

import android.app.Activity;
import android.os.Bundle;

import android.webkit.WebSettings;  
import android.webkit.WebView;  
import android.webkit.WebViewClient; 
import android.webkit.WebChromeClient; 
import android.widget.FrameLayout; 
import android.webkit.WebChromeClient.CustomViewCallback; 
import android.view.View; 
import android.util.Log;

public class VideoDemoActivity extends Activity
{
    /** Called when the activity is first created. */
	private WebView webView;
	private FrameLayout mVideoContainer;
	private CustomViewCallback mCallBack;
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
		
		PPeasyService.start(getApplicationContext(),null);
		
        webView = (WebView) findViewById(R.id.webView);   
        //webView.setLayerType(View.LAYER_TYPE_HARDWARE, null); 
        webView.loadUrl("file:///android_asset/index.html");    
        webView.setWebViewClient(new WebViewClient(){  
            @Override  
            public boolean shouldOverrideUrlLoading(WebView view, String url) {   
                view.loadUrl(url);  
                return true;  
            }  
			
			@Override  
			public void onPageFinished(WebView view, String url) {  
				super.onPageFinished(view, url); 
			}     
        });   
		webView.setWebChromeClient(new WebChromeClient() 
			{
				@Override
				public void onShowCustomView(View view, CustomViewCallback callback) { 
					super.onShowCustomView(view, callback);
				}
			}
        );
        WebSettings settings = webView.getSettings();  
        settings.setJavaScriptEnabled(true); 
		settings.setDatabaseEnabled(true);
		settings.setSupportZoom(false);
		//settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
		settings.setDomStorageEnabled(true);   
		
		
    }
}
