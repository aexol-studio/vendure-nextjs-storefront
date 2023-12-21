export const dateFormatter = (date: Date | string, get: 'date' | 'time' | 'datetime' = 'date') => {
    //TODO: Add better date formatting
    const _date = typeof date === 'string' ? new Date(date) : date;
    if (get === 'date') {
        return _date.toISOString().split('T')[0];
    }
    if (get === 'time') {
        return _date.toISOString().split('T')[1].split('.')[0];
    }
    if (get === 'datetime') {
        return _date.toISOString().split('.')[0];
    }
    return _date.toISOString();
};
