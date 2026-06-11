<script lang="ts">
    export type IconName =
        | "map-pin"
        | "user"
        | "cake"
        | "calendar"
        | "pencil"
        | "log-out"
        | "camera"
        | "search"
        | "bell"
        | "bot"
        | "trophy"
        | "flame"
        | "folder"
        | "help-circle"
        | "heart"
        | "message-square"
        | "bookmark"
        | "arrow-left"
        | "arrow-right"
        | "message-circle"
        | "flag"
        | "share"
        | "plus"
        | "share-2"
        | "trending-up"
        | "reply"
        | "more-horizontal"
        | "loader"
        | "trash"
        | "menu"
        | "check"
        | "settings"
        | "mic"
        | "mic-off"
        | "video"
        | "video-off"
        | "phone"
        | "phone-off"
        | "x";

    let {
        name,
        size = 16,
        strokeWidth = 2,
        color, // <-- Thêm prop color tùy chọn
        fill = "none",
        class: className = "",
    } = $props<{
        name: IconName;
        size?: number;
        strokeWidth?: number;
        color?: string;
        fill?: string;
        class?: string;
    }>();

    const paths: Record<IconName, string> = {
        "map-pin":
            '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
        user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M12 11V7"/><path d="M12 7c1.4 0 3-1.4 3-3 0 1.6-1.6 3-3 3Z"/>',
        calendar:
            '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
        pencil: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
        "log-out":
            '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
        camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
        search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
        bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
        trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
        bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
        flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
        folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
        "help-circle":
            '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
        heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
        "message-square":
            '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        bookmark:
            '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
        flag: '<path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.6 2 6.2 2H18c.5 0 .9.2 1.2.5.3.4.5.8.5 1.3v9c0 .5-.2.9-.5 1.2-.3.4-.7.6-1.2.6H7.2L4 22z"/>',
        "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
        "arrow-right": '<path d="m12 5 7 7-7 7"/><path d="M5 12h14"/>',
        "message-circle": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
        share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>',
        plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
        "share-2":
            '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
        "trending-up":
            '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
        reply: '<polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
        "more-horizontal":
            '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
        loader: '<path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/>',
        trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
        menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
        check: '<polyline points="20 6 9 17 4 12"/>',
        settings:
            '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
        mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/><line x1="8" x2="16" y1="22" y2="22"/>',
        "mic-off":
            '<line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/><line x1="8" x2="16" y1="22" y2="22"/>',

        video: '<path d="m16 13 5.22 3.48A.5.5 0 0 0 22 16.06V7.94a.5.5 0 0 0-.78-.42L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>',

        "video-off":
            '<path d="M10.66 6H14a2 2 0 0 1 2 2v3.34l1 1L21.22 9.5A.5.5 0 0 1 22 9.94v6.12a.5.5 0 0 1-.78.42L18.66 14.7"/><path d="M16 16v.01A2 2 0 0 1 14 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h.01"/><line x1="2" x2="22" y1="2" y2="22"/>',

        phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.59 2.61a2 2 0 0 1-.45 2.11L8.09 9.55a16 16 0 0 0 6.36 6.36l1.11-1.11a2 2 0 0 1 2.11-.45c.84.27 1.72.47 2.61.59A2 2 0 0 1 22 16.92z"/>',

        "phone-off":
            '<path d="M10.68 13.31a16 16 0 0 0 3.01 3.01l1.11-1.11a2 2 0 0 1 2.11-.45c.84.27 1.72.47 2.61.59A2 2 0 0 1 21.24 17v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 10.43 18.93 19.5 19.5 0 0 1 4.07 12.57 19.79 19.79 0 0 1 1 3.94 2 2 0 0 1 3 1.76h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.59 2.61a2 2 0 0 1-.45 2.11L7.03 9.31"/><line x1="22" x2="2" y1="2" y2="22"/>',

        x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    };

    // Bảng màu mặc định cho các icon đặc biệt
    const defaultColors: Partial<Record<IconName, string>> = {
        flame: "var(--ui-danger)",
        folder: "var(--ui-warning)",
        trophy: "var(--ui-warning)",
        cake: "var(--ui-info)",
        "map-pin": "var(--ui-success)",
        "help-circle": "var(--ui-primary)",
        "trending-up": "var(--ui-primary)",
        flag: "var(--ui-danger)",
        trash: "var(--ui-danger)",
        "phone-off": "var(--ui-danger)",
        "mic-off": "var(--ui-danger)",
        "video-off": "var(--ui-danger)",
    };

    let strokeColor = $derived(
        color || defaultColors[name as IconName] || "currentColor",
    );
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {fill}
    stroke={strokeColor}
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    class={className}
    style="display: block; flex-shrink: 0;"
>
    {@html paths[name as IconName]}
</svg>
