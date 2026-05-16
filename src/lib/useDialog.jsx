import { useState, useCallback } from "react";
import { ConfirmDialog, PromptDialog } from "../components/Modal";

/**
 * Hook ktery vrati { confirm, prompt, DialogPortal }.
 * Pouziti:
 *   const { confirm, DialogPortal } = useDialog();
 *   ...
 *   if (!(await confirm({ title: "Smazat?" }))) return;
 *   ...
 *   return (<>...<DialogPortal /></>);
 */
export function useDialog() {
  const [confirmState, setConfirmState] = useState(null);
  const [promptState, setPromptState] = useState(null);
  const [confirmResolver, setConfirmResolver] = useState(null);
  const [promptResolver, setPromptResolver] = useState(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      setConfirmResolver(() => resolve);
      setConfirmState(opts || {});
    });
  }, []);

  const prompt = useCallback((opts) => {
    return new Promise((resolve) => {
      setPromptResolver(() => resolve);
      setPromptState(opts || {});
    });
  }, []);

  function handleConfirmResult(v) {
    confirmResolver?.(v);
    setConfirmResolver(null);
    setConfirmState(null);
  }
  function handlePromptResult(v) {
    promptResolver?.(v);
    setPromptResolver(null);
    setPromptState(null);
  }

  function DialogPortal() {
    return (
      <>
        <ConfirmDialog state={confirmState} onResult={handleConfirmResult} />
        <PromptDialog state={promptState} onResult={handlePromptResult} />
      </>
    );
  }

  return { confirm, prompt, DialogPortal };
}
