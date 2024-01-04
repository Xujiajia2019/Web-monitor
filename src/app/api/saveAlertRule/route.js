import { NextResponse } from 'next/server';
import { supabase } from '/api'


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
      if (node.name !== 'style') { 
        $(node.children).each((index, child) => {
          text += getAllTextNodes(child);
        });
      }
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

      const type = request.type;
      const page = request.page;
      const element = request.element;
      const condition = request.condition;
      const value = request.value;

      
      if (type && page && element && condition && value !== undefined) {
        
        const { data, error } = await supabase
          .from('Alert rules')
          .insert({
            type,
            page,
            element,
            condition,
            value
          })
          .select()
        
        if (error) {
          console.error('Supabase error:', error)
        } else {
          console.log('Data inserted successfully:', data);
          return NextResponse.json(data)
        }
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
