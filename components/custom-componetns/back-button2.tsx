import { ArrowLeft } from "lucide-react"
import Link from "next/link"


const BackButton2 = ({ href, backButtonText }: { href: string, backButtonText: string }) => {
    return (
        <Link href={href} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            <span>{`Back to ${backButtonText}`}</span>
        </Link>
    )
}

export default BackButton2
