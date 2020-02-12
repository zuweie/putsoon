#!/usr/bin/env bash
### 
# @Author: your name
 # @Date: 2019-12-12 12:23:27
 # @LastEditTime : 2020-02-02 09:09:57
 # @LastEditors  : Please set LastEditors
 # @Description: In User Settings Edit

 # @FilePath: /egg-mini-admin/build-staff/b.sh
 ###
##
 nickname=Alice && login=admin && password=pwd && email=email && sed -e "s:{nickname}:${nickname}:g" -e "s:{login}:${login}:g" -e "s:{password}:${password}:g" -e "s:{email}:${email}:g" $1
