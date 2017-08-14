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
@SuppressLint("Registered")
public class AppActivity extends AppCompatActivity implements OnClickListener{
    private static final int MY_PERMISSIONS_REQUEST_READ_EXTERNAL_STORAGE = 1;
	private Button btnPlayP2P;
	private Button btnPlay;
	static private EditText url;
	
	static {  
		System.loadLibrary("ppeasy");
	}
	Handler handler=new Handler(){
		public void handleMessage(Message msg){
			String desturl=url.getText().toString();			 
			VideoActivity.intentTo(AppActivity.this, "rtmp://127.0.0.1:"+msg.obj+desturl.substring(desturl.indexOf('/',7)),"rtmp");
			
			//直接播放rtmp地址
			//VideoActivity.intentTo(AppActivity.this,desturl,"rtmp");  
		}
	}; 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_app);
		btnPlayP2P=(Button)findViewById(R.id.playp2p);
		btnPlayP2P.setOnClickListener(this);
		
		btnPlay=(Button)findViewById(R.id.play);
		btnPlay.setOnClickListener(this);
		url=(EditText)findViewById(R.id.url);
		try {
			File file = new File("/sdcard","url.txt");  
			if(file.exists()){
				 FileInputStream is = new FileInputStream(file); 
				 byte[] b = new byte[is.available()];  
				 is.read(b); 
				 String result = new String(b); 
				 url.setText(result);  
			}
		} catch (Exception e) {  
			e.printStackTrace();  
		}   
		  
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
    
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
    }  
	@Override 
	public void onClick(View v){  
	switch (v.getId()) {      
	case R.id.playp2p:
		new Thread() { 
			public void run() { 
				int port=0;
				StringBuffer buffer = new StringBuffer(); 
				InputStream inputStream=null; 
				String desturl=url.getText().toString();
				String destdomain=desturl.substring(7,desturl.indexOf('/',7)); 
				try {  
					URL url = new URL("http://127.0.0.1:1960/?Action=CreateRtmpService&Domain="+destdomain);  
					HttpURLConnection httpUrlConn = (HttpURLConnection) url.openConnection(); 
					     
					httpUrlConn.setDoInput(true);  
					httpUrlConn.setUseCaches(false);   
					httpUrlConn.setRequestMethod("GET");   
					httpUrlConn.connect();    
					inputStream = httpUrlConn.getInputStream();  
					InputStreamReader inputStreamReader = new InputStreamReader(inputStream, "utf-8");
					BufferedReader bufferedReader = new BufferedReader(inputStreamReader); 
 
					String str = null;    
					while ((str = bufferedReader.readLine()) != null) {    
						buffer.append(str);    
					}   
					bufferedReader.close();    
					inputStreamReader.close();
					inputStream.close();    
					inputStream = null;    
					httpUrlConn.disconnect();  
					JSONObject jsonObject = new JSONObject(buffer.toString());   
					 
					port=jsonObject.optInt("port");  
				}catch (Exception e) {            
				}finally{  
				}   
				if(port!=0){
					Message msg=new Message();
					msg.what=1;
					msg.obj=port;
					handler.sendMessage(msg);
				}
			}
		}.start(); 
		break;
	case  R.id.play:
			String desturl=url.getText().toString();
			VideoActivity.intentTo(this,desturl,"rtmp");  			
		break;
	}
		//
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
}
