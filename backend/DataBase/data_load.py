import requests
import json
import pandas as pd
import csv
import pymysql
import os
from sqlalchemy import create_engine,text
from DB import df_load
from dotenv import load_dotenv
load_dotenv()

# DB
user = os.environ.get('MYSQL_USER')
password = os.environ.get('MYSQL_PASSWORD')
host = os.environ.get('MYSQL_HOST') # 탄력적ip사용해야할듯 ..
db = os.environ.get('MYSQL_DB')
engine = create_engine(f"mysql+pymysql://{user}:{password}@{host}/{db}")

# def data


def query_data_load():     
    query = """
        SELECT 
            CGG_CODE,
            ASGN_YMD,
            ASGN_YY,
            UPSO_NM,
            SITE_ADDR_RD,
            SNT_UPTAE_NM,
            TRDP_AREA,
            ADMDNG_NM
        FROM model_restaurant_apply
        WHERE ASGN_YMD != '' AND ASGN_CANCEL_YMD = ''
        order by ASGN_YMD desc;
    """


    df = df_load(query)
    df["addr"] = df["SITE_ADDR_RD"].apply(lambda x: x.split(" ")[1] if isinstance(x, str) and len(x.split(" ")) > 1 else "")
    
    return df.to_dict(orient="records")


if __name__ =="__main__":
    # print(model_restaurnt_load())
    # print(query_data_load())
    pass
