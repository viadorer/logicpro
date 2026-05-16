import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useDialog } from "../../lib/useDialog";

const ImageUpload = forwardRef(function ImageUpload({ listingId }, ref) {
  const [existingImages, setExistingImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingPreviews, setPendingPreviews] = useState([]);
  const [dragging, setDragging] = useState(false);
  const { confirm, DialogPortal } = useDialog();

  // Fetch existing images for edit mode
  useEffect(() => {
    if (!listingId) return;
    (async () => {
      const { data } = await supabase
        .from("listing_images")
        .select("*")
        .eq("listing_id", listingId)
        .order("sort_order", { ascending: true });
      if (data) setExistingImages(data);
    })();
  }, [listingId]);

  // Create preview URLs for pending files
  useEffect(() => {
    const urls = pendingFiles.map((f) => URL.createObjectURL(f));
    setPendingPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [pendingFiles]);

  const uploadFiles = useCallback(async (targetId) => {
    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i];
      const ext = file.name.split(".").pop();
      const path = `${targetId}/${Date.now()}_${i}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("listing-images")
        .upload(path, file);

      if (upErr) continue;

      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(path);

      await supabase.from("listing_images").insert({
        listing_id: targetId,
        url: urlData.publicUrl,
        sort_order: existingImages.length + i,
        is_main: existingImages.length === 0 && i === 0 ? 1 : 0,
      });
    }
    setPendingFiles([]);
  }, [pendingFiles, existingImages.length]);

  useImperativeHandle(ref, () => ({
    uploadPending: uploadFiles,
  }));

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) setPendingFiles((prev) => [...prev, ...files]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length) setPendingFiles((prev) => [...prev, ...files]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function removePending(idx) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function deleteExisting(img) {
    const ok = await confirm({
      title: "Smazat obrázek?",
      message: "Obrázek bude trvale odstraněn.",
      confirmLabel: "Smazat",
      danger: true,
    });
    if (!ok) return;
    // Remove from storage
    const urlParts = img.url.split("/listing-images/");
    if (urlParts[1]) {
      await supabase.storage.from("listing-images").remove([urlParts[1]]);
    }
    // Remove from table
    await supabase.from("listing_images").delete().eq("id", img.id);
    setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
  }

  async function setMain(img) {
    // Unset all main
    await supabase
      .from("listing_images")
      .update({ is_main: 0 })
      .eq("listing_id", listingId);
    // Set this as main
    await supabase
      .from("listing_images")
      .update({ is_main: 1 })
      .eq("id", img.id);
    setExistingImages((prev) =>
      prev.map((i) => ({ ...i, is_main: i.id === img.id ? 1 : 0 }))
    );
  }

  return (
    <div className="img-upload">
      <div
        className={"img-upload__zone" + (dragging ? " img-upload__zone--drag" : "")}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("img-file-input").click()}
      >
        Přetáhněte obrázky sem nebo klikněte pro výběr souborů
        <input
          id="img-file-input"
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {(existingImages.length > 0 || pendingPreviews.length > 0) && (
        <div className="img-upload__preview">
          {existingImages.map((img) => (
            <div
              key={img.id}
              className={"img-upload__thumb" + (img.is_main ? " main" : "")}
            >
              <img src={img.url} alt="" />
              <div className="img-upload__thumb-actions">
                {!img.is_main && listingId && (
                  <button
                    type="button"
                    className="img-upload__thumb-btn"
                    onClick={() => setMain(img)}
                  >
                    Hlavní
                  </button>
                )}
                <button
                  type="button"
                  className="img-upload__thumb-btn"
                  onClick={() => deleteExisting(img)}
                >
                  Smazat
                </button>
              </div>
            </div>
          ))}
          {pendingPreviews.map((url, i) => (
            <div key={"p-" + i} className="img-upload__thumb">
              <img src={url} alt="" />
              <div className="img-upload__thumb-actions">
                <button
                  type="button"
                  className="img-upload__thumb-btn"
                  onClick={() => removePending(i)}
                >
                  Odebrat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <DialogPortal />
    </div>
  );
});

export default ImageUpload;
