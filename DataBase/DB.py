import requests
import json
import pandas as pd
import csv
import pymysql
import os
from sqlalchemy import create_engine

from dotenv import load_dotenv
load_dotenv()

# DB
user = os.environ.get('MYSQL_USER')
password = os.environ.get('MYSQL_PASSWORD')
host = os.environ.get('MYSQL_HOST') # 탄력적ip사용해야할듯 ..
db = os.environ.get('MYSQL_DB')
engine = create_engine(f"mysql+pymysql://{user}:{password}@{host}/{db}")

def df_load(query):
    df = pd.read_sql(query, con=engine) 
    return df

def df_save(df,table):
    try:
        df.to_sql(name= table, con=engine, if_exists='append', index=False)
        print(f"{table}: {len(df)}개의 데이터 저장완료")

    except Exception as e:
        print(f"{table}: 데이터 삽입 실패 - {e}")

if __name__ == "__main__":
    pass