import requests
import datetime
import os
from dotenv import load_dotenv
load_dotenv()

# API KEY
serviceKey = os.environ.get('WEATHER_KEY')

def weather_data():
    now = datetime.datetime.now() - datetime.timedelta(hours=1)
    base_date = now.strftime("%Y%m%d")
    base_time = now.strftime("%H%M")

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

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()

        data = response.json()
        items = data['response']['body']['items']['item']

        now_time = int(now.strftime('%H%M'))
        fcst_times = sorted(set(int(item['fcstTime']) for item in items))
        closest_time = min(fcst_times, key=lambda t: abs(t - now_time))
        closest_time_str = f"{closest_time:04d}"
        print(f"📍 현재 시간 기준 가장 가까운 예보 시각: {closest_time_str}")

        filtered_items = [item for item in items if item['fcstTime'] == closest_time_str]
        weather = {item['category']: item['fcstValue'] for item in filtered_items}
        return weather

    except Exception as e:
        print(f"❌ 날씨 API 요청 실패: {e}")
        return {}  # 실패 시 빈 dict 반환

def recommend_food_by_weather(weather_data):
    # 비어 있거나 실패한 경우 기본 메시지 반환
    if not weather_data:
        return {
            "condition": "API를 가져오는데 실패했어요 ㅠㅠ 잘모르겠습니다.",
            "recommend": [""],
            "memo": "날씨 API를 가져오는데 실패했습니다."
        }

    pt = weather_data.get("PTY")
    sky = weather_data.get("SKY")
    try:
        temp = float(weather_data.get("T1H", 0))
        humidity = int(weather_data.get("REH", 0))
    except (ValueError, TypeError):
        temp = 0
        humidity = 0

    if pt in ['1', '2', '5', '6']:
        return {
            "condition": "비 오는 날",
            "recommend": ["모듬전", "막걸리", "해장국", "라면", "김밥", "갈비탕", "튀김", "찌개", "칼국수"],
            "memo": "전 부치는 소리와 빗소리의 ASMR 조합, 대표적인 '감성 먹방'의 날."
        }
    elif pt in ['3', '7']:
        return {
            "condition": "눈 오는 날",
            "recommend": ["찜", "탕", "전골", "찌개"],
            "memo": "김 모락모락 나는 국물 음식은 눈 오는 날의 정서와 찰떡궁합."
        }
    elif sky == '4':
        return {
            "condition": "흐린 날",
            "recommend": ["볶음", "카레", "커피"],
            "memo": "에너지를 끌어올릴 강한 풍미의 음식이 잘 어울림."
        }
    elif sky == '3':
        return {
            "condition": "구름 많은 날",
            "recommend": ["짜장면", "짬뽕", "국수", "정식"],
            "memo": "부담 없고 조용한 하루에 잘 어울리는 음식 위주."
        }
    elif sky == '1':
        if temp >= 24:
            return {
                "condition": "맑고 더운 날",
                "recommend": ["냉면", "메밀", "회덮밥", "물회"],
                "memo": "입 안을 시원하게 해주는 음식으로 더위 해소."
            }
        elif temp <= 5:
            return {
                "condition": "맑고 추운 날",
                "recommend": ["탕", "정식", "국밥", "해장국", "찌개"],
                "memo": "추위 속에서도 집밥 같은 따뜻함을 원하게 되는 날."
            }
        else:
            return {
                "condition": "맑고 중간 날",
                "recommend": ["고기", "안창살", "삼겹살", "갈비", "회"],
                "memo": "완전 좋은 날씨!! 고기, 회 등 무거운 음식 추천!"
            }

    return {
        "condition": "API를 가져오는데 실패했어요 ㅠㅠ 잘모르겠습니다.",
        "recommend": [""],
        "memo": "날씨 API를 가져오는데 실패했습니다."
    }

if __name__ == "__main__":
    weather = weather_data()
    result = recommend_food_by_weather(weather)
    print(result)
