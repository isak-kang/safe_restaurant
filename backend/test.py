import smtplib
from dotenv import load_dotenv
import os

load_dotenv()
user_email = "wbsldj59@naver.com"
my_email = os.environ.get("EMAIL_ID")
password = os.environ.get("EMAIL_PASSWORD")

with smtplib.SMTP("smtp.gmail.com", 587) as connection:  # 포트 번호 명시 추천
    connection.starttls()
    connection.login(user=my_email, password=password)
    connection.sendmail(
        from_addr=my_email, 
        to_addrs=user_email, 
        msg="Subject:Hello\n\nThis is the body of my email."
    )