import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { Branch } from '@/types/branch';
import { RequestAction, RequestActionTableRequest } from '@/types/request-action';
import { Table } from '@/types/table';
import { router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { BellIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { REQUEST_ACTION_ICON_NAMES } from '../request_action/RequestActionForm';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';
export default function NotificationsList() {
    const { state } = useSidebar();
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const { notifications, branch, filters } = usePage<{
        notifications: RequestActionTableRequest[];
        branch: Branch;
        filters: {
            notifications: string;
        };
    }>().props;

    console.log({ branch, filters });
    const [showNotification, setShowNotification] = useState(filters.notifications == 'true' ? true : false);
    const { play } = useAudioPlayer('/storage/sounds/new_order.mp3');
    const toggleRequestNotifications = () => {
        setShowNotification(!showNotification);
        setLoadingNotifications(true);
        router.reload({
            data: {
                notifications: !showNotification,
            },
            only: ['notifications'],
            onFinish: () => {
                setLoadingNotifications(false);
            },
        });
    };
    const markAsRead = (id: number) => {
        router.post(route('cashier.notification.read', id));
    };

    useEcho(
        `branch.${branch?.id}.table_request_actions`,
        'RequestActionTableRequestCreatedEvent',
        ({
            tableRequestAction,
        }: {
            tableRequestAction: {
                request_action: RequestAction;
                table: Table;
            };
        }) => {
            play();
            console.log({
                tableRequestAction,
            });
            if (showNotification) {
                router.reload({
                    only: ['notifications'],
                    preserveUrl: true,
                });
            } else {
                toast.custom(
                    (id) => (
                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-neutral-900 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:text-white">
                            {REQUEST_ACTION_ICON_NAMES.find((icon) => icon.name === tableRequestAction.request_action.icon)?.component}
                            <div className="flex-1">
                                <h4 className="font-semibold">{tableRequestAction.request_action.name}</h4>
                                <p className="text-sm opacity-80">Table {tableRequestAction.table.name}</p>
                            </div>
                            <Button size={'sm'} variant={'ghost'} onClick={() => toast.dismiss(id)}>
                                Dismiss
                            </Button>
                        </div>
                    ),
                    {
                        duration: 10 * 1000,
                    },
                );
            }
        },
    );

    useEffect(() => {
        console.log({ filters });
        setLoadingNotifications(true);
        if (filters.notifications == 'true') {
            router.reload({
                data: {
                    notifications: true,
                },
                only: ['notifications'],
                onFinish: () => {
                    setLoadingNotifications(false);
                },
            });
        }
    }, [filters]);

    return (
        <div>
            <Drawer direction="left" open={showNotification} onOpenChange={() => toggleRequestNotifications()}>
                <DrawerTrigger onClick={toggleRequestNotifications} asChild>
                    <div className="flex cursor-pointer gap-2 px-4 hover:bg-gray-50">
                        <div className="ml-[-2px] flex gap-2">
                            <BellIcon size={18} />
                            {state === 'expanded' && <span className="text-sm">Notifications</span>}
                        </div>
                    </div>
                </DrawerTrigger>
                <DrawerContent className="mr-auto h-[100vh] w-[30vw]">
                    <DrawerHeader>
                        <DrawerTitle>Notifications</DrawerTitle>
                        <DrawerDescription>Table request notifications.</DrawerDescription>
                    </DrawerHeader>
                    <div className="overflow-y-auto">
                        {notifications?.length > 0 ? (
                            <div>
                                {notifications.map((notification) => (
                                    <div className="flex gap-4 border p-2" key={notification.id}>
                                        <div>
                                            {REQUEST_ACTION_ICON_NAMES.find((icon) => icon.name === notification.requestAction.icon)?.component}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm font-bold">{notification.table.name}</p>
                                            <p className="text-sm font-semibold">{notification.requestAction.name}</p>
                                        </div>
                                        <div className="self-end">
                                            <Button
                                                variant={'ghost'}
                                                onClick={() => {
                                                    markAsRead(notification.id);
                                                }}
                                                size={'sm'}
                                            >
                                                OK
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : loadingNotifications ? (
                            <div className="p-2 text-center">
                                <p className="text-muted-foreground">Loading...</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <p className="text-sm text-muted-foreground">No notifications</p>
                            </div>
                        )}
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
