# from selenium import webdriver
# from selenium.webdriver.chrome.service import Service
# from webdriver_manager.chrome import ChromeDriverManager
# from selenium.webdriver.chrome.options import Options
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# from bs4 import BeautifulSoup
# import time
# import pandas as pd
# from webdriver_manager.chrome import ChromeDriverManager
# from selenium.webdriver.support import expected_conditions as EC


# import sys
# import os
# from DB import df_load


# # Selenium 설정
# chrome_options = Options()
# # chrome_options.add_argument("--headless")
# chrome_options.add_argument("--no-sandbox")
# chrome_options.add_argument("--disable-dev-shm-usage")
# chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36")
# chrome_options.add_argument("--log-level=3")


# def crawling_img_url():
#     driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
#     wait = WebDriverWait(driver, 10)
#     no_photos = 0

#     # 예시 쿼리 결과 (실제 DB 쿼리 대체)
#     df = df_load("""
#         SELECT UPSO_NM, SITE_ADDR_RD
#         FROM model_restaurant_apply
#         WHERE ASGN_YMD != '' AND ASGN_CANCEL_YMD = ''
#         ORDER BY ASGN_YMD DESC;
#     """)
#     df['SITE_ADDR_RD'] = df['SITE_ADDR_RD'].str.split(',').str[0]
#     df["img_search_addr"] = df["SITE_ADDR_RD"].fillna('') + "," + df["UPSO_NM"].fillna('')

#     result = []

#     for idx, row in df.iterrows():
#         search_addr = row["img_search_addr"]
#         url = f"https://map.naver.com/p/search/{search_addr}"
#         driver.get(url)

#         try:
#             # iframe 진입
#             iframe = wait.until(EC.presence_of_element_located((By.ID, "entryIframe")))
#             driver.switch_to.frame(iframe)

#             # app-root 내부 접근
#             app_root = wait.until(EC.presence_of_element_located((By.TAG_NAME, "app-root")))
#             inner_html = app_root.get_attribute("innerHTML")

#             soup = BeautifulSoup(inner_html, "html.parser")
#             first_cex4u = soup.select_one("div.CEX4u")
            
#             if first_cex4u:
#                 img_tags = first_cex4u.select("img")
#                 img_srcs = [img['src'] for img in img_tags if img.has_attr('src')]

#                 print(f"[{search_addr}] 가게 사진 개수: {len(img_srcs)}")
#                 for img_url in img_srcs:
#                     print("▶ 가게 사진 URL:", img_url)

#                 result.append({
#                     "search_addr": search_addr,
#                     "images": img_srcs
#                 })
#             else:
#                 raise Exception(".CEX4u not found")

#         except Exception as e:
#             no_photos += 1
#             print(f"[{search_addr}] ❌ 가게 사진 크롤링 실패:", e)

#         finally:
#             # iframe 탈출
#             driver.switch_to.default_content()

#     print(f"\n📌 총 실패 건수: {no_photos}개")
#     driver.quit()
#     return result


# print(crawling_img_url())
