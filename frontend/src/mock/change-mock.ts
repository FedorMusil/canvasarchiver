import { Change, ChangeType, ItemTypes } from '../api/change';
import { http, HttpHandler, HttpResponse } from 'msw';

export const changeHandlers: HttpHandler[] = [
    http.get('/changes/*', () => {
        return HttpResponse.json<Change[]>(exampleChanges);
    }),
];

const exampleChanges: Change[] = [
    {
        id: 0,
        change_type: ChangeType.CREATE,
        item_type: ItemTypes.ASSIGNMENTS,
        old_value: { time_limit: 5 },
        new_value: { time_limit: 10 },
    },

    {
        id: 1,
        change_type: ChangeType.UPDATE,
        item_type: ItemTypes.PAGES,
        old_value: { updated_at: '2012-08-08T14:25:20-06:00', hide_from_students: false },
        new_value: { updated_at: new Date(), hide_from_students: true },
    },

    {
        id: 2,
        change_type: ChangeType.DELETE,
        item_type: ItemTypes.FILES,
        old_value: { updated_at: '2012-07-01T23:59:00-06:00' },
        new_value: { updated_at: new Date(), description: '<p>Do the following:</p>...' },
    },
];
