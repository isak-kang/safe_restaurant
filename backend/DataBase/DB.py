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

def delete_data(query):
    with engine.begin() as conn: 
        try:
            conn.execute(text("SET SQL_SAFE_UPDATES = 0;"))
            conn.execute(text(query))
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




def update_from_csv(csv_file, table_name):
    # 1) CSV 읽기
    df = pd.read_csv(csv_file)

    # 2) name이 널이 아닌 행만 필터
    df = df[df['name'].notnull()]

    # 2) 필요한 컬럼만 선택
    df = df[['upso_nm', 'score', 'url', 'addr']]

    # 3) NaN → None 변환
    df = df.where(pd.notnull(df), None)  # 모든 NaN을 None으로 치환[^1]

    # 4) 트랜잭션 내에서 UPDATE 실행
    with engine.begin() as conn:
        for row in df.itertuples(index=False):
            stmt = text(f"""
                UPDATE {table_name}
                SET score = :score,
                    url   = :url,
                    addr  = :addr
                WHERE upso_nm = :upso_nm
            """)
            conn.execute(stmt, {
                'score':   row.score,
                'url':     row.url,
                'addr':    row.addr,
                'upso_nm': row.upso_nm
            })


def update_addr_from_csv(csv_path):
    # 2) CSV 읽기 및 addr null 제거
    df = pd.read_csv(csv_path)
    df = df[df['addr'].notnull()]

    # 4) NaN → None 변환
    df = df.where(pd.notnull(df), None)

    # 5) 트랜잭션 내에서 복합 매칭 UPDATE
    with engine.begin() as conn:
        for row in df.itertuples(index=False):
            stmt = text("""
                UPDATE kakao
                SET addr = :addr, url = :url,score = :score
                WHERE upso_nm = :upso_nm
            """)
            conn.execute(stmt, {
                'addr':    row.addr,
                'upso_nm': row.upso_nm,
                'url': row.url,
                "score" : row.score
            })

def insert_addr_from_csv(csv_path):
    # 1) CSV 읽기 및 addr null 제거
    df = pd.read_csv(csv_path)
    df = df[df['addr'].notnull()]

    # 3) NaN → None 변환
    df = df.where(pd.notnull(df), None)

    # 4) 트랜잭션 내에서 INSERT
    with engine.begin() as conn:
        for row in df.itertuples(index=False):
            stmt = text("""
                INSERT INTO kakao (score, url, addr, upso_nm)
                VALUES (:score, :url, :addr,:upso_nm )
            """)
            conn.execute(stmt, {
                'score': row.score,
                'url': row.url,
                'addr': row.addr,
                'upso_nm' : row.upso_nm
            })

            
if __name__ == "__main__":
    # table = "model_restaurant_apply2"
    # csv_ = "C:/Users/ISAK/Desktop/python/safe_restaurant/서울시 마포구 모범음식점 지정 현황.csv"
    # csv_2 = "C:/Users/ISAK/Desktop/python/safe_restaurant/서울시 용산구 모범음식점 지정 현황.csv"
    # insert_addr_from_csv('C:/Users/ISAK/Desktop/python/safe_restaurant/crawled_kakao_img_urls.csv')
    # csv_save(csv_2,table)
    update_addr_from_csv("C:/Users/ISAK/Desktop/python/safe_restaurant/333.csv")
    pass
 