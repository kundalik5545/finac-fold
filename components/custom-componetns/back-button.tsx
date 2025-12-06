'use client'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'

/**
 * BackButton component that when clicked, will navigate the user back to the previous page.
 * 
 * Improt this component in the page you want to navigate back to the previous page.
 * 
 * ```tsx
 * import BackButton from "@/components/custom-componetns/back-button"
 * 
 * <BackButton />
 * ```
 * 
 * @returns BackButton component
 */
const BackButton = () => {
    const router = useRouter()
    const handleBack = () => {
        router.back()
    }
    return (
        <Button variant="default" size="sm" onClick={handleBack}>
            <ArrowLeft size={16} className="mr-2" />
            <span>Back</span>
        </Button>
    )
}

export default BackButton
