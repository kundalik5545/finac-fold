import { AddSubscriptionForm } from "./_components/AddSubscriptionForm";
import BackButton from "@/components/custom-componetns/back-button";

export default function AddSubscriptionPage() {
    return (
        <div className="container mx-auto max-w-4xl p-6">
            <div className="mb-6">
                <BackButton />
                <h1 className="text-3xl font-bold mt-4">Add Subscription</h1>
                <p className="text-muted-foreground mt-2">
                    Create a new recurring subscription
                </p>
            </div>
            <AddSubscriptionForm />
        </div>
    );
}

