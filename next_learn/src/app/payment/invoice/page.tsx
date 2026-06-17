"use client";

import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Clock3,
  Download,
  Loader2,
  Printer,
  Send,
  ShieldCheck,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { getInvoiceByBooking, type InvoiceResponse } from "@/services/billing-service";
import {
  changeRoomBookingDates,
  cancelRoomBooking,
  getMyRoomBookings,
  type RoomBookingResponse,
} from "@/services/booking-service";
import {
  getMyFeedback,
  submitFeedback,
  type FeedbackResponse,
} from "@/services/feedback-service";
import { useAuthStore } from "@/store/auth-store";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function InvoiceContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [booking, setBooking] = useState<RoomBookingResponse | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [changeDateLoading, setChangeDateLoading] = useState(false);
  const [showDateForm, setShowDateForm] = useState(false);
  const [newCheckin, setNewCheckin] = useState("");
  const [newCheckout, setNewCheckout] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");
  const [changeDateMessage, setChangeDateMessage] = useState("");
  const [error, setError] = useState("");

  const canReview = useMemo(
    () => booking?.status === "DONE" || booking?.detailStatus === "CHECKED_OUT",
    [booking?.detailStatus, booking?.status],
  );
  const firstName = useAuthStore((state) => state.firstName);
  const lastName = useAuthStore((state) => state.lastName);
  const userName = useAuthStore((state) => state.userName);
  const customerDisplayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() || userName || null;

  useEffect(() => {
    if (!bookingId) {
      setError("Thiếu mã booking để tải hóa đơn.");
      setLoading(false);
      return;
    }

    let alive = true;

    async function loadInvoice() {
      setLoading(true);
      setError("");
      try {
        const [invoiceData, bookings] = await Promise.all([
          getInvoiceByBooking(bookingId),
          getMyRoomBookings().catch(() => []),
        ]);

        if (!alive) return;

        const matchedBooking = bookings.find((item) => item.id === bookingId) ?? null;
        setInvoice(invoiceData);
        setBooking(matchedBooking);
        setNewCheckin(toDateTimeInputValue(matchedBooking?.checkin));
        setNewCheckout(toDateTimeInputValue(matchedBooking?.checkout));

        if (matchedBooking?.bookingDetailId) {
          const existingFeedback = await getMyFeedback(matchedBooking.bookingDetailId).catch(
            () => null,
          );
          if (!alive) return;

          if (existingFeedback && !existingFeedback.roomId && invoiceData.roomId) {
            const repairedFeedback = await submitFeedback({
              roomBookingDetailId: matchedBooking.bookingDetailId,
              roomId: invoiceData.roomId,
              rating: existingFeedback.rating,
              comment: existingFeedback.comment,
              customerName: existingFeedback.customerName ?? customerDisplayName,
              anonymous: Boolean(existingFeedback.anonymous),
            }).catch(() => existingFeedback);

            if (!alive) return;
            setFeedback(repairedFeedback);
          } else {
            setFeedback(existingFeedback);
          }
        }
      } catch {
        if (alive) {
          setError("Không thể tải hóa đơn. Vui lòng kiểm tra trạng thái thanh toán.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    void loadInvoice();

    return () => {
      alive = false;
    };
  }, [bookingId, customerDisplayName]);

  async function handleSubmitFeedback() {
    if (!booking?.bookingDetailId || feedbackLoading || feedback) return;
    if (!comment.trim()) {
      setFeedbackMessage("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setFeedbackLoading(true);
    setFeedbackMessage("");
    try {
      const savedFeedback = await submitFeedback({
        roomBookingDetailId: booking.bookingDetailId,
        roomId: invoice?.roomId ?? booking.roomId,
        rating,
        comment: comment.trim(),
        customerName: customerDisplayName,
        anonymous,
      });
      setFeedback(savedFeedback);
      setComment("");
      setFeedbackMessage("");
    } catch {
      setFeedbackMessage("Không thể gửi đánh giá lúc này. Vui lòng thử lại sau.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  async function handleCancelBooking() {
    if (!booking || cancelLoading) return;

    setCancelLoading(true);
    setCancelMessage("");
    try {
      const updatedBooking = await cancelRoomBooking(booking.id);
      setBooking(updatedBooking);
      setCancelMessage(
        updatedBooking.status === "CANCEL_REQUESTED"
          ? "Yêu cầu hủy đã được gửi. Bộ phận lễ tân sẽ kiểm tra và xử lý hoàn tiền nếu có."
          : "Booking chưa thanh toán đã được hủy.",
      );
    } catch {
      setCancelMessage(
        "Không thể gửi yêu cầu hủy. Vui lòng kiểm tra thời hạn hủy hoặc liên hệ bộ phận hỗ trợ.",
      );
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleChangeDates() {
    if (!booking || changeDateLoading) return;
    if (!newCheckin || !newCheckout) {
      setChangeDateMessage("Vui lòng chọn đầy đủ ngày nhận và ngày trả phòng.");
      return;
    }

    setChangeDateLoading(true);
    setChangeDateMessage("");
    try {
      const updatedBooking = await changeRoomBookingDates(booking.id, {
        checkin: new Date(newCheckin).toISOString(),
        checkout: new Date(newCheckout).toISOString(),
      });
      setBooking(updatedBooking);
      setNewCheckin(toDateTimeInputValue(updatedBooking.checkin));
      setNewCheckout(toDateTimeInputValue(updatedBooking.checkout));
      setShowDateForm(false);
      setChangeDateMessage("Ngày lưu trú đã được cập nhật.");
    } catch {
      setChangeDateMessage(
        "Không thể đổi ngày. Vui lòng kiểm tra hạn 48 giờ, khoảng ngày mới hoặc phòng còn trống.",
      );
    } finally {
      setChangeDateLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="border-border bg-background mt-7 rounded-2xl border p-10 text-center">
        Đang tải hóa đơn...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || "Không tìm thấy hóa đơn."}
      </div>
    );
  }

  return (
    <div className="mt-7 space-y-6">
      <article className="border-border bg-background overflow-hidden rounded-2xl border">
        <div className="bg-ring h-1.5 w-full" />
        <div className="p-6 sm:p-8">
          <div className="border-border grid gap-6 border-b pb-6 sm:grid-cols-2">
            <section>
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
                Hóa đơn
              </p>
              <h2 className="text-foreground mt-2 font-serif text-3xl font-semibold">
                {invoice.invoiceNo}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Mã booking: {invoice.roomBookingId}
              </p>
              <p className="text-muted-foreground text-sm">
                Mã thanh toán: {invoice.paymentId}
              </p>
            </section>

            <section className="sm:text-right">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
                Khách sạn
              </p>
              <h3 className="text-foreground mt-2 font-serif text-3xl italic">
                Continental Grand Hotel
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Phương thức: {paymentMethodLabel(invoice.paymentMethod)}
              </p>
              <p className="text-muted-foreground text-sm">0386404269 - TA VAN LONG</p>
            </section>
          </div>

          <div className="mt-6">
            {booking ? (
              <StayInfoPanel
                booking={booking}
                showDateForm={showDateForm}
                newCheckin={newCheckin}
                newCheckout={newCheckout}
                changeDateLoading={changeDateLoading}
                changeDateMessage={changeDateMessage}
                cancelLoading={cancelLoading}
                cancelMessage={cancelMessage}
                onToggleDateForm={() => setShowDateForm((value) => !value)}
                onNewCheckinChange={setNewCheckin}
                onNewCheckoutChange={setNewCheckout}
                onChangeDates={() => void handleChangeDates()}
                onCancel={() => void handleCancelBooking()}
              />
            ) : null}

            <div className="border-border text-muted-foreground grid grid-cols-[1fr_120px] border-b pb-3 text-[10px] font-semibold tracking-[0.16em] uppercase sm:grid-cols-[1fr_150px]">
              <p>Khoản mục</p>
              <p className="text-right">Thành tiền</p>
            </div>

            <LineItem
              icon={<BedDouble className="h-4 w-4" />}
              title="Tiền phòng"
              description={`Phòng ${invoice.roomId}`}
              value={formatMoney(invoice.totalRoomPrice)}
            />
            <LineItem
              title="Dịch vụ bổ sung"
              description="Dịch vụ khách chọn trước thanh toán hoặc gọi thêm trong thời gian lưu trú."
              value={formatMoney(invoice.totalServicePrice)}
            />
            <LineItem
              title="VAT, ưu đãi và phụ phí"
              description="Tổng phụ phí sau ưu đãi thành viên hoặc voucher nếu có."
              value={formatMoney(invoice.totalExtraPrice)}
            />

            <div className="mt-6 flex flex-col items-end gap-2">
              <Price label="Tổng bill" value={formatMoney(invoice.totalPrice)} />
              <div className="border-border mt-2 flex w-full max-w-[300px] justify-between border-t pt-3 text-lg font-bold">
                <span>Đã thanh toán</span>
                <span className="text-ring">{formatMoney(invoice.paidAmount)}</span>
              </div>
              <p className="text-muted-foreground text-xs">
                Ngày thanh toán: {formatDate(invoice.paymentTime)}
              </p>
            </div>
          </div>
        </div>
      </article>

      <FeedbackPanel
        canReview={canReview}
        feedback={feedback}
        rating={rating}
        comment={comment}
        message={feedbackMessage}
        submitting={feedbackLoading}
        onRatingChange={setRating}
        onCommentChange={setComment}
        anonymous={anonymous}
        onAnonymousChange={setAnonymous}
        onSubmit={() => void handleSubmitFeedback()}
      />
    </div>
  );
}

function StayInfoPanel({
  booking,
  showDateForm,
  newCheckin,
  newCheckout,
  changeDateLoading,
  changeDateMessage,
  cancelLoading,
  cancelMessage,
  onToggleDateForm,
  onNewCheckinChange,
  onNewCheckoutChange,
  onChangeDates,
  onCancel,
}: {
  booking: RoomBookingResponse;
  showDateForm: boolean;
  newCheckin: string;
  newCheckout: string;
  changeDateLoading: boolean;
  changeDateMessage: string;
  cancelLoading: boolean;
  cancelMessage: string;
  onToggleDateForm: () => void;
  onNewCheckinChange: (value: string) => void;
  onNewCheckoutChange: (value: string) => void;
  onChangeDates: () => void;
  onCancel: () => void;
}) {
  const changeDeadline = subtractHours(booking.checkin, 48);
  const cancelDeadline = subtractHours(booking.checkin, 72);
  const isChangeAvailable = canUsePolicyBefore(booking, 48);
  const isCancelAvailable = canUsePolicyBefore(booking, 72);
  const canRequestCancel = isCancelAvailable && booking.status !== "CANCEL_REQUESTED";

  return (
    <section className="border-border bg-muted/40 mb-6 rounded-2xl border p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-ring text-[10px] font-bold tracking-[0.18em] uppercase">
            Thông tin lưu trú
          </p>
          <h3 className="text-foreground mt-1 text-lg font-semibold">
            {bookingStatusLabel(booking.status)} / {detailStatusLabel(booking.detailStatus)}
          </h3>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#8a5724]">
          {stayDurationLabel(booking.checkin, booking.checkout)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <StayInfoItem
          icon={<CalendarDays className="h-4 w-4" />}
          label="Ngày nhận phòng"
          value={formatDateTime(booking.checkin)}
        />
        <StayInfoItem
          icon={<CalendarDays className="h-4 w-4" />}
          label="Ngày trả phòng"
          value={formatDateTime(booking.checkout)}
        />
        <StayInfoItem
          icon={<Clock3 className="h-4 w-4" />}
          label="Đổi ngày miễn phí trước"
          value={changeDeadline ? formatDateTime(changeDeadline) : "Chưa có"}
          helper={isChangeAvailable ? "Còn trong thời hạn 48 giờ" : "Đã quá hạn đổi ngày"}
          tone={isChangeAvailable ? "success" : "muted"}
        />
        <StayInfoItem
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Hủy miễn phí trước"
          value={cancelDeadline ? formatDateTime(cancelDeadline) : "Chưa có"}
          helper={isCancelAvailable ? "Còn trong thời hạn 72 giờ" : "Đã quá hạn hủy miễn phí"}
          tone={isCancelAvailable ? "success" : "muted"}
        />
      </div>

      <div className="mt-4 rounded-xl bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-foreground text-sm font-semibold">Đổi ngày lưu trú</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Chỉ áp dụng khi còn trước giờ nhận phòng tối thiểu 48 giờ và phòng còn trống.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleDateForm}
            disabled={!isChangeAvailable || changeDateLoading}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#c47b30] px-5 text-sm font-semibold text-[#9b5c24] transition hover:bg-[#fff6df] disabled:cursor-not-allowed disabled:border-[#eadcc9] disabled:text-[#b49a7d]"
          >
            {showDateForm ? "Đóng chỉnh sửa" : "Đổi ngày"}
          </button>
        </div>

        {showDateForm ? (
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="block">
              <span className="text-muted-foreground text-[10px] font-bold tracking-[0.14em] uppercase">
                Ngày nhận phòng mới
              </span>
              <input
                type="datetime-local"
                value={newCheckin}
                onChange={(event) => onNewCheckinChange(event.target.value)}
                className="border-border bg-background mt-2 h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-[#c47b30]"
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground text-[10px] font-bold tracking-[0.14em] uppercase">
                Ngày trả phòng mới
              </span>
              <input
                type="datetime-local"
                value={newCheckout}
                onChange={(event) => onNewCheckoutChange(event.target.value)}
                className="border-border bg-background mt-2 h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-[#c47b30]"
              />
            </label>
            <button
              type="button"
              onClick={onChangeDates}
              disabled={changeDateLoading}
              className="bg-ring text-background inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changeDateLoading ? "Đang lưu..." : "Lưu ngày mới"}
            </button>
          </div>
        ) : null}

        {changeDateMessage ? (
          <div className="mt-3 rounded-xl bg-[#fff6df] p-3 text-sm font-semibold text-[#8a5724]">
            {changeDateMessage}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-foreground text-sm font-semibold">Yêu cầu hủy đặt phòng</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Booking đã thanh toán sẽ chuyển sang trạng thái chờ lễ tân duyệt, không hoàn tiền tự động.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={!canRequestCancel || cancelLoading}
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#c47b30] px-5 text-sm font-semibold text-[#9b5c24] transition hover:bg-[#fff6df] disabled:cursor-not-allowed disabled:border-[#eadcc9] disabled:text-[#b49a7d]"
        >
          {cancelLoading
            ? "Đang gửi..."
            : booking.status === "PENDING"
              ? "Hủy booking"
              : booking.status === "CANCEL_REQUESTED"
                ? "Đã gửi yêu cầu"
                : "Gửi yêu cầu hủy"}
        </button>
      </div>

      {cancelMessage ? (
        <div className="mt-3 rounded-xl bg-[#fff6df] p-3 text-sm font-semibold text-[#8a5724]">
          {cancelMessage}
        </div>
      ) : null}
    </section>
  );
}

function StayInfoItem({
  icon,
  label,
  value,
  helper,
  tone = "muted",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper?: string;
  tone?: "success" | "muted";
}) {
  return (
    <div className="border-border bg-background rounded-xl border p-4">
      <div className="flex items-start gap-3">
        <span className="bg-muted text-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-muted-foreground text-[10px] font-bold tracking-[0.14em] uppercase">
            {label}
          </p>
          <p className="text-foreground mt-1 font-semibold">{value}</p>
          {helper ? (
            <p
              className={`mt-1 text-xs font-medium ${
                tone === "success" ? "text-emerald-700" : "text-[#9d8f82]"
              }`}
            >
              {helper}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FeedbackPanel({
  canReview,
  feedback,
  rating,
  comment,
  message,
  submitting,
  onRatingChange,
  onCommentChange,
  anonymous,
  onAnonymousChange,
  onSubmit,
}: {
  canReview: boolean;
  feedback: FeedbackResponse | null;
  rating: number;
  comment: string;
  message: string;
  submitting: boolean;
  onRatingChange: (value: number) => void;
  onCommentChange: (value: string) => void;
  anonymous: boolean;
  onAnonymousChange: (value: boolean) => void;
  onSubmit: () => void;
}) {
  if (feedback) {
    return (
      <section className="border-border bg-background rounded-2xl border p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-ring text-[10px] font-bold tracking-[0.18em] uppercase">
              Feedback
            </p>
            <h3 className="text-foreground mt-1 font-serif text-3xl font-semibold">
              Cảm ơn bạn đã đánh giá
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Đánh giá của bạn đã được ghi nhận cho kỳ nghỉ này.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
            Đã đánh giá
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="border-border bg-background rounded-2xl border p-6 sm:p-8">
      <div>
        <p className="text-ring text-[10px] font-bold tracking-[0.18em] uppercase">
          Feedback
        </p>
        <h3 className="text-foreground mt-1 font-serif text-3xl font-semibold">
          Đánh giá kỳ nghỉ
        </h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Sau khi checkout, bạn có thể gửi đánh giá để khách sạn cải thiện dịch vụ.
        </p>
      </div>

      {!canReview ? (
        <div className="bg-muted text-muted-foreground mt-5 rounded-xl p-4 text-sm">
          Booking chưa checkout nên chưa thể đánh giá. Form sẽ mở sau khi lễ tân hoàn
          tất checkout.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
              Mức hài lòng
            </p>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onRatingChange(value)}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                    value <= rating
                      ? "border-[#c47b30] bg-[#c47b30] text-white"
                      : "border-[#eadcc9] bg-white text-[#b49a7d]"
                  }`}
                  aria-label={`${value} sao`}
                >
                  <Star className="h-4 w-4" fill={value <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
              Nội dung đánh giá
            </span>
            <textarea
              value={comment}
              onChange={(event) => onCommentChange(event.target.value)}
              rows={4}
              className="border-border bg-background mt-2 w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#c47b30]"
              placeholder="Chia sẻ trải nghiệm lưu trú của bạn..."
            />
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-[#eadcc9] bg-[#fffaf2] p-4 text-sm text-[#514439]">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(event) => onAnonymousChange(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#c47b30]"
            />
            <span>
              <span className="block font-semibold text-[#1c1c19]">Đánh giá ẩn danh</span>
              <span className="text-xs">
                Nếu bật, đánh giá của bạn sẽ hiển thị là "Khách đã lưu trú".
              </span>
            </span>
          </label>

          {message ? (
            <div className="rounded-xl bg-[#fff6df] p-3 text-sm font-semibold text-[#8a5724]">
              {message}
            </div>
          ) : null}

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="bg-ring text-background inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Gửi đánh giá
          </button>
        </div>
      )}
    </section>
  );
}

function LineItem({
  icon,
  title,
  description,
  value,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="border-border/50 grid grid-cols-[1fr_120px] items-center gap-3 border-b py-4 sm:grid-cols-[1fr_150px]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="bg-muted text-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          {icon ?? <span className="h-2 w-2 rounded-full bg-current" />}
        </span>
        <div className="min-w-0">
          <p className="text-foreground font-semibold">{title}</p>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </div>
      <p className="text-foreground text-right font-semibold">{value}</p>
    </div>
  );
}

function Price({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full max-w-[300px] justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function formatMoney(value?: number) {
  return `${currencyFormatter.format(Number(value ?? 0))}đ`;
}

function formatDate(value?: string) {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return "Chưa có";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function subtractHours(value?: string, hours = 0) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
}

function toDateTimeInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function canUsePolicyBefore(booking: RoomBookingResponse, hoursBeforeCheckin: number) {
  if (booking.status !== "PENDING" && booking.status !== "DEPOSITED") return false;
  if (booking.detailStatus !== "BOOKED") return false;
  const checkin = new Date(booking.checkin);
  if (Number.isNaN(checkin.getTime())) return false;
  return Date.now() < checkin.getTime() - hoursBeforeCheckin * 60 * 60 * 1000;
}

function stayDurationLabel(checkin?: string, checkout?: string) {
  if (!checkin || !checkout) return "Chưa có thời gian";
  const start = new Date(checkin);
  const end = new Date(checkout);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Chưa có thời gian";
  }
  const days = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)),
  );
  return `${days} đêm`;
}

function bookingStatusLabel(status?: RoomBookingResponse["status"]) {
  switch (status) {
    case "PENDING":
      return "Chờ thanh toán";
    case "DEPOSITED":
      return "Đã thanh toán";
    case "CANCEL_REQUESTED":
      return "Yêu cầu hủy";
    case "CHECKED_IN":
      return "Đang lưu trú";
    case "DONE":
      return "Đã hoàn tất";
    case "CANCEL":
      return "Đã hủy";
    default:
      return "Không xác định";
  }
}

function detailStatusLabel(status?: RoomBookingResponse["detailStatus"]) {
  switch (status) {
    case "BOOKED":
      return "Đã giữ phòng";
    case "CHECKED_IN":
      return "Đã nhận phòng";
    case "CHECKED_OUT":
      return "Đã trả phòng";
    case "CANCELED":
      return "Đã hủy phòng";
    case "NO_SHOW":
      return "Không đến";
    default:
      return "Không xác định";
  }
}

function paymentMethodLabel(value?: string) {
  switch (value) {
    case "BANK_TRANSFER":
      return "Chuyển khoản ngân hàng";
    case "ONLINE_PAYMENT":
      return "Thanh toán trực tuyến";
    case "CASH":
      return "Tiền mặt";
    default:
      return value || "Không xác định";
  }
}

export default function InvoicePage() {
  return (
    <ProtectedRoute>
      <main className="bg-background min-h-screen">
        <section className="mx-auto w-full max-w-[980px] px-5 py-8 sm:px-8 lg:px-10">
          <Link
            href="/account/invoices"
            className="text-ring inline-flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách hóa đơn
          </Link>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-foreground font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-tight font-semibold">
                Chi tiết hóa đơn
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Hóa đơn được tổng hợp từ booking và giao dịch thanh toán thành công.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-muted text-foreground inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Lưu PDF
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-ring text-background inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold"
              >
                <Printer className="h-4 w-4" />
                In hóa đơn
              </button>
            </div>
          </div>

          <Suspense fallback={<div className="p-10 text-center">Đang tải hóa đơn...</div>}>
            <InvoiceContent />
          </Suspense>
        </section>
      </main>
    </ProtectedRoute>
  );
}
