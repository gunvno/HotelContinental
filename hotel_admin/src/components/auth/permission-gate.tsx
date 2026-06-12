"use client";

import type { ReactNode } from "react";

import { usePermission } from "@/hooks/use-permission";

type PermissionGateProps = {
  anyOf?: string[];
  allOf?: string[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function PermissionGate({
  anyOf,
  allOf,
  fallback = null,
  children,
}: PermissionGateProps) {
  const permission = usePermission();

  const hasAny = !anyOf || anyOf.length === 0 || permission.hasAny(...anyOf);
  const hasAll = !allOf || allOf.length === 0 || permission.hasAll(...allOf);

  if (!hasAny || !hasAll) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function PermissionDenied({
  message = "Bạn không có quyền sử dụng chức năng này.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
      {message}
    </div>
  );
}
