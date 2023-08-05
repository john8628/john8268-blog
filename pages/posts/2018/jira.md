---
title: jira restful API
date: 2018/3/18
description: jira restful API.
tag: web development
author: john8268
---

jira官方提供很全面的介绍，参考地址：https://developer.atlassian.com/jiradev/jira-apis/jira-rest-apis/jira-rest-api-tutorials

  >1: Authentication ：关于登录jira提供三种方式，用java 封装的 Basic Authentication实现的；具体实现方式，java的实现方式可以参考 https://github.com/rcarz/jira-client/issues

> 2: create issue: 先要通过http://jira.~~.xx.com//rest/api/2/JFL/createmeta 找到对应问题的,可以找到服务器中所有jira project的基本属性，找到你要编辑的jira project的key和id；然后通过 例如：curl -D- -u fred:fred -X POST --data {see below} -H "Content-Type: application/json" http://localhost:8090/rest/api/2/issue/  ；post数据json的数据如下：
```
{
    "fields": {
       "project":
       { 
          "key": "TEST"
       },
       "summary": "REST ye merry gentlemen.",
       "description": "Creating of an issue using project keys and issue type names using the REST API",
       "issuetype": {
          "name": "Bug"
       }
   }
}
```

>3: Update issue: 通过 jira.xx.com/rest/api/2/issue/JFL-89/editmeta ，可以找到该issue哪些fields可以update；然后通过 例如 ： curl -D- -u fred:fred -X PUT --data {see below} -H "Content-Type: application/json" http://kelpie9:8081/rest/api/2/issue/QA-31 json字符串：
```
{
   "fields": {
       "assignee":{"name":"harry"}
   }
}
```

注意：如果是自定义的fileld（customfield_10200，这个值可以通过editmeta方式得到)，将assignee改成相应的值就行了