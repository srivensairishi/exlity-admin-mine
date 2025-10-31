import { createClient } from '@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { email, password } = await req.json()
  const supabase = createClient(
    Deno.env.get('VITE_SUPABASE_URL') ?? '',
    Deno.env.get('VITE_SUPABASE_ANON_KEY') ?? ''
  )

  const { data, error } = await supabase
    .from('Exlity Users')
    .select('password')
    .eq('email', email)
    .eq('exlity_role', 'Admin')
    .single()

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    })
  }

  if (password !== data.password) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    })
  }

  return new Response(JSON.stringify({ message: 'Login successful' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})
