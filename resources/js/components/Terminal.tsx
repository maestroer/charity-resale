import { useEffect, useRef, useState, type FormEvent } from 'react';
import { TERMINAL_ANSWERS, TERMINAL_TOPICS, unknownAnswer, type AnswerLine, type TerminalContext } from '@/content/terminal';

type Line = { id: number; kind: 'command' | 'answer'; text: string; copy?: string };

const TYPE_MS = 30;
const THINK_MS = 700;
const LINE_MS = 250;
const MAX_LINES = 40;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const normalize = (text: string) => text.trim().toLowerCase().replace(/ё/g, 'е');

/** Копирует текст; старые браузеры и http без clipboard API получают запасной путь через выделение. */
async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.append(area);
        area.select();
        const ok = document.execCommand('copy');
        area.remove();
        return ok;
    }
}

function CopyLine({ text, copy }: { text: string; copy: string }) {
    const [done, setDone] = useState(false);

    const onClick = async () => {
        if (await copyText(copy)) {
            setDone(true);
            setTimeout(() => setDone(false), 1500);
        }
    };

    return (
        <button type="button" className="terminal-copy" onClick={onClick}>
            {text}
            <span aria-live="polite">{done ? ' — скопировано ✓' : ' ⧉'}</span>
        </button>
    );
}

export function Terminal({ context }: { context: TerminalContext }) {
    const [lines, setLines] = useState<Line[]>([]);
    const [typing, setTyping] = useState<string | null>(null);
    const [thinking, setThinking] = useState(false);
    const [input, setInput] = useState('');
    const log = useRef<HTMLDivElement>(null);
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

    const push = (kind: Line['kind'], entry: AnswerLine) =>
        setLines((prev) =>
            [...prev, { id: nextId.current++, kind, ...(typeof entry === 'string' ? { text: entry } : entry) }].slice(-MAX_LINES),
        );

    /** Ответ печатается построчно. */
    const answer = async (entries: AnswerLine[]) => {
        for (const entry of entries) {
            push('answer', entry);
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
        push('command', text);
    };

    const think = async () => {
        setThinking(true);
        await sleep(reducedMotion() ? 0 : THINK_MS);
        setThinking(false);
    };

    const run = async (raw: string, fromChip: boolean) => {
        const text = raw.trim();
        if (!text || busy || !alive.current) {
            return;
        }

        await echo(text, fromChip);
        await think();

        const topic = TERMINAL_TOPICS.find((name) => normalize(name) === normalize(text));
        await answer(topic ? TERMINAL_ANSWERS[topic](context) : unknownAnswer(text));

        field.current?.focus({ preventScroll: true });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        run(input, false);
        setInput('');
    };

    return (
        <div className="terminal">
            <p className="meta">Спросить о вещах</p>
            <div className="terminal-body">
                <div ref={log} className="terminal-log" role="log" aria-live="polite">
                    <p>resale@{context.site.domain}: ~</p>
                    {lines.map((line) => (
                        <p key={line.id} data-kind={line.kind}>
                            {line.kind === 'command' ? `$ ${line.text}` : line.copy ? <CopyLine text={line.text} copy={line.copy} /> : line.text}
                        </p>
                    ))}
                    {typing !== null && (
                        <p data-kind="command">
                            $ {typing}
                            <span className="terminal-caret" />
                        </p>
                    )}
                    {thinking && <p className="terminal-dots" aria-label="печатает" />}
                </div>
                <p>$ выберите тему или напишите свою</p>
                <ul className="chips">
                    {TERMINAL_TOPICS.map((chip) => (
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
                        aria-label="Своя тема"
                        placeholder="своя тема"
                        autoComplete="off"
                        maxLength={60}
                        enterKeyHint="send"
                    />
                </form>
            </div>
        </div>
    );
}
