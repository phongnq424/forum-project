/**
 * Extract the first character of a name and convert to uppercase
 * @param name - The name to extract initial from
 * @returns First character uppercase, or "?" if name is empty
 */
export const getInitial = (name?: string): string => {
    if (!name || name.trim() === "") return "?";
    return name.charAt(0).toUpperCase();
};

/**
 * Format gender label
 * @param gender - Gender code (MALE, FEMALE, OTHER)
 * @returns Formatted gender string
 */
export const formatGender = (gender?: string): string => {
    const genderMap: Record<string, string> = {
        MALE: "Male",
        FEMALE: "Female",
        OTHER: "Other",
    };
    return genderMap[gender ?? ""] || "";
};

/**
 * Format date to locale string
 * @param date - Date object or ISO string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
    try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return dateObj.toLocaleDateString();
    } catch {
        return "";
    }
};
