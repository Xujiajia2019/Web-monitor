import { NextResponse } from 'next/server';

export async function POST(req) {
  if (req.method === "POST") {
    const request = await req.json()
    const pageUrl = request.url

    if (pageUrl !== undefined) {
      // 拿到页面链接后，对页面内容进行爬虫，将爬取的页面 html 代码返回给前端
      const { data, error } = await fetch(`${pageUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      if (error) {
        return NextResponse.json({error, status:401});
      } else {
        const html = await data.text()
        return NextResponse.json({data: html, status:200});
      }
    } else {
      return NextResponse.json({ error: "Missing parameters", status:400 });
    }
  } else {
    return NextResponse.json({ error: "Method not allowed", status:405 });
  }
};
