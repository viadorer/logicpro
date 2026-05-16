import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Pristupne modal okno. Esc zavira, focus se vraci na trigger.
 *
 * <Modal isOpen={...} onClose={...} title="...">
 *   <p>Obsah</p>
 *   <div className="modal__actions">
 *     <button onClick={onClose}>Zrusit</button>
 *     <button onClick={confirm}>Potvrdit</button>
 *   </div>
 * </Modal>
 */
export default function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);
  const previousActiveRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    previousActiveRef.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    // Focus prvni focusable v modalu
    const t = setTimeout(() => {
      dialogRef.current?.querySelector("input, button, [tabindex]")?.focus();
    }, 0);
    // Zamknout scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
      try { previousActiveRef.current?.focus?.(); } catch { /* ignore */ }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose?.();
  }

  return createPortal(
    <div className="modal-backdrop" onMouseDown={handleBackdrop}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {title && (
          <div className="modal__header">
            <h3 className="modal__title" id="modal-title">{title}</h3>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({ state, onResult }) {
  if (!state) return null;
  return (
    <Modal
      isOpen={true}
      onClose={() => onResult(false)}
      title={state.title || "Potvrzení"}
    >
      <div className="modal__body">
        {state.message || "Opravdu chcete pokračovat?"}
      </div>
      <div className="modal__actions">
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => onResult(false)}
        >
          {state.cancelLabel || "Zrušit"}
        </button>
        <button
          type="button"
          className={`btn btn--sm ${state.danger ? "btn--danger" : "btn--fill"}`}
          onClick={() => onResult(true)}
        >
          {state.confirmLabel || "Potvrdit"}
        </button>
      </div>
    </Modal>
  );
}

export function PromptDialog({ state, onResult }) {
  const [value, setValue] = useState(state?.defaultValue || "");
  if (!state) return null;
  function submit(e) {
    e?.preventDefault?.();
    onResult(value.trim() ? value.trim() : null);
  }
  return (
    <Modal
      isOpen={true}
      onClose={() => onResult(null)}
      title={state.title || "Zadejte hodnotu"}
    >
      <form onSubmit={submit}>
        <div className="modal__body">
          {state.message && <p style={{ margin: 0 }}>{state.message}</p>}
          <input
            className="modal__input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={state.placeholder || ""}
            autoFocus
          />
        </div>
        <div className="modal__actions">
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => onResult(null)}
          >
            Zrušit
          </button>
          <button type="submit" className="btn btn--fill btn--sm">
            {state.confirmLabel || "OK"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
