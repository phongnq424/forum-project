<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import type {
        ReportSeverity,
        ReportStatus,
        ReportType,
    } from "$lib/types/report.type";

    let {
        search = $bindable(""),
        statusFilter = $bindable<ReportStatus | "">(""),
        severityFilter = $bindable<ReportSeverity | "">(""),
        typeFilter = $bindable<Exclude<ReportType, "UNKNOWN"> | "">(""),
        loading = false,
        onSearch,
        onReset,
    } = $props<{
        search: string;
        statusFilter: ReportStatus | "";
        severityFilter: ReportSeverity | "";
        typeFilter: Exclude<ReportType, "UNKNOWN"> | "";
        loading?: boolean;
        onSearch: () => void;
        onReset: () => void;
    }>();

    const statusOptions: { value: "" | ReportStatus; label: string }[] = [
        { value: "", label: "All Status" },
        { value: "OPEN", label: "Open" },
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

    const typeOptions: {
        value: "" | Exclude<ReportType, "UNKNOWN">;
        label: string;
    }[] = [
        { value: "", label: "All Types" },
        { value: "USER", label: "User" },
        { value: "POST", label: "Post" },
        { value: "COMMENT", label: "Comment" },
        { value: "MESSAGE", label: "Message" },
    ];
</script>

<section class="report-filters">
    <div class="filter-row">
        <Input
            bind:value={search}
            placeholder="Search by title, reason or reporter..."
            disabled={loading}
            onkeydown={(e: KeyboardEvent) => {
                if (e.key === "Enter") onSearch();
            }}
        />

        <div class="filter-select">
            <Select
                bind:value={statusFilter}
                options={statusOptions}
                placeholder="All Status"
            />
        </div>

        <div class="filter-select">
            <Select
                bind:value={severityFilter}
                options={severityOptions}
                placeholder="All Severity"
            />
        </div>

        <div class="filter-select">
            <Select
                bind:value={typeFilter}
                options={typeOptions}
                placeholder="All Types"
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
        grid-template-columns: minmax(260px, 1fr) 160px 160px 160px auto auto;
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
