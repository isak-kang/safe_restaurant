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

# def data