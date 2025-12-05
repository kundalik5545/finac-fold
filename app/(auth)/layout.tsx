import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'

const Authlayout = async ({ children }: { children: React.ReactNode }) => {
    // Get session to check authentication status
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    console.log("Session:", session);

    if (session) {
        redirect("/dashboard");
    }

    return (
        <div className='bg-red-500 border-2 border-blue-500'>
            {children}
        </div>
    );
};

export default Authlayout; 