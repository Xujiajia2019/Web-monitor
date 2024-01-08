import { NextResponse } from 'next/server';
import { supabase } from '/api'

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
