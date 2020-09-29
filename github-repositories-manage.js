// ==UserScript==
// @name         Github项目批量删除
// @namespace    https://github.com/mengyou658/github-repositories-manage
// @version      1.1.0
// @description  Github项目批量删除，fork的项目太多了
// @author       yunchaoq/mengyou658
// @license      GPL License
// @match        *://github.com/*
// @require      https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/layer/3.1.1/layer.min.js
// @resource     layerCss https://cdn.bootcdn.net/ajax/libs/layer/3.1.1/theme/default/layer.min.css
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_getResourceText
// ==/UserScript==
(function() {
  'use strict';
  GM_addStyle(GM_getResourceText('layerCss'))
  // GM_addStyle(GM_getResourceText('layuiCss'))
  var location = window.location.href;
  var pathname = window.location.pathname;
  var userName = pathname.replace("/", "");
  var checkList = [];
  var tmpCode = sessionStorage.getItem("gitto");
  var layer = layui.layer;

  if (location.indexOf("?tab=repositories") > -1){
    init();
  }

  function init() {
    if (!tmpCode) {
      layer.prompt({title: '输入申请的token，默认一次使用，关闭浏览器后失效，并确认<a href="https://github.com/settings/tokens" target="_blank">点击这里是申请，请至少选择Delete Repos</a>', formType: 1}, function(token, index){
        if (token) {
          tmpCode = token;
          sessionStorage.setItem('gitto', tmpCode);
          layer.closeAll();
        }
      });
    }
    $("#user-repositories-list li").each((id, it) =>{
      $(it).append('<input type="checkbox" class="user-repositories-list-checkbox" name="repo-check" value="" >');
    });

    $("#user-repositories-list li").on('click', function () {

      let find = $(this).find('.user-repositories-list-checkbox');
      var href = $(this).find('.wb-break-all').find('a').attr('href');
      if (href.indexOf(pathname) > -1) {
        // var repoName = href.replace(pathname + "/", "");
        let index = checkList.indexOf(href);
        if (index > -1 ){
          find.prop('checked', false);
          checkList.splice(index, 1);
        } else {
          find.prop('checked', true);
          checkList.push(href);
        }
        if (!$('#user-repositories-delete').length && checkList.length) {
          $(".UnderlineNav-body:first").append('<a href="javascript:void(0);" id="user-repositories-delete" class="UnderlineNav-item btn btn-primary ">批量删除</a>');
          $("#user-repositories-delete").on('click', function () {
            var resList = {};
            checkList.forEach((it)=> {
              var url = 'https://api.github.com/repos' + it
              $.ajax({
                url: url,
                method: 'DELETE',
                "headers": {
                  "Accept": "application/vnd.github.v3+json",
                  "Authorization": "token " + tmpCode
                },
                success: function (data, textStatus, jqXHR) {
                  resList[it] = true;
                }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                  resList[it] = false;
                }
              })
            })
            var resTxt = "";
            for (var i in resList) {
              if (resList[i] == true) {
                resTxt += " 删除【" + i + "】成功<br />";
              }
            }
            for (var i in resList) {
              if (resList[i] == false) {
                resTxt += " 删除【" + i + "】失败<br />";
              }
            }
            layer.msg('删除结果：<br />' + resTxt, function () {
              window.location.reload();
            });
          });
        }
      }
    });

  }

})();
