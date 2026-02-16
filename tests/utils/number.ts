export function normalizeCurrencyToNumber(value: string): number {
    const cleaned = value
        .trim()
        .replace(/[^\d.,-]/g, '')
        .replace(/,/g, '');

    const parsed = Number.parseFloat(cleaned);
    if (Number.isNaN(parsed)) {
        throw new Error(`Unable to parse portfolio value: "${value}"`);
    }
    return parsed;
}
