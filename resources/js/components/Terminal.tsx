import { useEffect, useRef, useState, type FormEvent } from 'react';
import { TERMINAL_ANSWERS, TERMINAL_TOPICS, unknownAnswer, type TerminalContext } from '@/content/terminal';
import { appraise, CONDITIONS, solveCaptcha, type AppraiseRequest } from '@/lib/appraise';
import { IS_DEMO } from '@/lib/url';

type Line = { id: number; kind: 'command' | 'answer'; text: string };

/** Шаги диалога «оценить»: бренд → тип вещи → состояние. */
type Dialog = { step: 'brand' } | { step: 'type'; brand: string } | { step: 'condition'; brand: string; item_type: string };

const TYPE_MS = 30;
const THINK_MS = 700;
const LINE_MS = 250;
const MAX_LINES = 40;
const APPRAISE = 'оценить';

const PROMPTS: Record<Dialog['step'], string> = {
    brand: 'какой бренд у вещи?',
    type: 'что это за вещь? например: платье, сумка, пальто',
    condition: 'в каком она состоянии? выберите вариант ниже',
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const normalize = (text: string) => text.trim().toLowerCase().replace(/ё/g, 'е');

export function Terminal({ context }: { context: TerminalContext }) {
    const [lines, setLines] = useState<Line[]>([]);
    const [typing, setTyping] = useState<string | null>(null);
    const [thinking, setThinking] = useState(false);
    const [dialog, setDialog] = useState<Dialog | null>(null);
    const [input, setInput] = useState('');
    const log = useRef<HTMLDivElement>(null);
    const captcha = useRef<HTMLDivElement>(null);
    const field = useRef<HTMLInputElement>(null);
    const nextId = useRef(0);
    const alive = useRef(true);
    const busy = typing !== null || thinking;

    useEffect(() => {
        alive.current = true;

        return () => {
            alive.current = false;
        };
    }, []);

    useEffect(() => {
        log.current?.scrollTo({ top: log.current.scrollHeight });
    }, [lines, typing, thinking]);

    const push = (kind: Line['kind'], texts: string[]) =>
        setLines((prev) => [...prev, ...texts.map((text) => ({ id: nextId.current++, kind, text }))].slice(-MAX_LINES));

    /** Ответ печатается построчно. */
    const answer = async (texts: string[]) => {
        for (const text of texts) {
            push('answer', [text]);
            if (!reducedMotion()) {
                await sleep(LINE_MS);
            }
        }
    };

    /** Чип печатает команду посимвольно; набранное руками печатать заново незачем. */
    const echo = async (text: string, animate: boolean) => {
        if (animate && !reducedMotion()) {
            for (let i = 1; i <= text.length; i++) {
                setTyping(text.slice(0, i));
                await sleep(TYPE_MS);
            }
        }

        setTyping(null);
        push('command', [text]);
    };

    const think = async (work: Promise<unknown> | null = null) => {
        setThinking(true);
        await Promise.all([sleep(reducedMotion() ? 0 : THINK_MS), work]);
        setThinking(false);
    };

    const runAppraisal = async (request: AppraiseRequest) => {
        setThinking(true);
        let outcome = await appraise(request);

        if (outcome.kind === 'captcha' && captcha.current) {
            setThinking(false);
            await answer(['подтвердите, что вы не робот:']);

            try {
                const token = await solveCaptcha(captcha.current, outcome.clientKey);
                captcha.current.replaceChildren();
                setThinking(true);
                outcome = await appraise({ ...request, captcha_token: token });
            } catch {
                outcome = { kind: 'lines', lines: ['проверка не загрузилась. попробуйте позже.'] };
            }
        }

        setThinking(false);
        await answer(outcome.kind === 'lines' ? outcome.lines : ['не получилось пройти проверку. попробуйте позже.']);
    };

    const run = async (raw: string, fromChip: boolean) => {
        const text = raw.trim();
        if (!text || busy || !alive.current) {
            return;
        }

        await echo(text, fromChip);

        if (dialog) {
            if (normalize(text) === 'отмена') {
                setDialog(null);
                await answer(['оценка отменена.']);
            } else if (dialog.step === 'brand') {
                setDialog({ step: 'type', brand: text });
                await answer([PROMPTS.type]);
            } else if (dialog.step === 'type') {
                setDialog({ step: 'condition', brand: dialog.brand, item_type: text });
                await answer([PROMPTS.condition]);
            } else {
                const condition = CONDITIONS.find((option) => normalize(option) === normalize(text));

                if (!condition) {
                    await answer([`выберите одно из: ${CONDITIONS.join(', ')}.`]);
                } else {
                    setDialog(null);
                    await runAppraisal({ brand: dialog.brand, item_type: dialog.item_type, condition });
                }
            }
        } else {
            const topic = TERMINAL_TOPICS.find((name) => normalize(name) === normalize(text));

            if (topic === APPRAISE && IS_DEMO) {
                await think();
                await answer(['в демо-версии оценка не работает: ей нужен сервер.']);
            } else if (topic === APPRAISE) {
                setDialog({ step: 'brand' });
                await answer(['оценим, сколько вещь стоила бы в проекте. три вопроса.', PROMPTS.brand]);
            } else {
                await think();
                await answer(topic ? TERMINAL_ANSWERS[topic](context) : unknownAnswer(text));
            }
        }

        field.current?.focus({ preventScroll: true });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        run(input, false);
        setInput('');
    };

    const chips = dialog ? [...(dialog.step === 'condition' ? CONDITIONS : []), 'отмена'] : TERMINAL_TOPICS;
    const placeholder = dialog ? { brand: 'бренд', type: 'тип вещи', condition: 'состояние' }[dialog.step] : 'своя тема';

    return (
        <div className="terminal">
            <p className="meta">Спросить о вещах</p>
            <div className="terminal-body">
                <div ref={log} className="terminal-log" role="log" aria-live="polite">
                    <p>resale@{context.site.domain}: ~</p>
                    {lines.map((line) => (
                        <p key={line.id} data-kind={line.kind}>
                            {line.kind === 'command' ? `$ ${line.text}` : line.text}
                        </p>
                    ))}
                    {typing !== null && (
                        <p data-kind="command">
                            $ {typing}
                            <span className="terminal-caret" />
                        </p>
                    )}
                    {thinking && <p className="terminal-dots" aria-label="печатает" />}
                    <div ref={captcha} />
                </div>
                <p>{dialog ? `$ ${PROMPTS[dialog.step]}` : '$ выберите тему или напишите свою'}</p>
                <ul className="chips">
                    {chips.map((chip) => (
                        <li key={chip}>
                            <button type="button" className="chip" disabled={busy} onClick={() => run(chip, true)}>
                                {chip}
                            </button>
                        </li>
                    ))}
                </ul>
                <form className="terminal-input" onSubmit={submit}>
                    <span aria-hidden="true">$</span>
                    <input
                        ref={field}
                        type="text"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        aria-label={dialog ? PROMPTS[dialog.step] : 'Своя тема'}
                        placeholder={placeholder}
                        autoComplete="off"
                        maxLength={60}
                        enterKeyHint="send"
                    />
                </form>
            </div>
        </div>
    );
}
