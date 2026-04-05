import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendBookingConfirmationEmail = async ({ to, booking }) => {
  const movie  = booking.show?.movie?.title || 'Movie';
  const date   = booking.show?.date || 'N/A';
  const time   = booking.show?.time || 'N/A';
  const seats  = booking.bookedSeats?.join(', ') || booking.seats?.join(', ') || 'N/A';
  const amount = `$${booking.amount?.toFixed(2)}`;
  const bookingIdString = booking._id?.toString() || "";
  const ref    = bookingIdString.slice(-10).toUpperCase();
  const poster = booking.show?.movie?.poster || '';
  const qr     = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bookingIdString}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmed — ${movie}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:900;color:#e50914;letter-spacing:-0.03em;font-style:italic;text-transform:uppercase;">
                QuickShow
              </h1>
              <p style="margin:6px 0 0;font-size:12px;color:#444;letter-spacing:0.15em;text-transform:uppercase;">
                Your ticket is confirmed
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#111;border-radius:24px;overflow:hidden;border:1px solid #1e1e1e;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <tr>
                  <td width="160" valign="top" style="padding:0;">
                    <img src="${poster}" width="160" alt="${movie}"
                      style="display:block;width:160px;height:240px;object-fit:cover;border-radius:24px 0 0 0;"/>
                  </td>
                  <td valign="top" style="padding:28px 28px 24px;">

                    <div style="display:inline-block;background:#e5091420;border:1px solid #e5091440;color:#e50914;font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:14px;">
                      Booking Confirmed ✓
                    </div>

                    <h2 style="margin:0 0 20px;font-size:20px;font-weight:900;color:#ffffff;text-transform:uppercase;font-style:italic;letter-spacing:-0.02em;line-height:1.1;">
                      ${movie}
                    </h2>

                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding-bottom:12px;">
                          <p style="margin:0;font-size:9px;color:#444;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Date</p>
                          <p style="margin:3px 0 0;font-size:13px;color:#ccc;font-weight:600;">${date}</p>
                        </td>
                        <td style="padding-bottom:12px;">
                          <p style="margin:0;font-size:9px;color:#444;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Time</p>
                          <p style="margin:3px 0 0;font-size:13px;color:#ccc;font-weight:600;">${time}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:12px;" colspan="2">
                          <p style="margin:0;font-size:9px;color:#444;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Seats</p>
                          <p style="margin:3px 0 0;font-size:13px;color:#ffffff;font-weight:700;">${seats}</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <p style="margin:0;font-size:9px;color:#444;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Amount Paid</p>
                          <p style="margin:3px 0 0;font-size:22px;color:#ffffff;font-weight:900;">${amount}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td colspan="2" style="padding:0 28px;">
                    <div style="border-top:1px dashed #222;"></div>
                  </td>
                </tr>

                <tr>
                  <td colspan="2" style="padding:20px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle">
                          <p style="margin:0;font-size:8px;color:#333;text-transform:uppercase;letter-spacing:0.2em;font-weight:700;">Booking Reference</p>
                          <p style="margin:4px 0 0;font-family:'Courier New',monospace;font-size:13px;color:#555;">#${ref}</p>
                        </td>
                        <td align="right" valign="middle">
                          <img src="${qr}" width="64" height="64" alt="QR Code"
                            style="display:block;background:#fff;padding:4px;border-radius:10px;"/>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#333;line-height:1.6;">
                Show this email or QR code at the entrance.<br/>
                Enjoy your movie experience! 🎬
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 0 0;text-align:center;border-top:1px solid #111;margin-top:32px;">
              <p style="margin:0;font-size:10px;color:#222;">
                © 2026 QuickShow. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: 'QuickShow <onboarding@resend.dev>',
    to,
    subject: `✅ Booking Confirmed — ${movie} on ${date}`,
    html,
  });

  console.log(`✅ Confirmation email sent to ${to}`);
};