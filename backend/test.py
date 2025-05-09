from DataBase.DB import df_load



# 3. 유사도 점수 계산 함수
def rank_upso(row):
    if row["MAIN_EDF"] == base_main_edf:
        if row["ADMDNG_NM"] == base_admdng :
            return 1
        elif row["CGG_CODE"] == base_cgg_code:
            return 2
        else: 
            return 5
    
    if row["SNT_UPTAE_NM"] == base_snt_uptae :
        if row["ADMDNG_NM"] == base_admdng:
            return 3
        elif  row["CGG_CODE"] == base_cgg_code:
            return 4
        else: 
            return 6 
    
    else:
        return 99



















query = """
    SELECT 
        *
    FROM model_restaurant_apply
    WHERE ASGN_YMD != '' AND ASGN_CANCEL_YMD = ''
    ORDER BY ASGN_YMD DESC;
"""
df = df_load(query)

# 이미지 정보 조회
query2 = "SELECT A.upso_nm, A.img_urls, B.score, A.addr FROM restaurant_hygiene.restaurant_images A join kakao B on A.id = B.id;"
df_photo = df_load(query2)
# print(df_photo)
# 이미지 이름 정제 및 추출
df_photo["img_url"] = df_photo["img_urls"].apply(lambda x: x.split(";")[0].strip())

# 음식점 이름 정제 후 조인 기준 열 생성
df["normalized_upso"] = df["upso_nm"].str.replace(" ", "").str.lower()
df_photo["normalized_upso"] = df_photo["upso_nm"].str.replace(" ", "").str.lower()

df_photo['SITE_ADDR_RD'] = df_photo['addr']
df['SITE_ADDR_RD'] = df['SITE_ADDR_RD'].apply(lambda x: x.split(",")[0])
# 이미지 URL 병합
df = df.merge(
df_photo[["normalized_upso", "SITE_ADDR_RD", "img_url", "score"]],
how="left",
on=["normalized_upso", "SITE_ADDR_RD"]
)

# 주소 필터용 행정동 추출
df["addr"] = df["SITE_ADDR_RD"].apply(lambda x: x.split(" ")[1] if isinstance(x, str) and len(x.split(" ")) > 1 else "")


# 1. 데이터 불러오기
target_name = "맛나곱창"

# 2. 기준 업소 정보 추출
base = df[df["upso_nm"] == target_name].iloc[0]

base_admdng = base["ADMDNG_NM"]
base_main_edf = base["MAIN_EDF"]
base_snt_uptae = base["SNT_UPTAE_NM"]
base_cgg_code = base["CGG_CODE"]


# 4. 유사도 점수 부여
related = df[df["upso_nm"] != target_name].copy()
related["rank_score"] = related.apply(rank_upso, axis=1)

# 5. 관련 업소 정렬 및 상위 10개 추출
related_sorted = related[related["rank_score"] < 99].sort_values(["rank_score", "ASGN_YMD"], ascending=[True, False])
top_related = related_sorted.head(10)

print(top_related)
