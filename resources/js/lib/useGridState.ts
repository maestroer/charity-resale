import { router, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { BlockId } from '@/types';
import { appPath, to } from '@/lib/url';

gsap.registerPlugin(Flip, CustomEase);
// cubic-bezier(0.4, 0, 0.2, 1) — общая кривая крупного движения.
CustomEase.create('main', 'M0,0 C0.4,0 0.2,1 1,1');

const BLOCK_IDS: BlockId[] = ['veshi', 'istoriya', 'fond'];
const CONTENT_FADE_MS = 150;

function parseOpen(url: string): BlockId | null {
    const parsed = new URL(appPath(url), 'http://localhost');

    // Карточка вещи открывается панелью поверх раскрытого каталога.
    if (parsed.pathname.startsWith('/veshi/')) {
        return 'veshi';
    }

    const value = parsed.searchParams.get('open');

    return BLOCK_IDS.includes(value as BlockId) ? (value as BlockId) : null;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isStacked = () => window.matchMedia('(max-width: 767px)').matches;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Состояние сетки живёт в URL (/?open=veshi), поэтому работают «назад» и «вперёд».
 * `open` управляет геометрией, `ready` — содержимым: оно появляется только когда блоки встали,
 * а при закрытии гаснет до того, как поедет геометрия.
 */
export function useGridState(stageRef: RefObject<HTMLElement | null>) {
    const target = parseOpen(usePage().url);
    const [open, setOpen] = useState<BlockId | null>(target);
    const [ready, setReady] = useState<BlockId | null>(target);
    // Блок, который лежит поверх соседей: при закрытии он остаётся сверху, пока геометрия не встанет.
    const [lift, setLift] = useState<BlockId | null>(target);
    const current = useRef({ open: target, ready: target });
    const run = useRef(0);
    const tween = useRef<gsap.core.Timeline | null>(null);
    // FLIP: «First» снимается до смены раскладки, «Last / Invert / Play» — в layout-эффекте после неё.
    const first = useRef<{ state: Flip.FlipState; run: number } | null>(null);

    current.current = { open, ready };

    useEffect(() => {
        if (current.current.open === target && current.current.ready === target) {
            return;
        }

        const id = ++run.current;
        const stage = stageRef.current;

        (async () => {
            if (!stage || prefersReducedMotion()) {
                setOpen(target);
                setLift(target);
                setReady(target);

                return;
            }

            if (current.current.ready) {
                setReady(null);
                await sleep(CONTENT_FADE_MS);
                if (id !== run.current) {
                    return;
                }
            }

            if (current.current.open === target) {
                setReady(target);

                return;
            }

            const blocks = stage.querySelectorAll<HTMLElement>('[data-block]');
            const state = Flip.getState(blocks);

            // Прерванная анимация оставляет инлайновые размеры: убираем их, иначе новая раскладка измерится неверно.
            tween.current?.kill();
            gsap.set(blocks, { clearProps: 'all' });
            first.current = { state, run: id };
            setLift(target ?? current.current.open);
            setOpen(target);
        })();
    }, [target, stageRef]);

    useLayoutEffect(() => {
        const pending = first.current;
        const stage = stageRef.current;
        first.current = null;

        if (!pending || !stage) {
            return;
        }

        const blocks = stage.querySelectorAll<HTMLElement>('[data-block]');

        tween.current = Flip.from(pending.state, {
            duration: isStacked() ? 0.6 : 1,
            delay: 0.2,
            ease: 'main',
            onComplete: () => {
                gsap.set(blocks, { clearProps: 'all' });
                if (pending.run === run.current) {
                    setLift(open);
                    setReady(open);
                }
            },
        });
    }, [open, stageRef]);

    const go = useCallback((next: BlockId | null) => {
        router.push({
            url: to(next ? `/?open=${next}` : '/'),
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    // Клик по раскрытому блоку или по любому свёрнутому, пока что-то раскрыто, возвращает исходную сетку.
    const toggle = useCallback((id: BlockId) => go(target === null ? id : null), [go, target]);
    const close = useCallback(() => target !== null && go(null), [go, target]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [close]);

    return { open, ready, lift, toggle, close, go };
}
