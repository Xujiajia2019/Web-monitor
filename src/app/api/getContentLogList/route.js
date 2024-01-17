import { supabase } from '/api';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    if (req.method === "GET") {
      const { searchParams } = new URL(req.url)
      const pageListId = searchParams.get('pageListId')
      const logId = searchParams.get('id')

      if (pageListId) {
        let { data, error } = await supabase
          .from('Page Content')
          .select('id, url, created_at, html, content, diff_content, diff_html')
          .eq('page_id', pageListId)
          .order('created_at', { ascending: false });

        if (error) {
          console.log(error)
          return NextResponse.json({error})
        } else {
          return NextResponse.json(data);
        }
      } else if (logId) {
        let { data, error } = await supabase
          .from('Page Content')
          .select('id, url, created_at, html, content, diff_content, diff_html')
          .eq('id', logId)
          .order('created_at', { ascending: false });

        if (error) {
          console.log(error)
          return NextResponse.json({error})
        } else {
          return NextResponse.json(data);
        }
      } else {
        return NextResponse.json({ error: "Can not find page", status:402 })
      }
      
    } else {
      return NextResponse.json({ error: "Method not allowed", status:405 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", status:500 })
  }
}