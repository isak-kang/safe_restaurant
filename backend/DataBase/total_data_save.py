import requests
import json
import pandas as pd
import csv
import pymysql
import os
from sqlalchemy import create_engine
from tqdm import tqdm
import time
import logging

from dotenv import load_dotenv
load_dotenv()

from DB import df_load,df_save
from map_data_create import total_map_data_save
	
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

# 전체 데이터 저장 API -> totaldata
def total_administrative_action_data_save():
    start = 1
    end = 1000
    while 1 :

        url = f'http://openapi.seoul.go.kr:8088/{apikey}/json/SeoulAdminMesure/{start}/{end}'

        response = requests.get(url)
        contents = response.text
        json_ob = json.loads(contents)

        body = json_ob['SeoulAdminMesure']['row']
        dataframe = pd.DataFrame(body)
        
        try:
            dataframe.to_sql(name='tb_restaurant_hygiene', con=engine, if_exists='append', index=False)
            print(f"tb_restaurant_hygiene: 데이터 삽입 성공!{start}~{end}")
            start += 1000
            end += 1000
        except Exception as e:
            print(f"tb_restaurant_hygiene: 데이터 삽입 실패 - {e}")
            break


# 모범식당 신청 데이터 저장
def total_model_restaurant_data_save():
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


if __name__ == "__main__":
    # total_administrative_action_data_save()
    # total_model_restaurant_data_save()
    # query = "SELECT DISTINCT(SITE_ADDR_RD) FROM restaurant_hygiene.model_restaurant_apply;"
    # total_map_data_save(query)
    query = "SELECT DISTINCT(SITE_ADDR_RD) FROM restaurant_hygiene.tb_restaurant_hygiene;"
    total_map_data_save(query)
    pass