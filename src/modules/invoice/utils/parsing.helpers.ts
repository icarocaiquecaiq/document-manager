export function cleanText(fullText: string): string | null {
    if (!fullText) return null;
    return fullText.split(':')[1]?.trim() || null;
}

export function findMatch(text: string, patterns: RegExp[]): RegExpMatchArray | null {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match;
    }
    return null;
}

export function formatCurrencyToNumber(currencyString: string | null): number | null {
    if (!currencyString) return null;

    try {
        const sanitizedValue = currencyString.trim().replace(/\./g, '').replace(',', '.');
        return parseFloat(sanitizedValue);
    } catch (error) {
        console.log({ message: 'Error formatting currency string', error });
        return null;
    }
}

export function formatCurrencyToNumberWithSymbol(fullText: string): number | null {
    if (!fullText) return null;
    const currencyString = fullText.match(/R\$\s?([\d\.,]+)/)?.[1];
    if (!currencyString) return null;
    const sanitizedValue = currencyString.trim().replace(/\./g, '').replace(',', '.');
    return parseFloat(sanitizedValue);
}
export function formatDate(fullText: string): Date | null {
    if (!fullText) return null;
    const dateText = fullText.split(':')[1]?.trim().substring(0, 10);
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateText)) return null;
    return new Date(dateText.split('/').reverse().join('-'));
}
