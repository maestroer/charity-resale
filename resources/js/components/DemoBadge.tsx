import { IS_DEMO } from '@/lib/url';

/** Метка статичного демо: без неё посетитель решит, что купить вещь можно по-настоящему. */
export function DemoBadge() {
    return IS_DEMO ? <p className="demo-badge meta">Демо-версия · оплата не работает</p> : null;
}
