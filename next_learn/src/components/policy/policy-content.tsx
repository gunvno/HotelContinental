"use client";

import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getPolicyByCode, type PolicyTypeResponse } from "@/services/content-service";

const fallbackPolicies: Record<string, PolicyTypeResponse> = {
  TERMS: {
    id: "terms",
    code: "TERMS",
    titleOfType: "Điều khoản sử dụng",
    content:
      "Các điều khoản chung khi sử dụng dịch vụ đặt phòng tại Continental Grand Hotel.",
    policies: [
      {
        id: "terms-1",
        policyTypeId: "terms",
        title: "Đặt phòng",
        content:
          "Khách hàng cần cung cấp thông tin chính xác khi đặt phòng và thanh toán theo hướng dẫn của hệ thống.",
      },
      {
        id: "terms-2",
        policyTypeId: "terms",
        title: "Trách nhiệm lưu trú",
        content:
          "Khách hàng chịu trách nhiệm bảo quản tài sản cá nhân và tuân thủ quy định lưu trú của khách sạn.",
      },
    ],
  },
  PRIVACY: {
    id: "privacy",
    code: "PRIVACY",
    titleOfType: "Chính sách bảo mật",
    content:
      "Thông tin cá nhân được sử dụng để xử lý đặt phòng, thanh toán và hỗ trợ khách hàng.",
    policies: [
      {
        id: "privacy-1",
        policyTypeId: "privacy",
        title: "Thông tin thu thập",
        content:
          "Hệ thống lưu thông tin tài khoản, thông tin liên hệ, lịch sử đặt phòng và thanh toán.",
      },
      {
        id: "privacy-2",
        policyTypeId: "privacy",
        title: "Mục đích sử dụng",
        content:
          "Dữ liệu được dùng để xác nhận đặt phòng, hỗ trợ lưu trú và đối soát giao dịch.",
      },
    ],
  },
  CANCELLATION: {
    id: "cancellation",
    code: "CANCELLATION",
    titleOfType: "Chính sách hủy phòng",
    content: "Chính sách áp dụng cho các booking trực tuyến tại Continental Grand Hotel.",
    policies: [
      {
        id: "cancel-1",
        policyTypeId: "cancellation",
        title: "Hủy trước 48 giờ",
        content:
          "Khách hàng có thể hủy trước thời điểm nhận phòng 48 giờ mà không mất phí.",
      },
      {
        id: "cancel-2",
        policyTypeId: "cancellation",
        title: "Hủy sát ngày",
        content:
          "Các yêu cầu hủy sát ngày có thể phát sinh phí theo quy định vận hành của khách sạn.",
      },
    ],
  },
};

export function PolicyContent({ code }: { code: string }) {
  const normalizedCode = code.toUpperCase();
  const [policyType, setPolicyType] = useState<PolicyTypeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPolicyByCode(normalizedCode)
      .then((data) => {
        if (!mounted) return;
        setPolicyType(data);
      })
      .catch(() => {
        if (!mounted) return;
        setPolicyType(fallbackPolicies[normalizedCode] ?? fallbackPolicies.TERMS);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [normalizedCode]);

  const data = policyType ?? fallbackPolicies[normalizedCode] ?? fallbackPolicies.TERMS;

  return (
    <main className="bg-background min-h-screen pt-24">
      <section className="mx-auto w-full max-w-[980px] px-5 py-10 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="text-ring inline-flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Về trang chủ
        </Link>

        <div className="border-border mt-8 border-b pb-8">
          <div className="bg-ring/10 text-ring mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl">
            <FileText className="h-6 w-6" />
          </div>
          <p className="text-ring text-xs font-semibold tracking-[0.24em] uppercase">
            Continental Grand Hotel
          </p>
          <h1 className="text-foreground mt-3 font-serif text-[clamp(2.2rem,5vw,4rem)] leading-tight font-semibold">
            {data.titleOfType}
          </h1>
          {data.content ? (
            <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-7">
              {data.content}
            </p>
          ) : null}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            Đang tải chính sách...
          </p>
        ) : (
          <div className="mt-8 space-y-5">
            {data.policies.length === 0 ? (
              <p className="bg-muted/40 text-muted-foreground rounded-2xl p-5 text-sm">
                Chưa có nội dung chính sách.
              </p>
            ) : (
              data.policies.map((policy, index) => (
                <article
                  key={policy.id}
                  className="border-border bg-muted/25 rounded-2xl border p-5 sm:p-6"
                >
                  <p className="text-ring text-xs font-semibold tracking-[0.18em] uppercase">
                    Mục {index + 1}
                  </p>
                  <h2 className="text-foreground mt-2 text-xl font-semibold">
                    {policy.title}
                  </h2>
                  {policy.content ? (
                    <p className="text-muted-foreground mt-3 text-sm leading-7 whitespace-pre-line">
                      {policy.content}
                    </p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}
