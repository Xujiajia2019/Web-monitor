import { NextResponse } from 'next/server';
import cron from 'node-cron';
import { supabase } from '/api'
import cheerio from 'cheerio';

// 每 10 分钟执行一次
const CRON_EXPRESSION = '*/1 * * * *';

async function fetchDataAndProcess(pageUrl) {
  try {
    if (pageUrl !== undefined) {
      const response = await fetch(`${pageUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      const html = await response.text()

      if (html != undefined) {
        
        // 获取所有预警规则
        let { data: rules, error: getRulesError } = await supabase
          .from('Alert rules')
          .select('id, type, page, element, condition, value')
          .order('created_at', { ascending: false });
        if (getRulesError) {
          console.log(`Get alert rules error: ${getRulesError}`)
        }
        
        console.log(`rules: ${JSON.stringify(rules)}`)

        if (rules && rules.length > 0) {
          rules.forEach(rule => {
            if (rule.type === 'page_content' && rule.page === pageUrl) {
              console.log(`Checking rule ${rule.id}...`)
              const isRuleSatisfied = checkRule(html, rule)

              console.log(`Rule ${rule.id} is satisfied: ${isRuleSatisfied}`)

              if (isRuleSatisfied) {
                triggerNotifications(rule)
              }
            }

          })
        }
        const content = ''
        const { data, error } = await supabase
          .from('Page Content')
          .insert({
            html,
            url: pageUrl
          })
          .select()
      
        if (error) {
          console.error('Supabase error:', error)
        } else {
          console.log('Data inserted successfully');
          return ({html, content})

        }
      }
    }
  } catch (error) {
    console.error('Error in the task:', error.message);
    // 在这里处理错误，例如记录日志或其他操作
  }
};

function getContent(html, element) {
  const $ = cheerio.load(html)
  // get all text content
  function getAllTextNodes(node) {
    let text = ''
    if (node.type === 'text') {
      text += node.data;
    } else if (node.children) {
      if (node.name !== 'style') {
        $(node.children).each((index, child) => {
          text += getAllTextNodes(child);
        });
      }
    }
    return text
  }
  const textContent = getAllTextNodes($(element)[0])
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
        // const initialExecutionResult = await fetchDataAndProcess(pageUrl)

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
