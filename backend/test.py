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

from DataBase.DB import df_load,df_save

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
                return address,":",float(point["x"]), float(point["y"])
                
            else:
                logging.warning(f"[결과 없음] 주소: {address}")
        else:
            logging.warning(f"[응답 오류] 주소: {address}, Status Code: {response.status_code}")
    except Exception as e:
        logging.warning(f"[예외 발생] 주소: {address}, 예외: {str(e)}")

    return None, None

print(get_coords("서울특별시 중랑구 중랑천로10길 39"))