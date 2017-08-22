/*
 * Copyright (C) 2015 Gdier
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * U nless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "IJKDemoInputURLViewController.h"
#import "IJKMoviePlayerViewController.h"

@interface IJKDemoInputURLViewController () <UITextViewDelegate>

@property(nonatomic,strong) IBOutlet UITextView *textView;

@end

@implementation IJKDemoInputURLViewController

- (instancetype)init {
    void initPPeasyService();
    initPPeasyService();
    
    self = [super init];
    if (self) {
        self.title = @"PkPlayer";
        //self.textView.text=@"rtmp://122.202.129.136/live/ch5";
        
        //[self.navigationItem setLeftBarButtonItem:[[UIBarButtonItem alloc] initWithTitle:@"Play" style:UIBarButtonItemStyleDone target:self action:@selector(onClickPlayButton)]];
        [self.navigationItem setRightBarButtonItem:[[UIBarButtonItem alloc] initWithTitle:@"P2PPlay" style:UIBarButtonItemStyleDone target:self action:@selector(onClickP2PlayButton)]];
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    _data=[[NSMutableData alloc]init];
    self.textView.text=@"rtmp://122.202.129.136/live/ch5";
    
}

- (void)onClickP2PlayButton {
    NSString *desturl=@"http://127.0.0.1:1960/?Action=CreateRtmpService&Domain=";
    
    NSRange range=[self.textView.text rangeOfString:@":"];
    NSString *string=[self.textView.text substringFromIndex:range.location+3];
    string=[string substringToIndex:[string rangeOfString:@"/"].location];
    desturl=[desturl stringByAppendingString:string];
    NSURL *url=[NSURL URLWithString:desturl];
    NSURLRequest *request=[NSURLRequest requestWithURL:url];
    [NSURLConnection connectionWithRequest:request  delegate:self];

     
}

- (void)onClickPlayButton {
    NSURL *url = [NSURL URLWithString:self.textView.text];
    NSString *scheme = [[url scheme] lowercaseString];
    
    if ([scheme isEqualToString:@"http"]
        || [scheme isEqualToString:@"https"]
        || [scheme isEqualToString:@"rtmp"]) {
        [IJKVideoViewController presentFromViewController:self withTitle:[NSString stringWithFormat:@"URL: %@", url] URL:url completion:^{
//            [self.navigationController popViewControllerAnimated:NO];
        }];
    }
}
-(void)connection:(NSURLConnection*)connection didReceiveData:(nonnull NSData *)data{
    [_data appendData:data];
}
-(void)connectionDidFinishLoading:(NSURLConnection*)connection{
    NSString *dataString=[[NSString alloc]initWithData:_data encoding:NSUTF8StringEncoding];
    NSLog(@"%@",dataString);
    dataString=[dataString substringFromIndex:[dataString rangeOfString:@"port:"].location+5];
    dataString=[dataString substringToIndex:[dataString rangeOfString:@"}"].location];
    NSRange range=[self.textView.text rangeOfString:@":"];
    NSString *string=[self.textView.text substringToIndex:range.location+3];
    NSString *string2=[self.textView.text substringFromIndex:range.location+3];
    NSRange range2=[string2 rangeOfString:@"/"];
    string=[string stringByAppendingString:@"127.0.0.1:"];
    string=[string stringByAppendingString:dataString];
    string=[string stringByAppendingString:[string2 substringFromIndex:range2.location]];
    NSLog(@"%@",string);
    NSURL *url = [NSURL URLWithString:string];//]@"rtmp://192.168.0.165:10099/live/ch5"];
    NSString *scheme = [[url scheme] lowercaseString];
    
    if ([scheme isEqualToString:@"http"]
        || [scheme isEqualToString:@"https"]
        || [scheme isEqualToString:@"rtmp"]) {
        [IJKVideoViewController presentFromViewController:self withTitle:[NSString stringWithFormat:@"URL: %@", url] URL:url completion:^{
            //            [self.navigationController popViewControllerAnimated:NO];
        }];
    }
}

- (void)textViewDidEndEditing:(UITextView *)textView {
    [self onClickPlayButton];
}

@end
