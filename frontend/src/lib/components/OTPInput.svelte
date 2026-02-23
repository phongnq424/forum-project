<script lang="ts">
    let { length = 6, value = $bindable("") } = $props();

    let cells = $state(Array(length).fill(""));
    let inputRefs: HTMLInputElement[] = [];

    // Cập nhật giá trị bind ngược ra ngoài
    $effect(() => {
        value = cells.join("");
    });

    function handleInput(e: Event, index: number) {
        const input = e.target as HTMLInputElement;
        const val = input.value.slice(-1); // Chỉ lấy ký tự cuối

        if (val && !/^\d+$/.test(val)) {
            cells[index] = "";
            return;
        }

        cells[index] = val;

        // Tự động nhảy sang ô tiếp theo
        if (val && index < length - 1) {
            inputRefs[index + 1].focus();
        }
    }

    function handleKeyDown(e: KeyboardEvent, index: number) {
        if (e.key === "Backspace" && !cells[index] && index > 0) {
            // Nếu ô hiện tại trống và nhấn Backspace, quay lại ô trước
            inputRefs[index - 1].focus();
        }
    }

    function handlePaste(e: ClipboardEvent) {
        e.preventDefault();
        const pasteData =
            e.clipboardData?.getData("text").slice(0, length).split("") || [];
        pasteData.forEach((char, i) => {
            if (/^\d+$/.test(char)) cells[i] = char;
        });
        // Focus vào ô cuối cùng sau khi paste
        inputRefs[Math.min(pasteData.length, length - 1)].focus();
    }
</script>

<div class="otp-container" onpaste={handlePaste}>
    {#each cells as cell, i}
        <input
            bind:this={inputRefs[i]}
            type="text"
            inputmode="numeric"
            maxlength="1"
            value={cell}
            oninput={(e) => handleInput(e, i)}
            onkeydown={(e) => handleKeyDown(e, i)}
        />
    {/each}
</div>

<style>
    .otp-container {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin: 20px 0;
    }

    input {
        width: 45px;
        height: 55px;
        text-align: center;
        font-size: 24px;
        font-weight: 600;
        background: #22252e;
        border: 1px solid #2a2f3a;
        border-radius: 8px;
        color: white;
        transition: all 0.2s;
    }

    input:focus {
        border-color: #6366f1;
        outline: none;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
</style>
