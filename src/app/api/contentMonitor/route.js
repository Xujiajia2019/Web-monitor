import { NextResponse } from 'next/server';
import cron from 'node-cron';
import { supabase } from '/api'
import cheerio from 'cheerio';
const Diff = require('diff')

// 每 10 分钟执行一次
// const CRON_EXPRESSION = '0 */10 * * *';
// const CRON_EXPRESSION = '* * * * *';

async function fetchDataAndProcess(pageUrl, pageId, proxy, sitemap, range) {
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
            const diffResult = Diff.diffChars(lastHtml, pageHtml)
            let diffHtml = ''
            diffResult.forEach((part) => {
              const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
              const textDecoration = part.removed ? 'text-decoration:line-through;' : '';
              diffHtml += `<span style="color:${color};${textDecoration}">${part.value}</span>`;
            })
            // 如果有内容变化，保存内容
            if (diffContent !== '') {
              const data = await saveContent(pageUrl, pageId, pageHtml, pageContent, diffHtml, diffContent)
              return data
            }


            if (lastContent != pageContent) {
              // diff 比对内容
              const diffResult = Diff.diffWords(lastContent, pageContent)

              let diffContent = ''
              diffResult.forEach((part) => {
                const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
                const textDecoration = part.removed ? 'text-decoration:line-through;' : '';
                diffContent += `<span style="color:${color};${textDecoration}">${part.value}</span>`;
              })

              // 如果有内容变化，保存内容
              if (diffContent !== '') {
                const data = await saveContent(pageUrl, pageId, pageHtml, pageContent, diffContent)
                return data
              }
            }

          }
        } else {
          // 如果没有上一次的内容，将当前内容作为模板数据
          const data = await saveContent(pageUrl, pageId, pageHtml, pageContent, '')
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

async function saveContent(pageUrl, pageId, html, content, diffContent) {
  const { data, error } = await supabase
    .from('Page Content')
    .insert({
      html,
      url: pageUrl,
      page_id: pageId,
      content,
      diff_content: diffContent
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

function triggerNotifications(rule) {
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
        "content": `请注意: 页面内容发生异常变化！\n
        > 页面：<font color=\"comment\">${rule.page}</font>
        > 不符合预警规则：<font color=\"comment\">${rule.id}</font>
        > 规则类型：<font color=\"comment\">${rule.type}</font>
        > 元素：<font color=\"comment\">${rule.element}</font>
        > 条件：<font color=\"comment\">${rule.condition}</font>
        > 值：<font color=\"comment\">${rule.value}</font>`
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


      if (pageList.length > 0) {
        // 获取初始网站地图和页面内容
        // const initialPageSitemap = await getSitemap(pageUrl)
        pageList.forEach(async page => {
          // 初始获取页面内容
          await fetchDataAndProcess(page.url, page.id, proxy, sitemap, range);
          
        })

        const CRON_EXPRESSION = `*/${timer} * * * *`;
        // 创建定时任务
        cron.schedule(CRON_EXPRESSION, async () => {
          console.log('Running scheduled task...');
          pageList.forEach(async page => {
            // 初始获取页面内容
            await fetchDataAndProcess(page.url, page.id, proxy, sitemap, range);  
          })
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
