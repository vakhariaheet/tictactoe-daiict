export const paginate = <T>(data: T[], size: number): T[][] => { 
    return data.reduce((acc, _, i) => {
        if (i % size === 0) {
            acc.push(data.slice(i, i + size));
        }
        return acc;
    }, [] as T[][]);
}