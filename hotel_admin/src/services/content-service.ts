import { http } from "@/lib/http";

type ApiResponse<T> = {
  result?: T;
  content?: T;
};

export type PolicyResponse = {
  id: string;
  policyTypeId: string;
  title: string;
  content?: string;
};

export type PolicyTypeResponse = {
  id: string;
  code: string;
  titleOfType: string;
  content?: string;
  policies: PolicyResponse[];
};

export type PolicyTypePayload = {
  code: string;
  titleOfType: string;
  content?: string;
};

export type PolicyPayload = {
  policyTypeId: string;
  title: string;
  content?: string;
};

export async function getPolicyTypes() {
  const res = await http
    .get("content/policies")
    .json<ApiResponse<PolicyTypeResponse[]>>();
  return (res.result ?? res.content ?? []) as PolicyTypeResponse[];
}

export async function createPolicyType(payload: PolicyTypePayload) {
  const res = await http
    .post("content/policies/types", { json: payload })
    .json<ApiResponse<PolicyTypeResponse>>();
  return (res.result ?? res.content) as PolicyTypeResponse;
}

export async function updatePolicyType(id: string, payload: PolicyTypePayload) {
  const res = await http
    .put(`content/policies/types/${id}`, { json: payload })
    .json<ApiResponse<PolicyTypeResponse>>();
  return (res.result ?? res.content) as PolicyTypeResponse;
}

export async function createPolicy(payload: PolicyPayload) {
  const res = await http
    .post("content/policies", { json: payload })
    .json<ApiResponse<PolicyResponse>>();
  return (res.result ?? res.content) as PolicyResponse;
}

export async function updatePolicy(id: string, payload: PolicyPayload) {
  const res = await http
    .put(`content/policies/${id}`, { json: payload })
    .json<ApiResponse<PolicyResponse>>();
  return (res.result ?? res.content) as PolicyResponse;
}
