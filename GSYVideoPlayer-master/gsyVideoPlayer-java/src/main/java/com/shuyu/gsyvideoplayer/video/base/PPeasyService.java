package com.shuyu.gsyvideoplayer.video.base;

import android.util.Log; 
import java.io.File ;
import java.io.InputStream;  
import java.io.FileOutputStream;  
import java.net.URL;  
import java.net.ConnectException;  
import java.net.HttpURLConnection; 


import android.content.Context;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;  
import java.io.BufferedReader; 
import org.json.JSONObject;  
import java.security.MessageDigest;
import java.util.zip.CRC32;

import java.net.ServerSocket;

import android.net.ConnectivityManager;
import android.net.NetworkInfo;

public class PPeasyService{
	
	private static int nodecnt=0;
	private static int cacheFlag=0;
	private static int downloadrate=0;
	private static long downloadlen=0;
	private static long videolen=0;
	private static int stubport=1960;
	private static int sharecount=0;
	private static int playhandle=1000;
	private static int alivedata=1;
	private static int lastalivedata=0;
	/*
	public static String p2p(String url){
		if(url==null) return null; 
		if(alivedata==lastalivedata) return url;
		lastalivedata=alivedata;
		if(url.substring(0,6).equals("p2p://"))
		return "http://127.0.0.1:"+stubport+"/p2p/"+url.substring(6); 
		return null;
	}
	*/
	public static String p2pvideo(String url){
		if(url==null) return null;
		if(alivedata==lastalivedata || url.substring(0,17).equals("http://127.0.0.1:")) return url;
		lastalivedata=alivedata;
		playhandle++;
		
		if(url.substring(0,5).equals("https"))
		return "http://127.0.0.1:"+stubport+"/videossl/"+(playhandle-1)+"/"+url.substring(8);
		else
		return "http://127.0.0.1:"+stubport+"/video/"+(playhandle-1)+"/"+url.substring(7);
	}
	public static String p2plive(String url){
		//if(true)		return url;
		if(url==null) return null;
		if(alivedata==lastalivedata || url.substring(0,17).equals("http://127.0.0.1:")) return url;
		lastalivedata=alivedata;
		playhandle++;
		if(url.substring(0,5).equals("https"))
		return "http://127.0.0.1:"+stubport+"/playssl/"+(playhandle-1)+"/"+url.substring(8);
		else
		return "http://127.0.0.1:"+stubport+"/play/"+(playhandle-1)+"/"+url.substring(7);
	}
	public static void start_thread(){
			//Log.d("ppeasy-jni","fname:"+cacheFileName("p2p://bbb.songguotv.com/7017A3FC1F36A5E7"));
			new Thread() 
			{ 
				public void run() 
				{ 
					try {
						Thread.sleep(3000);
					}catch (Exception e) {            
					}finally{  
					}					
					while(true){
						//Log.d("ppeasy-jni","connect ...."); 
						try {
							URL url = new URL("http://127.0.0.1:"+stubport+"/?Action=stat");  
							HttpURLConnection httpUrlConn = (HttpURLConnection) url.openConnection(); 
							httpUrlConn.setDoInput(true);  
							httpUrlConn.setUseCaches(false);   
							httpUrlConn.setRequestMethod("GET");    
							httpUrlConn.connect(); 
							InputStream inputStream = httpUrlConn.getInputStream();
							InputStreamReader inputStreamReader = new InputStreamReader(inputStream, "utf-8");			
							BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
							String str = null;   
									
							while ((str = bufferedReader.readLine()) != null) {    
								//
								//Log.d("ppeasy-jni","start read:"+str); 
								JSONObject jsonObject = new JSONObject(str.toString()); 
								/*
								nodecnt=jsonObject.optInt("Node"); 
								if(str.indexOf("\"Cache\"")>=0)
								cacheFlag=jsonObject.optInt("Cache");
								if(str.indexOf("\"Rate\"")>=0)
								downloadrate=jsonObject.optInt("Rate"); 
								if(str.indexOf("\"FPLen\"")>=0)
								downloadlen=jsonObject.optLong("FPLen"); 
								if(str.indexOf("\"VLen\"")>=0)
								videolen=jsonObject.optLong("VLen"); 
								if(str.indexOf("\"ShareCount\"")>=0)
								{ 
									sharecount+=jsonObject.optInt("ShareCount");
								}
								*/
								alivedata++;
								if(str.indexOf("Reload")>=0 && jsonObject.optInt("Reload")==1){ 
									load_lib(null);
									Thread.sleep(3000);    
									break;
								} 
								//Log.d("ppeasy-jni","Get Result"); 
								Thread.sleep(1000);    
							}   
							
							bufferedReader.close();    
							inputStreamReader.close();
							inputStream.close();    
							inputStream = null;    
							httpUrlConn.disconnect();  
							
							Thread.sleep(1000);
						}catch (Exception e) {            
						}finally{  
						}   
					}
				}
			}.start();
	}
	private static File curlibpath=null;
	private static void load_lib(File path){
			int loadf=0;
			try { 
				if(path!=null) curlibpath=path;
				//File path=context.getDir("libs", Context.MODE_PRIVATE);
				int k;
				for(k=1;k<1000;k++)
				{
					File file=new File(curlibpath,"libppeasy"+k+".so");
					if(!file.exists()){
						if(k==1)
							break;
						file=new File(curlibpath,"libppeasy"+(k-1)+".so");
						
						Log.d("ppeasy","open lib size:"+file.length());
						
						System.load(file.getAbsolutePath()); 
						loadf=1;
						break;
					}
				} 
				//if(k==1)            System.loadLibrary("ppeasy");
				 
			} catch (Exception e) {
				e.printStackTrace();
			}
			if(loadf==0) System.loadLibrary("ppeasy");
	}
	static int startstate=0;
	public static void start(Context context){
		
		//Log.d("ppeasy-jni","is wifi:"+Context.CONNECTIVITY_SERVICE);
		if(startstate==0)
		{
			startstate=1;
			;
			ServerSocket server=null;
	
			int crf=1;
			try{
				server=new ServerSocket(1960);
				server.close();
			}catch(Exception e) {
				crf=0;
			} 
			if(0==crf){
				crf=1;
				try{
					server=new ServerSocket(8021);
					server.close();
					stubport=8021;	
				}catch(Exception e) {
					crf=0;
				} 			
			}
			if(0==crf){
				crf=1;
				try{
					server=new ServerSocket(8091);
					server.close();
					stubport=8091;	
				}catch(Exception e) {
					crf=0;
				} 			
			}
			savecfg(context.getCacheDir().getAbsolutePath());		
			{
				load_lib(context.getDir("libs", Context.MODE_PRIVATE));
				start_thread();
			}
		}
	}
	static String cfgpath="";
	static int cfgupspeed=0;
	static int cfgdownspeed=0;
	static int cfgdisksizeinGB=0;
	private static void savecfg(String path)
	{
		if(path.substring(path.length()-1,path.length())!="/")
			path+="/";
		path+="cfg.ini";
		String cfgdata="\r\n\r\n";
		if(cfgpath!=""){
			cfgdata+="cachepath="+cfgpath+"\r\n";		
		}
		if(stubport!=1960)
			cfgdata+="stubport="+stubport+"\r\n";
		if(cfgdisksizeinGB!=0){
			cfgdata+="p2pdisksize="+cfgdisksizeinGB+"\r\n";	
		}
		if(cfgupspeed!=0){
			cfgdata+="netuprate="+cfgupspeed+"\r\n";	
		}
		if(cfgdownspeed!=0){
			cfgdata+="netdownrate="+cfgdownspeed+"\r\n";	
		}
		if(cfgdata.equals("\r\n\r\n")) return;
	  FileOutputStream fop = null;
	  File file;
	  String content = cfgdata;

	  try {

	   file = new File(path);
	   fop = new FileOutputStream(file);

	   // if file doesnt exists, then create it
	   if (!file.exists()) {
		file.createNewFile();
	   }

	   // get the content in bytes
	   byte[] contentInBytes = content.getBytes();

	   fop.write(contentInBytes);
	   fop.flush();
	   fop.close();
 

	  } catch (IOException e) {
	   e.printStackTrace();
	  } finally {
		try {
		if (fop != null) {
		fop.close();
		}
		} catch (IOException e) {
		e.printStackTrace();
		}
	  }
	}
	
	public static void SetCachePath(String path)
    {
		if(path.substring(path.length()-1,path.length())!="/")
			path+="/";
		cfgpath=path;
	}

    public static void SetUpSpeed(int speed)
    {
		cfgupspeed=speed;
	}

    public static void SetDownSpeed(int speed)
    {
		cfgdownspeed=speed;
	}
    public static void SetDiskCacheSize(int disksizeinGB)
    {
		cfgdisksizeinGB=disksizeinGB*1000;
	}
    public static int GetNodeCount()
    {
		return nodecnt;
	}
    public static int GetDownloadRate()
    {
		return downloadrate;
	}
    public static boolean GetCacheState()
    {
		return (cacheFlag==1)?true:false;
	}
    public static int GetShareCount()
    {
		int cnt=sharecount;
		sharecount=0;
		return cnt;
	}


}