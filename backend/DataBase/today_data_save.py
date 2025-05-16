import requests
import json
import smtplib
import pandas as pd
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import csv
import pymysql
import os
from sqlalchemy import create_engine
from tqdm import tqdm
import time
import logging

from dotenv import load_dotenv
load_dotenv()

from DB import df_load,df_save,delete_data
from map_data_create import total_map_data_save

from datetime import datetime

EMAIL_ID = os.environ.get("EMAIL_ID")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD")
	
# DB
user = os.environ.get('MYSQL_USER')
password = os.environ.get('MYSQL_PASSWORD')
host = os.environ.get('MYSQL_HOST')
db = os.environ.get('MYSQL_DB')
engine = create_engine(f"mysql+pymysql://{user}:{password}@{host}/{db}")

# 행정처분 가게 api key 
apikey = os.environ.get('API_KEY')
# 로깅
logging.basicConfig(filename="coord_errors.log", level=logging.WARNING)




def send_email(to_email: str, subject: str, body: str):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_ID
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", _charset="utf-8"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_ID, EMAIL_PASSWORD)
            server.send_message(msg)
            print(f"✅ 이메일 전송 완료 → {to_email}")
    except Exception as e:
        print(f"❌ 이메일 전송 실패 → {to_email} : {e}")

def generate_email_body(df: pd.DataFrame) -> str:
    lines = []
    for _, row in df.iterrows():
        lines.append(f"📍 업소명: {row.get('UPSO_NM', '')}")
        lines.append(f"🏠 주소: {row.get('SITE_ADDR_RD', '')}")
        lines.append(f"📆 처분일: {row.get('VIOL_YMD', '')}")
        lines.append(f"📝 위반내용: {row.get('VIOL_CN', '')}")
        lines.append("-" * 40)
    return "\n".join(lines)

def get_user_emails():
    df = df_load("SELECT email FROM user")
    return df["email"].dropna().unique().tolist()

def save_and_notify():
    df_new = today_administrative_action_data_save()

    # 신규 데이터 없으면 종료
    if df_new.empty:
        print("⚠️ 오늘 새로 저장된 데이터 없음")
        return

    # 이메일 본문 및 대상 리스트 준비
    email_body = generate_email_body(df_new)
    email_list = get_user_emails()
    subject = f"[위생처분 알림] {pd.Timestamp.today().strftime('%Y-%m-%d')} 신규 등록"

    # 바로 발송
    for user_email in email_list:
        send_email(user_email, subject, email_body)













def today_administrative_action_data_save():
    now = datetime.today().strftime("%Y%m%d")
    url = f"http://openapi.seoul.go.kr:8088/{apikey}/json/SeoulAdminMesure/1/1000/20250513"
    # url = f"http://openapi.seoul.go.kr:8088/{apikey}/json/SeoulAdminMesure/1/1000/{now}"
    print(f"[API 요청] {url}")

    response = requests.get(url)
    json_ob = json.loads(response.text)

    # 데이터 없을 때 빈 DataFrame 반환
    if json_ob['SeoulAdminMesure']['RESULT']['MESSAGE'] == "해당하는 데이터가 없습니다.":
        print("⚠️ 오늘 데이터 없음")
        return pd.DataFrame()

    df = pd.DataFrame(json_ob['SeoulAdminMesure']['row'])

    try:
        df.to_sql(name='tb_restaurant_hygiene', con=engine, if_exists='append', index=False)
        print(f"✅ 데이터 삽입 성공: {len(df)}건")
        return df
    except Exception as e:
        print(f"❌ DB 저장 실패: {e}")
        return pd.DataFrame()
        





# 모범식당 신청 데이터 저장 # 마포랑 용산이 없음.
def today_model_restaurant_data_save():

    table = 'model_restaurant_apply'
    delete_data(table)

    time.sleep(2)

    gangseo = os.environ.get('GANGSEO_KEY')
    gangdong = os.environ.get('GANGDONG_KEY')
    gangbuk = os.environ.get('GANGBUK_KEY')
    jongno = os.environ.get('JONGNO_KEY')
    yeongdeungpo = os.environ.get('YEONGDEUNGPO_KEY')
    geumcheon = os.environ.get('GEUMCHEON_KEY')
    gangnam = os.environ.get('GANGNAM_KEY')
    dobong = os.environ.get('DOBONG_KEY')
    seodaemun = os.environ.get('SEODAEMUN_KEY')
    yangcheon = os.environ.get('YANGCHEON_KEY')
    jungnang = os.environ.get('JUNGNANG_KEY')
    seongdong = os.environ.get('SEONGDONG_KEY')
    dongjak = os.environ.get('DONGJAK_KEY')
    dongdaemun = os.environ.get('DONGDAEMUN_KEY')
    junggu = os.environ.get('JUNGGU_KEY')
    seocho = os.environ.get('SEOCHO_KEY')
    nowon = os.environ.get('NOWON_KEY')
    songpa = os.environ.get('SONGPA_KEY')
    eunpyeong = os.environ.get('EUNPYEONG_KEY')
    gwanak = os.environ.get('GWANAK_KEY')
    seongbuk = os.environ.get('SEONGBUK_KEY')
    gwangjin = os.environ.get('GWANGJIN_KEY')
    guro = os.environ.get('GURO_KEY')
    dic = {"gangseo" : gangseo, "gwangjin" : gwangjin,
        "sb":seongbuk,"guro":guro,"gwanak":gwanak,"ep":eunpyeong,
        "songpa":songpa,"nowon":nowon,"seocho":seocho,"junggu":junggu,
        "ddm":dongdaemun,"dongjak":dongjak,"sd":seongdong,"jungnang":jungnang,
        "yangcheon":yangcheon,"sdm":seodaemun,"dobong":dobong,"gangnam":gangnam,
        "geumcheon":geumcheon,"ydp":yeongdeungpo,"jongno":jongno,"gangbuk":gangbuk,"gd":gangdong,}

    save = []
    for key,value in dic.items():
        print(key)

        if key == "gangseo" or key == "junggu":
            url = f'http://openAPI.{key}.seoul.kr:8088/{value}/json/{key.capitalize()}ModelRestaurantApply/1/1000/'
        
        elif key == "songpa":
            url = f'http://openAPI.{key}.seoul.kr:8088/{value}/json/SpModelRestaurantApply/1/1000/'
        elif key == "gwanak":
            url = f'http://openAPI.{key}.go.kr:8088/{value}/json/GaModelRestaurantApply/1/1000/'
        elif key == "nowon":
            url = f'http://openAPI.{key}.go.kr:8088/{value}/json/NwModelRestaurantApply/1/1000/'
        elif key == "seocho":
            url = f'http://openAPI.{key}.go.kr:8088/{value}/json/ScModelRestaurantApply/1/1000/'
        elif key == "ddm":
            url = f'http://openAPI.{key}.go.kr:8088/{value}/json/DongdeamoonModelRestaurantApply/1/1000/'
        elif key == "yangcheon":
            url = f'http://openAPI.{key}.go.kr:8088/{value}/json/YcModelRestaurantApply/1/1000/'
        elif key == "sdm":
            url = f'http://openAPI.{key}.go.kr:8088/{value}/json/SeodaemunModelRestaurantApply/1/1000/'
        elif key == "gangnam":
            url = f'http://openAPI.{key}.go.kr:8088/{value}/json/GnModelRestaurantApply/1/1000/'
        elif key == "gangbuk":
            url = f'http://openAPI.{key}.go.kr:8088/{value}/json/GbModelRestaurantApply/1/1000/'
        elif key == "dongjak":
            url = f'http://openAPI.{key}.go.kr:8088/{value}/json/DjModelRestaurantApply/1/1000/'

        else:
            url = f'http://openAPI.{key}.go.kr:8088/{value}/json/{key.capitalize()}ModelRestaurantApply/1/1000/'

        url_parts = url.split('/')  
        url_tmp = str(url_parts[5])
        res = requests.get(url)
        data=res.json()

        rows =  data[url_tmp]["row"]
        print(rows)
        
        save.extend(rows)
        
        print()
        time.sleep(2)

    # flattened_data = data[0]
    df = pd.DataFrame(save)
    print(df.columns)
    print(df)
    table = 'model_restaurant_apply'
    df_save(df,table)
    print("모범식당 저장완료")

    time.sleep(10)

    print("모범식당 map데이터 저장시작")
    query = "SELECT DISTINCT(SITE_ADDR_RD) FROM restaurant_hygiene.model_restaurant_apply;"
    total_map_data_save(query)


if __name__ == "__main__":
    today_administrative_action_data_save()
    # time.sleep(2)
    # today_model_restaurant_data_save()


    # save_and_notify()


    pass