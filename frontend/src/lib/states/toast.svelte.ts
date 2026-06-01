// src/lib/states/toast.svelte.ts

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
    id: number;
    type: ToastType;
    message: string;
};

let items = $state<Toast[]>([]);

function push(type: ToastType, message: string) {
    const id = Date.now();

    items = [
        ...items,
        {
            id,
            type,
            message,
        },
    ];

    setTimeout(() => {
        items = items.filter((item) => item.id !== id);
    }, 3000);
}

export const toastState = {
    get items() {
        return items;
    },

    success(message: string) {
        push("success", message);
    },

    error(message: string) {
        push("error", message);
    },

    info(message: string) {
        push("info", message);
    },

    warning(message: string) {
        push("warning", message);
    },
    remove(id: number) {
        items = items.filter((item) => item.id !== id);
    }
};