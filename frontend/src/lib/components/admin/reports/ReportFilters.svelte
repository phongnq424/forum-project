<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import type {
        ReportCategory,
        ReportSeverity,
        ReportStatus,
        ReportTargetType,
    } from "$lib/types/report.type";

    let {
        statusFilter = $bindable<ReportStatus | "">(""),
        severityFilter = $bindable<ReportSeverity | "">(""),
        targetTypeFilter = $bindable<ReportTargetType | "">(""),
        categoryFilter = $bindable<ReportCategory | "">(""),
        loading = false,
        onSearch,
        onReset,
    } = $props<{
        statusFilter: ReportStatus | "";
        severityFilter: ReportSeverity | "";
        targetTypeFilter: ReportTargetType | "";
        categoryFilter: ReportCategory | "";
        loading?: boolean;
        onSearch: () => void;
        onReset: () => void;
    }>();

    const statusOptions: { value: "" | ReportStatus; label: string }[] = [
        { value: "", label: "All Status" },
        { value: "OPEN", label: "Open" },
        { value: "TRIAGED", label: "Triaged" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "RESOLVED", label: "Resolved" },
        { value: "CLOSED", label: "Closed" },
    ];

    const severityOptions: { value: "" | ReportSeverity; label: string }[] = [
        { value: "", label: "All Severity" },
        { value: "LOW", label: "Low" },
        { value: "MEDIUM", label: "Medium" },
        { value: "HIGH", label: "High" },
        { value: "CRITICAL", label: "Critical" },
    ];

    const targetTypeOptions: {
        value: "" | ReportTargetType;
        label: string;
    }[] = [
        { value: "", label: "All Targets" },
        { value: "USER", label: "User" },
        { value: "POST", label: "Post" },
        { value: "COMMENT", label: "Comment" },
        { value: "MESSAGE", label: "Message" },
    ];

    const categoryOptions: { value: "" | ReportCategory; label: string }[] = [
        { value: "", label: "All Categories" },
        { value: "SPAM", label: "Spam" },
        { value: "HARASSMENT", label: "Harassment" },
        { value: "HATE_SPEECH", label: "Hate Speech" },
        { value: "SEXUAL_CONTENT", label: "Sexual Content" },
        { value: "VIOLENCE", label: "Violence" },
        { value: "SELF_HARM", label: "Self Harm" },
        { value: "SCAM", label: "Scam" },
        { value: "IMPERSONATION", label: "Impersonation" },
        { value: "PRIVACY_VIOLATION", label: "Privacy Violation" },
        { value: "MISINFORMATION", label: "Misinformation" },
        { value: "COPYRIGHT", label: "Copyright" },
        { value: "OTHER", label: "Other" },
    ];
</script>

<section class="adm-panel adm-filter-panel">
    <div class="adm-filter-row report-filter-row">
        <Select
            bind:value={statusFilter}
            options={statusOptions}
            placeholder="All Status"
            disabled={loading}
        />

        <Select
            bind:value={severityFilter}
            options={severityOptions}
            placeholder="All Severity"
            disabled={loading}
        />

        <Select
            bind:value={targetTypeFilter}
            options={targetTypeOptions}
            placeholder="All Targets"
            disabled={loading}
        />

        <Select
            bind:value={categoryFilter}
            options={categoryOptions}
            placeholder="All Categories"
            disabled={loading}
        />

        <div class="adm-actions">
            <Button onclick={onSearch} disabled={loading}>Search</Button>
            <Button variant="secondary" onclick={onReset} disabled={loading}>
                Reset
            </Button>
        </div>
    </div>
</section>
