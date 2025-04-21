import requests
import json
import pandas as pd
import csv
import pymysql
import os
from sqlalchemy import create_engine,text

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

def csv_save(csv_file,table_name):

    df = pd.read_csv(csv_file)

    df.to_sql(name=table_name, con=engine, if_exists='append', index=False)


# def delete_data(table):
#     with engine.connect() as conn:
#         try:
#             conn.execute(text("SET SQL_SAFE_UPDATES = 0;"))
#             conn.execute(text(f'DELETE FROM {table};'))
#             conn.execute(text("SET SQL_SAFE_UPDATES = 1;"))

#             print("데이터 삭제 완료")
#         except Exception as e:
#             print(f"삭제 중 오류 발생: {str(e)}")

def delete_data(table):
    with engine.begin() as conn: 
        try:
            conn.execute(text("SET SQL_SAFE_UPDATES = 0;"))
            conn.execute(text(f"DELETE FROM {table};"))
            conn.execute(text("SET SQL_SAFE_UPDATES = 1;"))

            print("데이터 삭제 완료")
        except Exception as e:
            print(f"삭제 중 오류 발생: {str(e)}")


def row_insert(query, params):
    try:
        with engine.connect() as conn:
            conn.execute(text(query), params or {})
            conn.commit()
            print("쿼리 실행 완료")
    except Exception as e:
        print(f"쿼리 실행 실패: {e}")    

if __name__ == "__main__":
    
    query = """
            INSERT INTO user (id, password, name, email, address)
            VALUES (:id, :password, :name, :email, :address)
            """
    data = {
        "id": "id",
        "password": "hashed_password",
        "name": "name",
        "email": "email",
        "address": "address"
    }
    row_insert(query,data)
    
    pass