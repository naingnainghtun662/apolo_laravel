import { ShowFlashMessageToast } from '@/components/ShowFlashToastMessage';
import { Toaster } from '@/components/ui/sonner';
import { AlertTriangleIcon, CheckCircle, InfoIcon, LoaderCircle, TriangleAlertIcon, XIcon } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    document.documentElement.classList.toggle('dark', false);
    document.documentElement.style.colorScheme = 'light';
    return (
        <div className="h-[100vh] w-full">
            {children}
            <Toaster
                theme="system"
                position="top-right"
                duration={5000}
                icons={{
                    success: <CheckCircle className="h-4 w-4 text-green-500" />,
                    error: <TriangleAlertIcon className="h-4 w-4 text-red-500" />,
                    info: <InfoIcon className="h-4 w-4 text-blue-500" />,
                    warning: <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />,
                    loading: <LoaderCircle className="h-4 w-4 animate-spin text-gray-500" />,
                    close: <XIcon className="h-4 w-4 text-muted-foreground" />,
                }}
                toastOptions={{
                    classNames: {
                        error: 'bg-red-500 text-white',
                        success: 'bg-green-500 text-white',
                        info: 'bg-blue-500 text-white',
                        warning: 'bg-yellow-500 text-black',
                    },
                }}
            />
            <ShowFlashMessageToast />
        </div>
    );
}
