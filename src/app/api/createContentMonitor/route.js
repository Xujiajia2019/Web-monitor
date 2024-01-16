import { NextResponse } from 'next/server';
import { supabase } from '/api'

export async function POST(req) {
  try {
    if (req.method === "POST") {
      const request = await req.json();

      
      // const { data, error } = await supabase
      //   .tx(async tx => {
      //     const result1 = await tx
      //       .from('Page List')
      //       .insert(request.pageList.map(page => ({ url: page })))
      //       .select()
      //     console.log(result1)
      //     const result2 = await tx
      //       .from('Page Configure')
      //       .insert(
      //         {
      //           url: request.pages,
      //           monitor_interval: request.timer,
      //           change_range: request.range,
      //           notifications: request.notifications,
      //           sitemap: request.sitemap,
      //           proxy: request.proxy
      //         }
      //       )
      //       .select()
      //     return [result1, result2]
      //   })

      const { data, error } = await supabase
        .from('Page Configure')
        .insert(
          {
            url: request.pages,
            monitor_interval: request.timer,
            change_range: request.range,
            notifications: request.notifications,
            sitemap: request.sitemap,
            proxy: request.proxy
          }
        )
        .select()
      
      const { data: data2, error: error2 } = await supabase
        .from('Page List')
        .insert(request.pageList.map(page => ({ url: page })))
        .select()


      if (error || error2) {
        console.error('Supabase error:', error)
      } else {
        return NextResponse.json(data2)
      }
  
    } else {
      return NextResponse.json({ error: "Method not allowed", status:405 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", status:500 })
  }
}
