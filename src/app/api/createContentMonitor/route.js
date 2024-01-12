import { NextResponse } from 'next/server';
import { supabase } from '/api'

export async function POST(req) {
  try {
    if (req.method === "POST") {
      const request = await req.json();
      
      // 插入多条数值。全部成功时返回成功，否则返回错误
      const { data, error } = await supabase
        .from('Page List')
        .insert(request.pageList.map(page => ({ url: page })))
        .select()
      if (error) {
        console.error('Supabase error:', error)
      } else {
        return NextResponse.json(data)
      }
  
    } else {
      return NextResponse.json({ error: "Method not allowed", status:405 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", status:500 })
  }
}
