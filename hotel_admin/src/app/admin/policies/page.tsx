"use client";

import { FileText, Plus, RefreshCcw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { usePermission } from "@/hooks/use-permission";
import {
  createPolicy,
  createPolicyType,
  getPolicyTypes,
  type PolicyResponse,
  type PolicyTypeResponse,
  updatePolicy,
  updatePolicyType,
} from "@/services/content-service";

const inputClass =
  "h-11 w-full rounded-xl border border-[#decdb9] bg-white px-4 text-sm text-[#17213a] outline-none transition focus:border-[#9b5c24] focus:ring-2 focus:ring-[#9b5c24]/15";

const textareaClass =
  "w-full rounded-xl border border-[#decdb9] bg-white px-4 py-3 text-sm text-[#17213a] outline-none transition focus:border-[#9b5c24] focus:ring-2 focus:ring-[#9b5c24]/15";

const typeInitial = {
  code: "",
  titleOfType: "",
  content: "",
};

const policyInitial = {
  title: "",
  content: "",
};

export default function AdminPoliciesPage() {
  const permission = usePermission();
  const [policyTypes, setPolicyTypes] = useState<PolicyTypeResponse[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [typeForm, setTypeForm] = useState(typeInitial);
  const [policyForm, setPolicyForm] = useState(policyInitial);
  const [editingPolicy, setEditingPolicy] = useState<PolicyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingAction, setSavingAction] = useState<"type" | "policy" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedType = useMemo(
    () => policyTypes.find((item) => item.id === selectedTypeId) ?? null,
    [policyTypes, selectedTypeId],
  );
  const canViewPolicies = permission.has("POLICY_VIEW");
  const canCreatePolicyType = permission.has("POLICY_TYPE_CREATE");
  const canUpdatePolicyType = permission.has("POLICY_TYPE_UPDATE");
  const canCreatePolicy = permission.has("POLICY_CREATE");
  const canUpdatePolicy = permission.has("POLICY_UPDATE");
  const canSaveSelectedType = selectedType ? canUpdatePolicyType : canCreatePolicyType;
  const canSaveSelectedPolicy = editingPolicy ? canUpdatePolicy : canCreatePolicy;
  const isActionBusy = isLoading || savingAction !== null;

  async function loadPolicies(nextSelectedId?: string) {
    if (savingAction) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const data = await getPolicyTypes();
      setPolicyTypes(data);
      setSelectedTypeId((prev) => nextSelectedId || prev || data[0]?.id || "");
    } catch {
      setMessage("KhÃ´ng thá»ƒ táº£i danh sÃ¡ch chÃ­nh sÃ¡ch.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPolicies();
  }, []);

  useEffect(() => {
    if (!selectedType) return;
    setTypeForm({
      code: selectedType.code,
      titleOfType: selectedType.titleOfType,
      content: selectedType.content ?? "",
    });
    setEditingPolicy(null);
    setPolicyForm(policyInitial);
  }, [selectedType]);

  async function handleSaveType(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isActionBusy) return;
    setMessage(null);

    try {
      setSavingAction("type");
      const payload = {
        ...typeForm,
        code: typeForm.code.trim().toUpperCase(),
        titleOfType: typeForm.titleOfType.trim(),
      };

      if (selectedType) {
        const updated = await updatePolicyType(selectedType.id, payload);
        setMessage("ÄÃ£ cáº­p nháº­t nhÃ³m chÃ­nh sÃ¡ch.");
        await loadPolicies(updated.id);
      } else {
        const created = await createPolicyType(payload);
        setMessage("ÄÃ£ táº¡o nhÃ³m chÃ­nh sÃ¡ch.");
        await loadPolicies(created.id);
      }
    } catch {
      setMessage("KhÃ´ng thá»ƒ lÆ°u nhÃ³m chÃ­nh sÃ¡ch.");
    } finally {
      setSavingAction(null);
    }
  }

  async function handleSavePolicy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isActionBusy) return;
    if (!selectedType) {
      setMessage("Vui lÃ²ng chá»n hoáº·c táº¡o nhÃ³m chÃ­nh sÃ¡ch trÆ°á»›c.");
      return;
    }

    setMessage(null);
    try {
      setSavingAction("policy");
      const payload = {
        policyTypeId: selectedType.id,
        title: policyForm.title.trim(),
        content: policyForm.content,
      };

      if (editingPolicy) {
        await updatePolicy(editingPolicy.id, payload);
        setMessage("ÄÃ£ cáº­p nháº­t má»¥c chÃ­nh sÃ¡ch.");
      } else {
        await createPolicy(payload);
        setMessage("ÄÃ£ thÃªm má»¥c chÃ­nh sÃ¡ch.");
      }

      setEditingPolicy(null);
      setPolicyForm(policyInitial);
      await loadPolicies(selectedType.id);
    } catch {
      setMessage("KhÃ´ng thá»ƒ lÆ°u má»¥c chÃ­nh sÃ¡ch.");
    } finally {
      setSavingAction(null);
    }
  }

  function startCreateType() {
    if (isActionBusy) return;
    setSelectedTypeId("");
    setTypeForm(typeInitial);
    setEditingPolicy(null);
    setPolicyForm(policyInitial);
  }

  function startEditPolicy(policy: PolicyResponse) {
    setEditingPolicy(policy);
    setPolicyForm({
      title: policy.title,
      content: policy.content ?? "",
    });
  }

  if (!canViewPolicies) {
    return (
      <PermissionDenied message="Báº¡n khÃ´ng cÃ³ quyá»n POLICY_VIEW Ä‘á»ƒ xem chÃ­nh sÃ¡ch." />
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#decdb9] bg-white/75 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
              Ná»™i dung
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#17213a]">
              Quáº£n lÃ½ chÃ­nh sÃ¡ch
            </h2>
            <p className="mt-1 text-sm text-[#7c6f63]">
              Quáº£n lÃ½ Ä‘iá»u khoáº£n, báº£o máº­t, há»§y phÃ²ng vÃ  cÃ¡c ná»™i dung
              phÃ¡p lÃ½ hiá»ƒn thá»‹ cho khÃ¡ch.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canCreatePolicyType ? (
              <button
                type="button"
                onClick={startCreateType}
                disabled={isActionBusy}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#9b5c24] px-5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                NhÃ³m má»›i
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void loadPolicies()}
              disabled={isActionBusy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#decdb9] px-5 text-sm font-semibold text-[#5f5144]"
            >
              <RefreshCcw className="h-4 w-4" />
              Táº£i láº¡i
            </button>
          </div>
        </div>
      </div>

      {message ? (
        <p className="rounded-xl bg-[#fff6df] p-3 text-sm text-[#8a5724]">{message}</p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="rounded-2xl border border-[#decdb9] bg-white/80 p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
            NhÃ³m chÃ­nh sÃ¡ch
          </p>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-[#7c6f63]">Äang táº£i...</p>
          ) : policyTypes.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#7c6f63]">
              ChÆ°a cÃ³ nhÃ³m chÃ­nh sÃ¡ch.
            </p>
          ) : (
            <div className="space-y-2">
              {policyTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedTypeId(type.id)}
                  disabled={isActionBusy}
                  className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                    selectedTypeId === type.id
                      ? "bg-[#9b5c24] text-white"
                      : "bg-[#f7efe5] text-[#17213a] hover:bg-[#efe0ce]"
                  }`}
                >
                  <span className="block text-xs font-bold tracking-[0.12em] uppercase opacity-75">
                    {type.code}
                  </span>
                  <span className="mt-1 block font-semibold">{type.titleOfType}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <div className="space-y-6">
          {canSaveSelectedType ? (
            <form
              onSubmit={handleSaveType}
              className="rounded-2xl border border-[#decdb9] bg-white/80 p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#9b5c24] text-white">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#17213a]">
                    {selectedType ? "Cáº­p nháº­t nhÃ³m" : "Táº¡o nhÃ³m chÃ­nh sÃ¡ch"}
                  </h3>
                  <p className="text-sm text-[#7c6f63]">
                    MÃ£ nÃªn dÃ¹ng: TERMS, PRIVACY, CANCELLATION.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="MÃ£">
                  <input
                    value={typeForm.code}
                    onChange={(event) =>
                      setTypeForm((prev) => ({
                        ...prev,
                        code: event.target.value.toUpperCase(),
                      }))
                    }
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="TiÃªu Ä‘á»">
                  <input
                    value={typeForm.titleOfType}
                    onChange={(event) =>
                      setTypeForm((prev) => ({
                        ...prev,
                        titleOfType: event.target.value,
                      }))
                    }
                    required
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="MÃ´ táº£">
                <textarea
                  value={typeForm.content}
                  onChange={(event) =>
                    setTypeForm((prev) => ({ ...prev, content: event.target.value }))
                  }
                  rows={3}
                  className={textareaClass}
                />
              </Field>
              <button
                type="submit"
                disabled={isActionBusy}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#9b5c24] px-5 text-sm font-bold tracking-[0.12em] text-white uppercase"
              >
                <Save className="h-4 w-4" />
                {savingAction === "type" ? "Đang lưu..." : "LÆ°u nhÃ³m"}
              </button>
            </form>
          ) : null}

          {canSaveSelectedPolicy ? (
            <form
              onSubmit={handleSavePolicy}
              className="rounded-2xl border border-[#decdb9] bg-white/80 p-6 shadow-sm"
            >
              <h3 className="mb-4 text-lg font-bold text-[#17213a]">
                {editingPolicy ? "Sá»­a má»¥c chÃ­nh sÃ¡ch" : "ThÃªm má»¥c chÃ­nh sÃ¡ch"}
              </h3>
              <Field label="TiÃªu Ä‘á» má»¥c">
                <input
                  value={policyForm.title}
                  onChange={(event) =>
                    setPolicyForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Ná»™i dung">
                <textarea
                  value={policyForm.content}
                  onChange={(event) =>
                    setPolicyForm((prev) => ({ ...prev, content: event.target.value }))
                  }
                  rows={6}
                  className={textareaClass}
                />
              </Field>
              <button
                type="submit"
                disabled={isActionBusy}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#9b5c24] px-5 text-sm font-bold tracking-[0.12em] text-white uppercase"
              >
                <Save className="h-4 w-4" />
                {savingAction === "policy"
                  ? "Đang lưu..."
                  : editingPolicy
                    ? "Cáº­p nháº­t má»¥c"
                    : "ThÃªm má»¥c"}
              </button>
            </form>
          ) : null}

          <div className="rounded-2xl border border-[#decdb9] bg-white/80 p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-[#17213a]">
              CÃ¡c má»¥c hiá»‡n cÃ³
            </h3>
            {!selectedType ? (
              <p className="py-8 text-center text-sm text-[#7c6f63]">
                Chá»n má»™t nhÃ³m chÃ­nh sÃ¡ch Ä‘á»ƒ xem ná»™i dung.
              </p>
            ) : selectedType.policies.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#7c6f63]">
                NhÃ³m nÃ y chÆ°a cÃ³ má»¥c chÃ­nh sÃ¡ch.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedType.policies.map((policy) => (
                  <button
                    key={policy.id}
                    type="button"
                    disabled={isActionBusy}
                    onClick={() => canUpdatePolicy && startEditPolicy(policy)}
                    className={`w-full rounded-2xl border border-[#eee3d5] p-4 text-left ${
                      canUpdatePolicy ? "hover:border-[#9b5c24]" : "cursor-default"
                    }`}
                  >
                    <p className="font-bold text-[#17213a]">{policy.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-[#7c6f63]">
                      {policy.content || "ChÆ°a cÃ³ ná»™i dung"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block space-y-2">
      <span className="text-xs font-bold tracking-[0.14em] text-[#5f5144] uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
