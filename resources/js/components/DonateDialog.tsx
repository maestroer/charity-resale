import { useEffect, useRef, useState } from 'react';
import { DONATE, type DonateMethod } from '@/content/donate';
import { copyText } from '@/lib/clipboard';

/** Реквизит целиком — кнопка: клик копирует значение и показывает «Скопировано». */
function CopyRow({ method }: { method: DonateMethod }) {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => () => clearTimeout(timer.current), []);

    const copy = async () => {
        if (await copyText(method.value)) {
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <li>
            <button type="button" className="donate-row" onClick={copy} data-copied={copied || undefined}>
                <span className="donate-label">
                    <strong>{method.label}</strong>
                    {method.network && <span className="meta">{method.network}</span>}
                </span>
                <span className="donate-value">{method.display ?? method.value}</span>
                <span className="donate-action meta" aria-live="polite">
                    {copied ? 'Скопировано ✓' : 'Копировать'}
                </span>
            </button>
        </li>
    );
}

/** Кнопка «Поддержать проект» и окно с реквизитами. */
export function DonateButton({ className }: { className?: string }) {
    const dialog = useRef<HTMLDialogElement>(null);

    // Клик по затемнению вокруг окна закрывает его.
    const onClick = (event: React.MouseEvent<HTMLDialogElement>) => {
        if (event.target === dialog.current) {
            dialog.current.close();
        }
    };

    return (
        <>
            <button type="button" className={className} onClick={() => dialog.current?.showModal()}>
                {DONATE.title}
            </button>
            <dialog ref={dialog} className="donate" aria-labelledby="donate-title" onClick={onClick}>
                <div className="donate-body">
                    <div className="donate-head">
                        <h2 id="donate-title">{DONATE.title}</h2>
                        <button type="button" className="menu-close meta" onClick={() => dialog.current?.close()}>
                            Закрыть
                        </button>
                    </div>
                    <p className="donate-lead">{DONATE.lead}</p>

                    <p className="meta donate-group">Банковская карта</p>
                    <ul className="donate-list">
                        <CopyRow method={DONATE.card} />
                    </ul>

                    <p className="meta donate-group">Криптовалюта</p>
                    <ul className="donate-list">
                        {DONATE.crypto.map((method) => (
                            <CopyRow key={method.label} method={method} />
                        ))}
                    </ul>
                    <p className="donate-warning">{DONATE.warning}</p>
                </div>
            </dialog>
        </>
    );
}
