from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from bs4 import BeautifulSoup
import time
import pandas as pd
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support import expected_conditions as EC
import sys
import os
from DB import df_load

# Selenium 설정
chrome_options = Options()
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36")
chrome_options.add_argument("--log-level=3")

def crawling_img_url():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    wait = WebDriverWait(driver, 10)
    no_photos = 0

    # 예시 쿼리 결과 (실제 DB 쿼리 대체)
    df = df_load("""
        SELECT UPSO_NM, SITE_ADDR_RD
        FROM model_restaurant_apply
        WHERE ASGN_YMD != '' AND ASGN_CANCEL_YMD = ''
        ORDER BY ASGN_YMD DESC;
    """)
    df['SITE_ADDR_RD'] = df['SITE_ADDR_RD'].str.split(',').str[0]
    df["img_search_addr"] = df["SITE_ADDR_RD"].fillna('') + "," + df["UPSO_NM"].fillna('')

    result = []

    for idx, row in df.iterrows():
        search_addr = row["img_search_addr"]
        url = "https://map.kakao.com/"
        driver.get(url)

        # 검색어 입력
        search_area = driver.find_element(By.XPATH, r'//*[@id="search.keyword.query"]')
        search_area.send_keys(search_addr)
        driver.find_element(By.XPATH, r'//*[@id="search.keyword.submit"]').send_keys(Keys.ENTER)

        time.sleep(1)

        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        first_place = soup.select_one('.placelist > .PlaceItem')

        if first_place:
            score_tag = first_place.select_one('.rating > .score > em')
            link_tag = first_place.select_one('a.numberofscore')

            score = score_tag.text if score_tag else 'N/A'
            url = link_tag.get('href') if link_tag else '링크 없음'
            url = url.split("#")[0]

            # '상세보기' 링크로 이동
            if url != '링크 없음':
                driver.get(url)  # 상세 페이지로 이동

                time.sleep(2)  # 페이지 로딩 기다림

                # 상세 페이지에서 이미지 URL 추출
                detail_html = driver.page_source
                detail_soup = BeautifulSoup(detail_html, 'html.parser')

                # 모든 이미지 태그 찾기
                img_tags = detail_soup.find_all('img', class_='img-thumb')  # 해당 클래스 이름을 사용
                img_urls = []

                for img in img_tags:
                    img_url = img.get('src')  # src 속성에서 이미지 URL 가져오기
                    if img_url:
                        # 절대 경로로 변환
                        img_url = "https:" + img_url if img_url.startswith("//") else img_url
                        img_urls.append(img_url)

                print(f"이미지 URL: {img_urls}")
            else:
                print("상세보기 링크가 없습니다.")
        else:
            print("장소 정보가 없습니다.")

# 실행
crawling_img_url()
