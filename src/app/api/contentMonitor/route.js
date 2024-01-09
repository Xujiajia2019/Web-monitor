import { NextResponse } from 'next/server';
import cron from 'node-cron';
import { supabase } from '/api'
import cheerio from 'cheerio';
const Diff = require('diff')

// 每 10 分钟执行一次
// const CRON_EXPRESSION = '0 */10 * * *';
const CRON_EXPRESSION = '* * * * *';

async function fetchDataAndProcess(pageUrl) {
  try {
    if (pageUrl !== undefined) {

      // 获取页面内容
      const html = await getHtml(pageUrl)
      //  获取所有文本内容
      const content = getContent(html, 'body')

      let lastContentData = {}

      if (html != undefined && content != undefined) {

        // 获取上一次的内容作为模板数据
        lastContentData = await getLastContent()
        // console.log(`lastContentData:${lastContentData}`)

        if (lastContentData && lastContentData.content != undefined) {

          // 模板数据内容
          const lastContent = lastContentData.content
          // console.log(`lastContent:${lastContent}}`)

          if (lastContent != content) {
            // diff 算法比对内容
            const diffResult = Diff.diffWords(lastContent, content)
            console.log(`diffResult: ${JSON.stringify(diffResult)}`)

            let diffContent = ''
            diffResult.forEach((part) => {
              // green for additions, red for deletions
              // grey for common parts
              const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
              // 为了方便查看，将 diff 结果用 span 标签包裹，并根据 diff 类型添加颜色，如果是删除的内容，显示划线
              const textDecoration = part.removed ? 'text-decoration:line-through;' : '';
              diffContent += `<span style="color:${color};${textDecoration}">${part.value}</span>`;
            })
            console.log(`diffContent: ${diffContent}`)

            // 如果有内容变化，保存内容
            if (diffContent !== '') {
              const data = await saveContent(pageUrl, html, content, diffContent)
              return data
            }
          }
        } else {
          // 如果没有上一次的内容，将当前内容作为模板数据
          const data = await saveContent(pageUrl, html, content, '')
          return data
        }
        
        // // 获取所有预警规则
        // let { data: rules, error: getRulesError } = await supabase
        //   .from('Alert rules')
        //   .select('id, type, page, element, condition, value')
        //   .order('created_at', { ascending: false });
        // if (getRulesError) {
        //   console.log(`Get alert rules error: ${getRulesError}`)
        // }
        
        // console.log(`rules: ${JSON.stringify(rules)}`)

        // if (rules && rules.length > 0) {
        //   rules.forEach(rule => {
        //     if (rule.type === 'page_content' && rule.page === pageUrl) {
        //       console.log(`Checking rule ${rule.id}...`)
        //       const isRuleSatisfied = checkRule(html, rule)

        //       console.log(`Rule ${rule.id} is satisfied: ${isRuleSatisfied}`)

        //       if (isRuleSatisfied) {
        //         triggerNotifications(rule)
        //       }
        //     }

        //   })
        // }
        // const content = ''

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

async function saveContent(pageUrl, html, content, diffContent) {
  const { data, error } = await supabase
    .from('Page Content')
    .insert({
      html,
      url: pageUrl,
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

async function getLastContent() {
  // 获取上一次的内容作为模板数据
  let { data: lastContentData, error: getLastContentError } = await supabase
    .from('Page Content')
    .select('html, content')
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
      const pageUrl = request.url;

      
      if (pageUrl !== undefined) {
        // 初始获取页面内容
        const initialExecutionResult = await fetchDataAndProcess(pageUrl)

        // 创建定时任务
        cron.schedule(CRON_EXPRESSION, async () => {
          console.log('Running scheduled task...');
          await fetchDataAndProcess(pageUrl);
        })

        // 返回初始数据（HTML 和内容）
        return NextResponse.json(initialExecutionResult)
      } else {
        return NextResponse.json({ error: "Missing parameters", status:400 })
      }
    } else {
      return NextResponse.json({ error: "Method not allowed", status:405 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", status:500 })
  }
}
