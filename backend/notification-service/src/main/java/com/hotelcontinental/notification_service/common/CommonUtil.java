package com.hotelcontinental.notification_service.common;

public class CommonUtil {

    public static String buildOtpRegisterSubject() {
        return "Xác thực đăng ký tài khoản - Hotel Continental";
    }

    public static String buildOtpRegisterHtml(String email, String otp) {

        String hotelName = "Hotel Continental";
        String supportPhone = "+84 912 345 678";
        String supportEmail = "support@hotelcontinental.vn";
        String address = "1 Tràng Tiền, Hoàn Kiếm, Hà Nội";

        return "<div style='font-family:Arial,sans-serif;font-size:14px;color:#333;max-width:600px;margin:0 auto'>"

                + "<h2 style='color:#b8860b;margin-bottom:8px'>" + hotelName + "</h2>"

                + "<h3 style='margin-top:0'>Xác thực đăng ký tài khoản</h3>"

                + "<p>Xin chào,</p>"

                + "<p>Bạn hoặc ai đó đã sử dụng email <strong>" + escape(email) + "</strong> để đăng ký tài khoản.</p>"

                + "<p>Mã OTP của bạn là:</p>"

                + "<div style='margin:16px 0;padding:16px;text-align:center;"
                + "font-size:28px;font-weight:bold;letter-spacing:4px;"
                + "background:#f5f5f5;border:1px dashed #b8860b;border-radius:8px'>"
                + escape(otp)
                + "</div>"

                + "<p>Mã OTP có hiệu lực trong vài phút. Vui lòng không chia sẻ mã này.</p>"

                + "<p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.</p>"

                + "<div style='margin-top:24px;padding-top:12px;border-top:1px solid #ddd;"
                + "color:#777;font-size:13px'>"

                + "<p style='margin:0'><strong>" + hotelName + "</strong></p>"
                + "<p style='margin:0'>" + address + "</p>"
                + "<p style='margin:0'>Hotline: " + supportPhone + " · Email: " + supportEmail + "</p>"

                + "</div>"
                + "</div>";
    }

    private static String escape(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}