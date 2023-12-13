import { NextResponse } from 'next/server';
// import * as cheerio from 'cheerio';

export async function POST(req) {
  try {
    if (req.method === "POST") {
      const request = await req.json()
      const pageUrl = request.url

      if (pageUrl !== undefined) {
        const response = await fetch(`${pageUrl}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        })

        const data = await response.text()

        // parse data use cheerio.js and return all elements content
        // const $ = cheerio.load(data)
       
        console.log(data)
        return NextResponse.json({data})
      } else {
        return NextResponse.json({ error: "Missing parameters", status:400 });
      }
    } else {
      return NextResponse.json({ error: "Method not allowed", status:405 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", status:500 });
  }
};
