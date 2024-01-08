import { supabase } from '/api';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    if (req.method === "GET") {
      let { data, error } = await supabase
        .from('Alert rules')
        .select('id, type, page, element, condition, value')
        .order('created_at', { ascending: false });

      if (error) {
        console.log(error)
        return NextResponse.json({error})
      } else {
        return NextResponse.json(data);
      }
    } else {
      return NextResponse.json({ error: "Method not allowed", status:405 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", status:500 })
  }
}