import { NextResponse } from 'next/server';
import cron from 'node-cron';
import { supabase } from '/api'
import cheerio from 'cheerio';
const Diff = require('diff')
const he = require('he');

// 每 10 分钟执行一次
// const CRON_EXPRESSION = '0 */10 * * *';
// const CRON_EXPRESSION = '* * * * *';

async function fetchDataAndProcess(pageUrl, pageId, proxy, sitemap, range) {
  console.log(`fetchDataAndProcess: ${pageUrl}; ${pageId}; ${proxy}; ${sitemap}; ${range}`)
  try {
    if (pageUrl !== undefined) {

      // 获取页面内容
      const pageHtml = await getHtml(pageUrl)
      const pageContent = getContent(pageHtml, 'body')

      let lastContentData = {}
      if (pageHtml != undefined && pageContent != undefined) {
        // 获取上一次的内容作为模板数据
        lastContentData = await getLastContent(pageUrl, pageId)
        
        if (lastContentData && lastContentData.content != undefined) {
          // 模板数据内容
          const lastContent = lastContentData.content
          const lastHtml = lastContentData.html

          if (lastHtml != pageHtml) {
            console.log(`页面html发生变化: ${pageUrl}`)
            console.log(`lastHtml`)
            console.log(`pageHtml`)

            // const diffHtmlResult = Diff.diffChars(lastHtml, pageHtml)
            
            let diffHtml = ''
            let diffContent = ''
            // let originalHtmlCount = 0
            // let modifiedHtmlCount = 0
            // let diffHtmlPercent = 0

            let originalContentCount = 0
            let modifiedContentCount = 0
            let diffContentPercent = 0


            // console.log(`diffHtmlResult: ${diffHtmlResult}`)

            // diffHtmlResult.forEach((part) => {
            //   const htmlDiffColor = part.added ? 'green' : part.removed ? 'red' : 'grey';
            //   const htmlDiffColorDecoration = part.removed ? 'text-decoration:line-through;' : '';
            //   diffHtml += `<pre style="color:${htmlDiffColor};${htmlDiffColorDecoration}">${he.encode(part.value)}</pre>`;
            //   if (part.removed) {
            //     originalHtmlCount += part.count;
            //   } else if (part.added) {
            //     modifiedHtmlCount += part.count;
            //   } else {
            //     originalHtmlCount += part.count;
            //   }
            // })

            // diffHtmlPercent = parseFloat(((modifiedHtmlCount / originalHtmlCount) * 100).toFixed(2));

            // console.log(`diffHtmlPercent: ${diffHtmlPercent}`)
            
            if (lastContent != pageContent) {
              console.log(`页面文本内容发生变化: ${pageUrl}`)
              // diff 比对内容
              const diffContentResult = Diff.diffWords(lastContent, pageContent)

              diffContentResult.forEach((part) => {
                const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
                const textDecoration = part.removed ? 'text-decoration:line-through;' : '';
                diffContent += `<span style="color:${color};${textDecoration}">${part.value}</span>`;
                if (part.removed) {
                  originalContentCount += part.count;
                } else if (part.added) {
                  modifiedContentCount += part.count;
                } else {
                  originalContentCount += part.count;
                }
              })
              diffContentPercent = parseFloat(((modifiedContentCount / originalContentCount) * 100).toFixed(2));
            
            }
            // console.log(`diffHtml: ${diffHtml}`)
            console.log(`diffContent: ${diffContent}`)

            // 如果有内容变化，保存内容
            if (diffContent !== '' || diffHtml !== '') {
              const data = await saveContent(pageUrl, pageId, pageHtml, pageContent, diffHtml, diffContent, `${diffContentPercent}%`)

              // 触发通知
              if (diffContentPercent > Number(range)) {
                triggerNotifications(pageUrl, diffContentPercent)
              }
              return data
            }

          }
        } else {
          // 如果没有上一次的内容，将当前内容作为模板数据
          const data = await saveContent(pageUrl, pageId, pageHtml, pageContent, '', '', '')
          return data
        }

      }
    }
  } catch (error) {
    console.error('Error in the task:', error.message);
    // 在这里处理错误，例如记录日志或其他操作
  }
};

async function getHtml(pageUrl) {
  const response = await fetch(`${pageUrl}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  const html = await response.text()
  return html
}

async function saveContent(pageUrl, pageId, html, content, diffHtml, diffContent, diffHtmlPercent) {
  const { data, error } = await supabase
    .from('Page Content')
    .insert({
      html,
      url: pageUrl,
      page_id: pageId,
      content,
      diff_html: diffHtml,
      diff_content: diffContent,
      diff_percent: diffHtmlPercent
    })
    .select()
  
  if (error) {
    console.error('Supabase error:', error)
  } else {
    console.log('Data inserted successfully');
    return (data)
  }
}

async function getLastContent(pageUrl, pageId) {
  // 获取上一次的内容作为模板数据,筛选出某个 URL 的最新内容
  let { data: lastContentData, error: getLastContentError } = await supabase
    .from('Page Content')
    .select('html, content')
    .eq('url', pageUrl)
    .eq('page_id', pageId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (getLastContentError) {
    console.log(`Get last content error: ${getLastContentError}`)
    return null
  }
  return lastContentData[0]
}

function getContent(html, element) {
  const $ = cheerio.load(html)
  // get all text content
  function getAllTextNodes(node) {
    let text = ''
    if (node.type === 'text') {
      // 过滤空格
      const trimmedData = node.data.trim();
      if (trimmedData.length > 0) {
        text += trimmedData + '<br>';
      }
    } else if (node.children) {
      if (node.name !== 'style' && node.name !== 'script') {
        $(node.children).each((index, child) => {
          text += getAllTextNodes(child);
        });
      }
    }
    return text
  }
  const textContent = getAllTextNodes($(element)[0]).trim()
  return(textContent)
}

function checkRule(html, rule) {
  const { element, condition, value } = rule
  switch (condition) {
    case 'include':
      return getContent(html, element).replace(/\n/g, '').includes(value)
    case 'exclude':
      return !getContent(html, element).replace(/\n/g, '').includes(value)
    case 'exist':
      return $(element).length > 0
    case 'non_existent':
      return $(element).length === 0
    default:
      return false
  }
}

function triggerNotifications(url, percent) {
  console.log('警告！')
  // 触发企业微信webhook 通知
  fetch('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=5ffe15ce-cb63-4550-a707-1bdd892396a0', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "msgtype": "markdown",
      "markdown": {
        "content": `请注意: 页面内容发生变更！\n
        > 页面：<font color=\"comment\">${url}</font>
        > 变更范围：<font color=\"comment\">${percent}</font>`
      }
    })
  })
}

export async function POST(req) {
  try {
    if (req.method === "POST") {
      const request = await req.json();

      // 获取多个页面 URL,及监控参数
      const pageList = request.pageList;
      const proxy = request.proxy;
      const sitemap = request.sitemap;
      const timer = request.timer;
      const range = request.range;
      // const notifications = request.notifications;


      if (pageList.length > 0) {
        // 获取初始网站地图和页面内容
        // const initialPageSitemap = await getSitemap(pageUrl)
        for (const page of pageList) {
          // 初始获取页面内容
          await fetchDataAndProcess(page.url, page.id, proxy, sitemap, range);
        }
      
        const CRON_EXPRESSION = `*/${timer} * * * *`;
        // 创建定时任务
        cron.schedule(CRON_EXPRESSION, async () => {
          console.log('Running scheduled task...');
          for (const page of pageList) {
            // 初始获取页面内容
            await fetchDataAndProcess(page.url, page.id, proxy, sitemap, range);
          }
        })
      }

      return NextResponse.json({ message: "Task scheduled", status:200 })

    } else {
      return NextResponse.json({ error: "Method not allowed", status:405 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", status:500 })
  }
}
