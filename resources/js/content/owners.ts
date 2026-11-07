// Чьи вещи продаются. Значения совпадают с App\Enums\OwnerCategory на бэкенде.
export const OWNER_CATEGORIES = [
    { value: 'bloggers', label: 'Блогеры' },
    { value: 'actors', label: 'Актёры' },
    { value: 'singers', label: 'Певцы' },
    { value: 'artists', label: 'Артисты' },
    { value: 'influencers', label: 'Инфлюенсеры' },
    { value: 'other', label: 'Другое' },
] as const;
