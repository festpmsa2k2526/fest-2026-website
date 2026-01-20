
import { createClient } from '@/app/utils/supabase/client'
import { cookies } from 'next/headers'

export default async function Page() {
    const cookieStore = await cookies()
    const supabase = createClient()

    const { data: results } = await supabase.from('results').select()

    console.log('Results:', results)
    return (
        <>
            
        </>
    )
}
