import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type PolicyResponse = {
  id: string;
  policyTypeId: string;
  title: string;
  content?: string;
  createdTime?: string;
  modifiedTime?: string;
};

export type PolicyTypeResponse = {
  id: string;
  code: string;
  titleOfType: string;
  content?: string;
  policies: PolicyResponse[];
  createdTime?: string;
  modifiedTime?: string;
};

export async function getPolicyTypes() {
  const res = await http
    .get("content/policies")
    .json<ApiResponse<PolicyTypeResponse[]>>();
  return (res.result ?? res.content ?? []) as PolicyTypeResponse[];
}

export async function getPolicyByCode(code: string) {
  const res = await http
    .get(`content/policies/${code}`)
    .json<ApiResponse<PolicyTypeResponse>>();
  return (res.result ?? res.content) as PolicyTypeResponse;
}
