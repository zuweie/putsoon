#!/usr/bin/env bash

# @Author: your name
 # @Date: 2019-12-12 09:08:12
 # @LastEditTime: 2019-12-12 09:08:48
 # @LastEditors: your name
 # @Description: In User Settings Editr
 # @FilePath: /egg-mini-admin/a.sh
 ###

pwd=`pwd` && sed "s:{pwd}:${pwd}/:g" $1