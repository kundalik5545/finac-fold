import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { AppSidebar } from './app-sidebar';

const ConditionalAppLayout = async () => {

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return (
        <div>
            {session ? <> <AppSidebar variant="inset" /></> : <></>}
        </div>
    )
}

export default ConditionalAppLayout
