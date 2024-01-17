const Diff = require('diff')
const fetch = require('node-fetch');
// const he = require('he');

async function diffHtml() {
  let diffHtml = ''
  let originalHtmlCount = 0
  let modifiedHtmlCount = 0
  let diffHtmlPercent = 0

  // const fetchHtml = await getHtml('https://sections.bbxlk.cc/')
  const lastHtml = `
    <head>
  <script class="boomerang">
  (function () {
    if (window.BOOMR && (window.BOOMR.version || window.BOOMR.snippetExecuted)) {
      return;
    }
    window.BOOMR = window.BOOMR || {};
    window.BOOMR.snippetStart = new Date().getTime();
    window.BOOMR.snippetExecuted = true;
    window.BOOMR.snippetVersion = 12;
    window.BOOMR.application = "storefront-renderer";
    window.BOOMR.themeName = "Motherboard";
    window.BOOMR.themeVersion = "0.0.1";
    window.BOOMR.shopId = 51545768094;
    window.BOOMR.themeId = 134677364894;
    window.BOOMR.renderRegion = "gcp-us-east1";
    window.BOOMR.url =
      "https://sections.bbxlk.cc/cdn/shopifycloud/boomerang/shopify-boomerang-1.0.0.min.js";
    var where = document.currentScript || document.getElementsByTagName("script")[0];
    var parentNode = where.parentNode;
    var promoted = false;
    var LOADER_TIMEOUT = 3000;
    function promote() {
      if (promoted) {
        return;
      }
      var script = document.createElement("script");
      script.id = "boomr-scr-as";
      script.src = window.BOOMR.url;
      script.async = true;
      parentNode.appendChild(script);
      promoted = true;
    }
    function iframeLoader(wasFallback) {
      promoted = true;
      var dom, bootstrap, iframe, iframeStyle;
      var doc = document;
      var win = window;
      window.BOOMR.snippetMethod = wasFallback ? "if" : "i";
      bootstrap = function(parent, scriptId) {
        var script = doc.createElement("script");
        script.id = scriptId || "boomr-if-as";
        script.src = window.BOOMR.url;
        BOOMR_lstart = new Date().getTime();
        parent = parent || doc.body;
        parent.appendChild(script);
      };
      if (!window.addEventListener && window.attachEvent && navigator.userAgent.match(/MSIE [67]./)) {
        window.BOOMR.snippetMethod = "s";
        bootstrap(parentNode, "boomr-async");
        return;
      }
      iframe = document.createElement("IFRAME");
      iframe.src = "about:blank";
      iframe.title = "";
      iframe.role = "presentation";
      iframe.loading = "eager";
      iframeStyle = (iframe.frameElement || iframe).style;
      iframeStyle.width = 0;
      iframeStyle.height = 0;
      iframeStyle.border = 0;
      iframeStyle.display = "none";
      parentNode.appendChild(iframe);
      try {
        win = iframe.contentWindow;
        doc = win.document.open();
      } catch (e) {
        dom = document.domain;
        iframe.src = "javascript:var d=document.open();d.domain='" + dom + "';void(0);";
        win = iframe.contentWindow;
        doc = win.document.open();
      }
      if (dom) {
        doc._boomrl = function() {
          this.domain = dom;
          bootstrap();
        };
        doc.write("<body onload='document._boomrl();'>");
      } else {
        win._boomrl = function() {
          bootstrap();
        };
        if (win.addEventListener) {
          win.addEventListener("load", win._boomrl, false);
        } else if (win.attachEvent) {
          win.attachEvent("onload", win._boomrl);
        }
      }
      doc.close();
    }
    var link = document.createElement("link");
    if (link.relList &&
      typeof link.relList.supports === "function" &&
      link.relList.supports("preload") &&
      ("as" in link)) {
      window.BOOMR.snippetMethod = "p";
      link.href = window.BOOMR.url;
      link.rel = "preload";
      link.as = "script";
      link.addEventListener("load", promote);
      link.addEventListener("error", function() {
        iframeLoader(true);
      });
      setTimeout(function() {
        if (!promoted) {
          iframeLoader(true);
        }
      }, LOADER_TIMEOUT);
      BOOMR_lstart = new Date().getTime();
      parentNode.appendChild(link);
    } else {
      iframeLoader(false);
    }
    function boomerangSaveLoadTime(e) {
      window.BOOMR_onload = (e && e.timeStamp) || new Date().getTime();
    }
    if (window.addEventListener) {
      window.addEventListener("load", boomerangSaveLoadTime, false);
    } else if (window.attachEvent) {
      window.attachEvent("onload", boomerangSaveLoadTime);
    }
    if (document.addEventListener) {
      document.addEventListener("onBoomerangLoaded", function(e) {
        e.detail.BOOMR.init({
          ResourceTiming: {
            enabled: true,
            trackedResourceTypes: ["script", "img", "css"]
          },
        });
        e.detail.BOOMR.t_end = new Date().getTime();
      });
    } else if (document.attachEvent) {
      document.attachEvent("onpropertychange", function(e) {
        if (!e) e=event;
        if (e.propertyName === "onBoomerangLoaded") {
          e.detail.BOOMR.init({
            ResourceTiming: {
              enabled: true,
              trackedResourceTypes: ["script", "img", "css"]
            },
          });
          e.detail.BOOMR.t_end = new Date().getTime();
        }
      });
    }
  })();</script>
  </head>
  `

  console.log(typeof lastHtml)
  const pageHtml = `<html class="no-js" lang="en">
  <head>
    <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="">
  <link rel="canonical" href="https://sections.bbxlk.cc/">
  <link rel="preconnect" href="https://cdn.shopify.com" crossorigin><link rel="preconnect" href="https://fonts.shopifycdn.com" crossorigin><title>
  Sections - A Shopify demo site designed by Fastlane Ltd.
  </title>


  <meta name="description" content="Fastlane Limited, a Shopify Plus partner based in China, is dedicated to offer best one-stop service for DTC brands with international ambition.">



  <meta property="og:site_name" content="DEMOTest hahahahhahahhahahahahah">`

  // console.log(`lastHtml: ${lastHtml}`)

  const diffHtmlResult = Diff.diffChars(lastHtml, pageHtml)

  diffHtmlResult.forEach((part) => {
    const htmlDiffColor = part.added ? 'green' : part.removed ? 'red' : 'grey';
    const htmlDiffColorDecoration = part.removed ? 'text-decoration:line-through;' : '';
    diffHtml += `<pre style="color:${htmlDiffColor};${htmlDiffColorDecoration}">${part.value}</pre>`;
    if (part.removed) {
      originalHtmlCount += part.count;
    } else if (part.added) {
      modifiedHtmlCount += part.count;
    } else {
      originalHtmlCount += part.count;
    }
  })

  diffHtmlPercent = parseFloat(((modifiedHtmlCount / originalHtmlCount) * 100).toFixed(2));

  console.log(`diffHtml: ${diffHtml}`)
  console.log(`diffHtmlPercent: ${diffHtmlPercent}%`)
}

diffHtml()

async function getHtml(pageUrl) {
  const response = await fetch(`${pageUrl}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html'
    },
  })
  const html = await response.text()
  return html
}