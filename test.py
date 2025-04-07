import os
from dotenv import load_dotenv
import requests
import time
import pandas as pd
load_dotenv()
from DataBase.DB import df_save

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
    print()
    print()
    print()
    time.sleep(2)

# flattened_data = data[0]
df = pd.DataFrame(save)
print(df.columns)
print(df)
table = 'model_restaurant_apply'
df_save(df,table)
#gangbuk #gangnam #sdm #yangcheon #dongjak #ddm# seocho# nowon# songpa # 관악