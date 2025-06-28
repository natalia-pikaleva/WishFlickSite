import aiosmtplib
from email.message import EmailMessage
from config import EMAIL_YANDEX_PASSWORD


def make_html_email(code):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #f6f6fa; padding: 40px;">
        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #dedede; padding: 32px;">
          <h2 style="color: #6A49C8;">Код подтверждения регистрации</h2>
          <p>Здравствуйте!</p>
          <p>Ваш код подтверждения:</p>
          <div style="font-size: 2em; letter-spacing: 6px; background: #f3eaff; color: #6A49C8; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
            <b>{code}</b>
          </div>
          <p>Введите этот код на сайте WishFlick для завершения регистрации.</p>
          <hr style="margin: 32px 0;">
          <p style="font-size: 0.9em; color: #888;">Если вы не регистрировались на WishFlick, просто проигнорируйте это письмо.</p>
        </div>
      </body>
    </html>
    """


async def send_email_async(to_email: str, subject: str, code: str):
    message = EmailMessage()
    message["From"] = "WishFlick <deva032006@yandex.ru>"
    message["To"] = to_email
    message["Subject"] = subject

    # Текстовая версия (на всякий случай)
    text_body = f"Здравствуйте!\n\nВаш код подтверждения: {code}\n\nВведите его на сайте для завершения регистрации."
    message.set_content(text_body)

    # HTML-версия
    html_body = make_html_email(code)
    message.add_alternative(html_body, subtype="html")

    await aiosmtplib.send(
        message,
        hostname="smtp.yandex.ru",
        port=587,
        username="deva032006@yandex.ru",
        password=EMAIL_YANDEX_PASSWORD,
        start_tls=True,
    )
