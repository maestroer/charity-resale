declare global {
    interface Window {
        ym?: (id: number, method: string, ...args: unknown[]) => void;
        __metrikaId?: number;
    }
}

/** Просмотр страницы при переходах внутри Inertia: без этого Метрика видит только первый заход. */
export function hit(url: string): void {
    if (window.ym && window.__metrikaId) {
        window.ym(window.__metrikaId, 'hit', url);
    }
}

export function reachGoal(goal: string, params?: Record<string, unknown>): void {
    if (window.ym && window.__metrikaId) {
        window.ym(window.__metrikaId, 'reachGoal', goal, params);
    }
}
