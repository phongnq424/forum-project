<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    const numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72];

    let target = $state(23);
    let currentStep = $state(0);

    function buildSteps(value: number) {
        const steps: {
            low: number;
            mid: number;
            high: number;
            message: string;
            found: boolean;
        }[] = [];

        let low = 0;
        let high = numbers.length - 1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const current = numbers[mid];

            if (current === value) {
                steps.push({
                    low,
                    mid,
                    high,
                    message: `Target ${value} found at index ${mid}.`,
                    found: true,
                });
                return steps;
            }

            if (current < value) {
                steps.push({
                    low,
                    mid,
                    high,
                    message: `${current} is smaller than ${value}, so the left half is removed.`,
                    found: false,
                });
                low = mid + 1;
            } else {
                steps.push({
                    low,
                    mid,
                    high,
                    message: `${current} is greater than ${value}, so the right half is removed.`,
                    found: false,
                });
                high = mid - 1;
            }
        }

        steps.push({
            low,
            mid: -1,
            high,
            message: `Target ${value} does not exist in the array.`,
            found: false,
        });

        return steps;
    }

    let steps = $derived(buildSteps(target));
    let step = $derived(steps[currentStep] ?? steps[0]);

    $effect(() => {
        target;
        currentStep = 0;
    });

    function previousStep() {
        if (currentStep > 0) {
            currentStep -= 1;
        }
    }

    function nextStep() {
        if (currentStep < steps.length - 1) {
            currentStep += 1;
        }
    }

    function reset() {
        currentStep = 0;
    }
</script>

<section class="visualizer-card">
    <div class="toolbar">
        <div>
            <h2>Binary Search Execution</h2>
            <p>
                Follow how the valid search range changes after each comparison.
            </p>
        </div>

        <label>
            Target
            <select bind:value={target}>
                {#each numbers as num}
                    <option value={num}>{num}</option>
                {/each}
            </select>
        </label>
    </div>

    <div class="array-view">
        {#each numbers as num, index}
            <div
                class="array-cell"
                class:outside={step && (index < step.low || index > step.high)}
                class:mid={step && index === step.mid}
                class:found={step?.found && index === step.mid}
            >
                <span>{num}</span>
                <small>{index}</small>
            </div>
        {/each}
    </div>

    <div class="step-box">
        <div class="step-title">
            <Icon name={step?.found ? "check" : "trending-up"} size={16} />
            <span>Step {currentStep + 1}/{steps.length}</span>
        </div>

        <p>{step?.message}</p>
    </div>

    <div class="actions">
        <Button
            variant="secondary"
            onclick={previousStep}
            disabled={currentStep === 0}
        >
            Previous
        </Button>

        <Button variant="secondary" onclick={reset}>Reset</Button>

        <Button
            variant="primary"
            onclick={nextStep}
            disabled={currentStep >= steps.length - 1}
        >
            Next
        </Button>
    </div>
</section>

<style>
    .visualizer-card {
        padding: 20px;
        border-radius: 14px;
        background: #1e222b;
        border: 1px solid #2a2e36;
    }

    .toolbar {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: flex-start;
        margin-bottom: 20px;
    }

    h2 {
        margin: 0;
        color: #f9fafb;
        font-size: 20px;
    }

    p {
        margin: 8px 0 0;
        color: #9ca3af;
        line-height: 1.6;
        font-size: 14px;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: #9ca3af;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
    }

    select {
        border: 1px solid #2a2e36;
        border-radius: 10px;
        padding: 10px 12px;
        background: #14161c;
        color: #e5e7eb;
        font: inherit;
        outline: none;
    }

    .array-view {
        display: grid;
        grid-template-columns: repeat(9, minmax(0, 1fr));
        gap: 8px;
    }

    .array-cell {
        min-height: 64px;
        border-radius: 10px;
        background: #252a35;
        border: 1px solid #374151;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .array-cell span {
        color: #e5e7eb;
        font-size: 16px;
        font-weight: 800;
    }

    .array-cell small {
        margin-top: 4px;
        color: #6b7280;
        font-size: 11px;
    }

    .array-cell.outside {
        opacity: 0.35;
    }

    .array-cell.mid {
        border-color: #6366f1;
        background: rgba(99, 102, 241, 0.18);
    }

    .array-cell.found {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.16);
    }

    .step-box {
        margin-top: 16px;
        padding: 14px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .step-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #a5b4fc;
        font-size: 13px;
        font-weight: 800;
        margin-bottom: 6px;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 16px;
    }

    @media (max-width: 900px) {
        .toolbar {
            flex-direction: column;
        }

        .array-view {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .actions {
            flex-wrap: wrap;
            justify-content: stretch;
        }
    }
</style>
