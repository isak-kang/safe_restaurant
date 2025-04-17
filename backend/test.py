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
from tqdm import tqdm

# Selenium 설정
chrome_options = Options()
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36")
chrome_options.add_argument("--log-level=3")

# ... 기존 import 및 설정 생략 ...

def crawling_img_url():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    wait = WebDriverWait(driver, 10)

    df = df_load("""
        SELECT UPSO_NM, SITE_ADDR_RD
        FROM model_restaurant_apply
        WHERE ASGN_YMD != '' AND ASGN_CANCEL_YMD = ''
        ORDER BY ASGN_YMD DESC;
    """)
    df['SITE_ADDR_RD'] = df['SITE_ADDR_RD'].str.split(',').str[0]
    df["img_search_addr"] = df["SITE_ADDR_RD"].fillna('') + "," + df["UPSO_NM"].fillna('')

    result = []
    a= 0
    for idx, row in tqdm(df.iterrows(), total=len(df)):
        a+=1
        search_addr = row["img_search_addr"]
        url = "https://map.kakao.com/"
        driver.get(url)

        try:
            search_area = driver.find_element(By.XPATH, r'//*[@id="search.keyword.query"]')
            search_area.clear()
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
                detail_url = link_tag.get('href') if link_tag else '링크 없음'
                detail_url = detail_url.split("#")[0] if detail_url != '링크 없음' else detail_url

                img_urls = []

                if detail_url != '링크 없음':
                    driver.get(detail_url)
                    time.sleep(1)

                    detail_html = driver.page_source
                    detail_soup = BeautifulSoup(detail_html, 'html.parser')

                    img_tags = detail_soup.find_all('img', class_='img-thumb')

                    for img in img_tags:
                        img_url = img.get('src')
                        if img_url:
                            img_url = "https:" + img_url if img_url.startswith("//") else img_url
                            img_urls.append(img_url)

                result.append({
                    "img_search_addr": search_addr,
                    "score": score,
                    "img_urls": "; ".join(img_urls) if img_urls else '없음'
                })
                print({
                    "img_search_addr": search_addr,
                    "score": score,
                    "img_urls": "; ".join(img_urls) if img_urls else '없음'
                })
            else:
                result.append({
                    "img_search_addr": search_addr,
                    "score": "장소 없음",
                    "img_urls": "없음"
                })
                print({
                    "img_search_addr": search_addr,
                    "score": "장소 없음",
                    "img_urls": "없음"
                })

        except Exception as e:
            print(f"[ERROR] {search_addr} 처리 중 오류 발생: {e}")
            result.append({
                "img_search_addr": search_addr,
                "score": "오류",
                "img_urls": "없음"
            })

    driver.quit()

    # 결과 저장
    result_df = pd.DataFrame(result)
    result_df.to_csv("crawled_kakao_img_urls.csv", index=False, encoding='utf-8-sig')
    print("✅ CSV 저장 완료: crawled_kakao_img_urls.csv")





 

def crawling_img_url_save():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    wait = WebDriverWait(driver, 10)

    df = df_load("""
        SELECT UPSO_NM, SITE_ADDR_RD
        FROM model_restaurant_apply
        WHERE ASGN_YMD != '' AND ASGN_CANCEL_YMD = ''
        ORDER BY ASGN_YMD DESC;
    """)
    df['SITE_ADDR_RD'] = df['SITE_ADDR_RD'].str.split(',').str[0]
    df["img_search_addr"] = df["SITE_ADDR_RD"].fillna('') + "," + df["UPSO_NM"].fillna('')

    result = []
    a= 0
    for idx, row in tqdm(df.iterrows(), total=len(df)):
        a+=1
        search_addr = row["img_search_addr"]
        url = "https://map.kakao.com/"
        driver.get(url)

        try:
            search_area = driver.find_element(By.XPATH, r'//*[@id="search.keyword.query"]')
            search_area.clear()
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
                detail_url = link_tag.get('href') if link_tag else '링크 없음'
                detail_url = detail_url.split("#")[0] if detail_url != '링크 없음' else detail_url


                result.append({
                    "img_search_addr": search_addr,
                    "score": score,
                    "img_url": detail_url
                })
                print({
                    "img_search_addr": search_addr,
                    "score": score,
                    "img_url": detail_url
                })
            else:
                result.append({
                    "img_search_addr": search_addr,
                    "score": "장소 없음",
                    "img_url": "없음"
                })
                print({
                    "img_search_addr": search_addr,
                    "score": "장소 없음",
                    "img_url": "없음"
                })

        except Exception as e:
            print(f"[ERROR] {search_addr} 처리 중 오류 발생: {e}")
            result.append({
                "img_search_addr": search_addr,
                "score": "오류",
                "img_urls": "없음"
            })

    driver.quit()

    # 결과 저장
    result_df = pd.DataFrame(result)
    result_df.to_csv("crawled_kakao_img_url.csv", index=False, encoding='utf-8-sig')
    print("✅ CSV 저장 완료: crawled_kakao_img_url.csv")













# 실행

if __name__ == "__main__":

    # crawling_img_url()
    crawling_img_url_save()
    pass
