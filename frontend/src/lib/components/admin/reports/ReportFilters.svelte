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

<section class="report-filters">
    <div class="filter-row">
        <div class="filter-select">
            <Select
                bind:value={statusFilter}
                options={statusOptions}
                placeholder="All Status"
                disabled={loading}
            />
        </div>

        <div class="filter-select">
            <Select
                bind:value={severityFilter}
                options={severityOptions}
                placeholder="All Severity"
                disabled={loading}
            />
        </div>

        <div class="filter-select">
            <Select
                bind:value={targetTypeFilter}
                options={targetTypeOptions}
                placeholder="All Targets"
                disabled={loading}
            />
        </div>

        <div class="filter-select">
            <Select
                bind:value={categoryFilter}
                options={categoryOptions}
                placeholder="All Categories"
                disabled={loading}
            />
        </div>

        <Button onclick={onSearch} disabled={loading}>Search</Button>
        <Button variant="secondary" onclick={onReset} disabled={loading}>
            Reset
        </Button>
    </div>
</section>

<style>
    .report-filters {
        padding: 14px;
        border: 1px solid rgba(148, 163, 184, 0.12);
        border-radius: 16px;
        background: linear-gradient(180deg, #171a21 0%, #14171d 100%);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
    }

    .filter-row {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr)) auto auto;
        gap: 10px;
        align-items: center;
    }

    .filter-select {
        min-width: 0;
    }

    @media (max-width: 1100px) {
        .filter-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 640px) {
        .filter-row {
            grid-template-columns: 1fr;
        }
    }
</style>
