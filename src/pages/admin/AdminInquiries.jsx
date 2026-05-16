import { useEffect, useState, Fragment } from "react";
import { supabase } from "../../lib/supabase";
import { useDialog } from "../../lib/useDialog";

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const { confirm, DialogPortal } = useDialog();

  async function fetchInquiries() {
    setLoading(true);
    const { data, error } = await supabase
      .from("inquiries")
      .select("*, listings(title)")
      .order("created_at", { ascending: false });
    if (!error && data) setInquiries(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function handleDelete(id) {
    const ok = await confirm({
      title: "Smazat poptávku?",
      message: "Akce je nevratná.",
      confirmLabel: "Smazat",
      danger: true,
    });
    if (!ok) return;
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (!error) {
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div>
      <h1 className="admin__page-title">Poptávky</h1>
      <p className="admin__page-subtitle">
        Celkem: {inquiries.length} poptávek
      </p>

      {loading ? (
        <div className="loader">
          <div className="loader__spinner" />
        </div>
      ) : (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nemovitost</th>
                <th>Jméno</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Datum</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <Fragment key={inq.id}>
                  <tr
                    onClick={() => toggleExpand(inq.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{inq.id}</td>
                    <td>{inq.listings?.title || "-"}</td>
                    <td>{inq.name || "-"}</td>
                    <td>{inq.email || "-"}</td>
                    <td>{inq.phone || "-"}</td>
                    <td>{formatDate(inq.created_at)}</td>
                    <td>
                      <div className="admin__table-actions">
                        <button
                          type="button"
                          className="admin__table-btn admin__table-btn--del"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(inq.id);
                          }}
                        >
                          Smazat
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === inq.id && (
                    <tr>
                      <td colSpan={7} className="admin__inquiry-msg">
                        {inq.message || "Žádná zpráva."}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 40 }}>
                    Žádné poptávky
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <DialogPortal />
    </div>
  );
}
