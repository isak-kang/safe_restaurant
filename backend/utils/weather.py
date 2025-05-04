import requests
import datetime
import os
from dotenv import load_dotenv
load_dotenv()
	
# DB
serviceKey = os.environ.get('WEATHER_KEY')

def weather_data():
    # 1. 현재 시간 기준 base_date와 base_time 생성
    now = datetime.datetime.now()
    now = now - datetime.timedelta(hours=1)
    base_date = now.strftime("%Y%m%d")
    base_time = now.strftime("%H%M")

    # 2. API 호출
    url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst'
    params = {
        'serviceKey': serviceKey,
        'pageNo': '1',
        'numOfRows': '1000',
        'dataType': 'json',
        'base_date': base_date,
        'base_time': base_time,
        'nx': '55',
        'ny': '127'
    }
    response = requests.get(url, params=params)
    items = response.json()['response']['body']['items']['item']

    # 3. 가장 가까운 fcstTime 찾기
    now_time = int(now.strftime('%H%M'))

    # fcstTime들을 정수로 변환하여 거리 계산
    fcst_times = sorted(set(int(item['fcstTime']) for item in items))
    closest_time = min(fcst_times, key=lambda t: abs(t - now_time))
    closest_time_str = f"{closest_time:04d}"

    # 4. 해당 시간(fcstTime)만 필터링
    filtered_items = [item for item in items if item['fcstTime'] == closest_time_str]

    # 5. 출력
    print(f"📍 현재 시간 기준 가장 가까운 예보 시각: {closest_time_str}")
    weather = {}
    for item in filtered_items:
        weather[item['category']] = item['fcstValue']
    return weather


def recommend_food_by_weather(weather_data):
    pt = weather_data.get("PTY")       # 강수형태
    sky = weather_data.get("SKY")      # 하늘 상태
    temp = float(weather_data.get("T1H", 0))  # 기온
    humidity = int(weather_data.get("REH", 0))  # 습도

    if pt in ['1', '2', '5', '6']:
        return {
            "condition": "비 오는 날",
            "recommend": ["모듬전", "막걸리", "해장국", "라면", "김밥", "갈비탕", "튀김", "찌개","칼국수"]
            , "memo" : "전 부치는 소리와 빗소리의 ASMR 조합, 대표적인 '감성 먹방'의 날." 
        }
    elif pt == '3' or pt == '7':
        return {
            "condition": "눈 오는 날",
            "recommend": ["찜", "탕", "전골", "찌개"]
            , "memo" : "김 모락모락 나는 국물 음식은 눈 오는 날의 정서와 찰떡궁합." 

        }
    
    elif sky == '4':
        return {
            "condition": "흐린 날",
            "recommend": ["볶음", "카레", "커피"]
            ,"memo" :  "에너지를 끌어올릴 강한 풍미의 음식이 잘 어울림."

        }
    elif sky == '3':
        return {
            "condition": "구름 많은 날",
            "recommend": ["짜장면", "짬뽕", "국수","정식"],
            "memo" : "부담 없고 조용한 하루에 잘 어울리는 음식 위주."

        }
    elif sky == '1':
        if temp >= 24:
            return {
                "condition": "맑고 더운 날",
                "recommend": ["냉면", "메밀", "회덮밥","물회"]
                , "memo" : "입 안을 시원하게 해주는 음식으로 더위 해소."

            }
        elif temp <= 5:
            return {
                "condition": "맑고 추운 날",
                "recommend": ["탕", "정식","국밥","해장국","찌개"]
                , "memo" : "추위 속에서도 집밥 같은 따뜻함을 원하게 되는 날."
            }

        else:
            return {
                "condition": "맑고 중간 날",
                "recommend": ["고기", "안창살","삼겹살","갈비","회"]
                , "memo" : "완전 좋은 날씨!! 고기, 회 등 무거운 음식 추천!"
            }

    return {
            "condition": "",
            "recommend": "",
            "memo" : ""
    }



if __name__ == "__main__":
    weather = weather_data()
    print(recommend_food_by_weather(weather))