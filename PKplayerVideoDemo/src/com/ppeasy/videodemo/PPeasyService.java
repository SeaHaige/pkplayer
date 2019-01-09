package com.ppeasy.videodemo;

import android.util.Log; 
import java.io.File ;
import java.io.InputStream;  
import java.io.FileOutputStream;  
import java.net.URL;  
import java.net.ConnectException;  
import java.net.HttpURLConnection; 


import android.content.Context;
public class PPeasyService{
	public static String p2p(String url){
		return "http://127.0.0.1:1960/play/"+url.substring(7);
	}
	public static void start(final Context context,final String url){
		if(url==null||url.equals("")) 
		{
			System.loadLibrary("ppeasy");
			return;
		}
		String CPU_ABI = android.os.Build.CPU_ABI; 
		{
			int loadf=0;
			try { 
				
				File path=context.getDir("libs", Context.MODE_PRIVATE);
				int k;
				for(k=1;k<1000;k++)
				{
					File file=new File(path,"libppeasy"+k+".so");
					if(!file.exists()){
						if(k==1)
							break;
						file=new File(path,"libppeasy"+(k-1)+".so");
						
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
		
		if(CPU_ABI.equals("armeabi-v7a")){
			new Thread() 
			{ 
				public void run() 
				{  
					File path=context.getDir("libs", Context.MODE_PRIVATE);
					String addr=url;
					try {
						URL url = new URL(addr);  
						HttpURLConnection httpUrlConn = (HttpURLConnection) url.openConnection(); 
						httpUrlConn.setDoInput(true);  
						httpUrlConn.setUseCaches(false);   
						httpUrlConn.setRequestMethod("GET");    
						httpUrlConn.connect(); 
						String clen=httpUrlConn.getHeaderField("Content-Length");
						InputStream inputStream = httpUrlConn.getInputStream(); 
						int k;
						long flen=0;
						for(k=1;k<1000;k++)
						{
							File file=new File(path,"libppeasy"+k+".so");
							if(!file.exists()){ 
								
								break;
							} 
							flen=file.length();
						} 
						long clen2=0;
						if(clen.length()>0)
						clen2=Integer.parseInt(clen);
						if(clen2!=flen && clen2!=0){
							File file = new File(path,"libppeasy"+k+".so");
							FileOutputStream fos = new FileOutputStream(file); 
							byte[] bytes=new byte[1024];
							int len=0;
							while((len=inputStream.read(bytes))!=-1){
								fos.write(bytes,0,len);
							}
							fos.close();
							if(inputStream!=null){
								inputStream.close();
							}
							if(file.length()!=clen2){
								file.delete();
							}
							else{
								Log.d("ppeasy","open file: write->"+file.getAbsolutePath()+","+clen2+","+flen+","+file.length());
								Log.d("ppeasy","upgrade write ok...");
							}
						}
					}catch (Exception e) {            
					}finally{  
					}   
				}
			}.start();
		}
	}
}