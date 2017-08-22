//
//  main.m
//  IJKMediaDemo
//
//  Created by ZhangRui on 13-9-19.
//  Copyright (c) 2013年 bilibili. All rights reserved.
//
#include "stdio.h"
#include <pthread.h>
void * recordthread(void*);
static
struct init2{
    init2(){
        
        int InitSockets();
        InitSockets();
        
        //pthread_t id;
        //pthread_create(&id,NULL,recordthread,NULL);
        //recordthread(0);
    }
}initcls2;
