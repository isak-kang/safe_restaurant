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

from datetime import datetime


	
# DB
user = os.environ.get('MYSQL_USER')
password = os.environ.get('MYSQL_PASSWORD')
host = os.environ.get('MYSQL_HOST')
db = os.environ.get('MYSQL_DB')
engine = create_engine(f"mysql+pymysql://{user}:{password}@{host}/{db}")

gocode = os.environ.get('GOCODE_KEY')

# 주소 -> 좌표 
def get_coords(address):
    apiurl = "https://api.vworld.kr/req/address?"
    params = {
        "service": "address",
        "request": "getcoord",
        "crs": "epsg:4326",
        "address": address,
        "format": "json",
        "type": "road",
        "key": gocode
    }

    try:
        response = requests.get(apiurl, params=params, timeout=3)
        if response.status_code == 200:
            result = response.json().get("response", {}).get("result")
            if result and "point" in result:
                point = result["point"]
                return float(point["x"]), float(point["y"])
            else:
                logging.warning(f"[결과 없음] 주소: {address}")
        else:
            logging.warning(f"[응답 오류] 주소: {address}, Status Code: {response.status_code}")
    except Exception as e:
        logging.warning(f"[예외 발생] 주소: {address}, 예외: {str(e)}")

    return None, None

# 좌표 데이터 저장
def total_map_data_save(query):
    # 좌표 저장이 필요한 데이터
    df = df_load(query)
    df['SITE_ADDR_RD'] = df['SITE_ADDR_RD'].str.split(',').str[0]
    df = df.drop_duplicates(subset=["SITE_ADDR_RD"]).reset_index(drop=True)
    
    # 기존의 좌표 데이터 로드
    query2 = 'SELECT DISTINCT SITE_ADDR_RD FROM tb_map WHERE longitude IS NOT NULL AND latitude IS NOT NULL'
    existing_df = df_load(query2)
    existing_addresses = set(existing_df['SITE_ADDR_RD'].tolist())

    # 없는거만 저장
    df = df[~df['SITE_ADDR_RD'].isin(existing_addresses)].reset_index(drop=True)

    # 좌표 저장할 목록          
    print(df)

    # 없으면 그만~
    if df.empty:
        print("저장할 새로운 주소가 없습니다.")
        return

    # 좌표 컬럼 추가!
    df["longitude"] = None
    df["latitude"] = None

    for idx, row in tqdm(df.iterrows(), total=len(df)):
        addr = row["SITE_ADDR_RD"]
        x, y = get_coords(addr)

        df.at[idx, "longitude"] = x
        df.at[idx, "latitude"] = y
        time.sleep(0.2)
        print(addr, x, y)

    df = df.dropna(subset=["longitude", "latitude"]).reset_index(drop=True)

    if df.empty:
        print("유효한 좌표가 없어 저장하지 않습니다.")
        return

    try : 
        df_save(df, "tb_map")
        print("map데이터 저장완료")

    except :
        print("map데이터 저장 실패")


if __name__ == "__main__":
    query = "SELECT DISTINCT(SITE_ADDR_RD) FROM restaurant_hygiene.model_restaurant_apply2;"
    total_map_data_save(query)