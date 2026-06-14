"use client";

import { ArrowLeft, Building2, Copy, QrCode } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  getLatestPaymentByBooking,
  getPaymentRequest,
  type PaymentRequestResponse,
} from "@/services/billing-service";
import { consumeVoucher } from "@/services/promotion-service";

const BANK_ID = "MB";
const currencyFormatter = new Intl.NumberFormat("vi-VN");

function PaymentQrContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const voucherConsumedRef = useRef(false);

  const [paymentRequest, setPaymentRequest] = useState<PaymentRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const data = useMemo(
    () => ({
      bookingId: searchParams.get("bookingId") || "",
      paymentRequestId: searchParams.get("paymentRequestId") || "",
      roomId: searchParams.get("roomId") || "",
      roomTitle: searchParams.get("roomTitle") || "Phòng khách sạn",
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      guests: Number(searchParams.get("guests") || 1),
      total: Number(searchParams.get("total") || 0),
      voucherCode: searchParams.get("voucherCode") || "",
    }),
    [searchParams],
  );

  useEffect(() => {
    if (!data.paymentRequestId) {
      setError("Thiếu mã yêu cầu thanh toán.");
      setLoading(false);
      return;
    }

    let alive = true;
    getPaymentRequest(data.paymentRequestId)
      .then((request) => {
        if (!alive) return;
        setPaymentRequest(request);
        setError(null);
      })
      .catch(() => {
        if (alive) setError("Không thể tải mã thanh toán. Vui lòng thử lại.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [data.paymentRequestId]);

  useEffect(() => {
    if (!paymentRequest || !data.bookingId) return;

    let alive = true;
    const intervalId = window.setInterval(async () => {
      try {
        const latestRequest = await getPaymentRequest(paymentRequest.id);
        if (!alive) return;
        setPaymentRequest(latestRequest);

        if (latestRequest.status === "PAID") {
          if (data.voucherCode && !voucherConsumedRef.current) {
            voucherConsumedRef.current = true;
            await consumeVoucher(data.voucherCode, data.bookingId);
          }

          let paymentId = latestRequest.providerTransactionId || latestRequest.id;
          try {
            const payment = await getLatestPaymentByBooking(data.bookingId);
            paymentId = payment.id;
          } catch {
            // Payment request is already paid; allow the customer to leave the waiting screen.
          }

          router.push(
            `/payment/success?${new URLSearchParams({
              bookingId: data.bookingId,
              paymentId,
              roomId: data.roomId,
              roomTitle: data.roomTitle,
              checkIn: data.checkIn,
              checkOut: data.checkOut,
              guests: String(data.guests),
              total: String(latestRequest.amount),
            }).toString()}`,
          );
        }

        if (latestRequest.status === "EXPIRED" || latestRequest.status === "FAILED") {
          setError("Mã thanh toán đã hết hạn hoặc thất bại. Vui lòng tạo lại booking.");
        }
      } catch {
        // Polling is best-effort; transient errors should not interrupt the QR screen.
      }
    }, 3000);

    return () => {
      alive = false;
      window.clearInterval(intervalId);
    };
  }, [data, paymentRequest, router]);

  const transferAmount = paymentRequest?.amount ?? data.total;
  const transferContent = paymentRequest?.transferContent ?? `BOOKING ${data.bookingId}`;
  const bankName = paymentRequest?.bankName ?? "MB Bank";
  const bankAccountNo = paymentRequest?.bankAccountNo ?? "0386404269";
  const bankAccountName = paymentRequest?.bankAccountName ?? "TA VAN LONG";
  const fallbackQrUrl = `https://img.vietqr.io/image/${BANK_ID}-${bankAccountNo}-compact2.png?amount=${transferAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankAccountName)}`;
  const qrUrl = buildQrImageSource(paymentRequest?.providerQrCode, fallbackQrUrl);
  const isPayosQr = Boolean(paymentRequest?.providerQrCode);

  async function copyText(value: string) {
    await navigator.clipboard?.writeText(value);
  }

  return (
    <main className="bg-background min-h-screen">
      <section className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-8 lg:px-10">
        <Link
          href="/payment"
          className="text-ring inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại xác nhận
        </Link>

        <div className="mx-auto mt-8 max-w-3xl text-center">
          <h1 className="text-foreground font-serif text-[clamp(2.2rem,5vw,3.5rem)] leading-tight font-semibold">
            Quét mã QR để thanh toán
          </h1>
          <p className="text-muted-foreground mt-3 text-base">
            Booking đang ở trạng thái chờ thanh toán. Sau khi PayOS xác nhận chuyển khoản,
            hệ thống sẽ tự chuyển sang màn hình thành công.
          </p>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          <article className="border-border/70 bg-muted/35 rounded-2xl border p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="bg-ring text-background inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                <QrCode className="h-4 w-4" />
              </span>
              <h2 className="text-foreground font-serif text-3xl">Mã chuyển khoản PayOS</h2>
            </div>

            {loading ? (
              <p className="text-muted-foreground rounded-xl bg-white/70 p-5 text-sm">
                Đang tải mã thanh toán...
              </p>
            ) : (
              <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
                <div className="border-border bg-background rounded-2xl border p-4">
                  <div className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                    <QrCode className="text-ring h-4 w-4" />
                    {isPayosQr ? "Mã QR PayOS" : "Mã QR chuyển khoản"}
                  </div>
                  <img
                    src={qrUrl}
                    alt={isPayosQr ? "Mã QR PayOS" : "Mã QR chuyển khoản"}
                    className="mx-auto aspect-square w-full rounded-xl bg-white object-contain"
                  />
                  {!isPayosQr ? (
                    <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                      Chưa lấy được QR từ PayOS. Hệ thống đang thử lại khi trang còn mở.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <BankInfoRow label="Ngân hàng" value={bankName} />
                  <BankInfoRow
                    label="Số tài khoản"
                    value={bankAccountNo}
                    copyValue={bankAccountNo}
                    onCopy={copyText}
                  />
                  <BankInfoRow label="Chủ tài khoản" value={bankAccountName} />
                  <BankInfoRow
                    label="Số tiền"
                    value={formatMoney(transferAmount)}
                    copyValue={String(transferAmount)}
                    onCopy={copyText}
                  />
                  <BankInfoRow
                    label="Nội dung chuyển khoản"
                    value={transferContent}
                    copyValue={transferContent}
                    onCopy={copyText}
                  />

                  <p className="bg-ring/10 text-muted-foreground rounded-xl p-3 text-sm leading-6">
                    Nếu khách thoát khỏi trang này mà chưa chuyển khoản, booking vẫn giữ trạng
                    thái chờ thanh toán. Khi giao dịch thành công, webhook sẽ cập nhật trạng
                    thái tự động.
                  </p>

                  {error ? (
                    <p className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">
                      {error}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </article>

          <aside className="border-border/70 bg-muted/35 rounded-2xl border p-5 sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-foreground font-serif text-3xl">Tóm tắt</h3>
            <div className="border-border mt-4 border-t pt-4">
              <div className="flex items-center gap-3">
                <div className="bg-background flex h-16 w-16 items-center justify-center rounded-lg">
                  <Building2 className="text-ring h-7 w-7" />
                </div>
                <div>
                  <p className="text-ring font-semibold">{data.roomTitle}</p>
                  <p className="text-muted-foreground text-xs">ID: {data.roomId}</p>
                  <p className="text-muted-foreground text-xs">{data.guests} người lớn</p>
                </div>
              </div>
            </div>

            <div className="border-border bg-background mt-4 rounded-xl border p-3">
              <div className="border-border grid grid-cols-2 gap-3 border-b pb-2">
                <InfoBlock label="Ngày nhận phòng" value={data.checkIn} />
                <InfoBlock label="Ngày trả phòng" value={data.checkOut} />
              </div>
              <p className="text-muted-foreground pt-2 text-sm">Mã booking: {data.bookingId}</p>
            </div>

            <div className="border-border mt-5 border-t pt-4">
              <p className="text-muted-foreground text-[11px] tracking-[0.12em] uppercase">
                Trạng thái
              </p>
              <p className="text-ring mt-1 font-semibold">
                {paymentRequest?.status === "PAID"
                  ? "Đã thanh toán"
                  : paymentRequest?.status === "EXPIRED"
                    ? "Đã hết hạn"
                    : "Chờ thanh toán"}
              </p>

              <div className="mt-5 flex items-end justify-between">
                <span className="text-foreground text-lg">Tổng cộng</span>
                <p className="text-ring text-[2rem] leading-none font-semibold">
                  {formatMoney(transferAmount)}
                </p>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function BankInfoRow({
  label,
  value,
  copyValue,
  onCopy,
}: {
  label: string;
  value: string;
  copyValue?: string;
  onCopy?: (value: string) => void;
}) {
  return (
    <div className="border-border bg-background rounded-xl border px-4 py-3">
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-foreground text-sm font-semibold break-all">{value}</p>
        {copyValue && onCopy ? (
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => onCopy(copyValue)}
            className="border-border text-muted-foreground hover:text-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
          >
            <Copy className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <p className="text-foreground mt-1 text-sm">{value}</p>
    </div>
  );
}

function formatMoney(value?: number) {
  return `${currencyFormatter.format(Number(value ?? 0))}đ`;
}

function buildQrImageSource(providerQrCode: string | undefined, fallbackQrUrl: string) {
  const qrCode = providerQrCode?.trim();
  if (!qrCode) {
    return fallbackQrUrl;
  }

  if (qrCode.startsWith("http://") || qrCode.startsWith("https://")) {
    return qrCode;
  }

  if (qrCode.startsWith("data:image/")) {
    return qrCode;
  }

  if (/^[A-Za-z0-9+/=]+$/.test(qrCode) && qrCode.length > 200) {
    return `data:image/png;base64,${qrCode}`;
  }

  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(qrCode)}`;
}

export default function PaymentQrPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-background min-h-screen p-10 text-center">
          Đang tải mã QR...
        </main>
      }
    >
      <ProtectedRoute>
        <PaymentQrContent />
      </ProtectedRoute>
    </Suspense>
  );
}
