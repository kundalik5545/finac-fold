import { AddAssetForm } from "./_components/AddAssetForm";

export default function AddAssetPage() {
    return (
        <div className="container mx-auto md:max-w-3xl px-2 md:px-0 py-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Add New Asset</h1>
                    <p className="text-muted-foreground mt-2">
                        Enter the details of your new asset to start tracking its value
                    </p>
                </div>
                <AddAssetForm />
            </div>
        </div>
    );
}

