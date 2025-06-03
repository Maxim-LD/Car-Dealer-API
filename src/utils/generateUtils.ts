export const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word characters with hyphen
        .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

export const generateVIN = (): string => {
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'
    let vin = '';
    for (let i = 0; i < 17; i++) {
        vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return vin;
}
