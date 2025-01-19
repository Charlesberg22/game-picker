import { format } from 'date-fns'
import { enAU } from 'date-fns/locale';

export const formatDate = (dateStr: string): string | undefined => {
    if (dateStr === '') {
        return;
    }

    const date = new Date(dateStr);
    return format(date, 'do MMM yyyy', { locale: enAU});
};