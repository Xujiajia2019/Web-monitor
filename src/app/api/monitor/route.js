import { NextResponse } from 'next/server';
import cron from 'node-cron';
import { supabase } from '/api'
import cheerio from 'cheerio';

// 每 10 分钟执行一次
const CRON_EXPRESSION = '*/10 * * * *';

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
        const content = getContent(html)
        
        console.log(content)
        const { data, error } = await supabase
          .from('Page Content')
          .insert({
            html,
            content,
            url: pageUrl
          })
          .select()
        
        if (error) {
          console.error('Supabase error:', error)
        } else {
          console.log('Data inserted successfully:', content);
          return ({html, content})
        }
      }
    }
  } catch (error) {
    console.error('Error in the task:', error.message);
    // 在这里处理错误，例如记录日志或其他操作
  }
};

function getContent(html) {
  const $ = cheerio.load(html)
  // get all text content
  function getAllTextNodes(node) {
    let text = ''
    if (node.type === 'text') {
      text += node.data;
    } else if (node.children) {
      $(node.children).each((index, child) => {
        text += getAllTextNodes(child);
      });
    }
    return text
  }
  const textContent = getAllTextNodes($('#shopify-section-template--16564069793950__d28232c6-b4e9-4fec-b0e0-0f32109b9118')[0])
  return(textContent)
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
