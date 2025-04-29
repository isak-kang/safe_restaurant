from fastapi import FastAPI,Query,HTTPException, Path,Form,Depends
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from DataBase.DB import df_load,df_save,row_insert,delete_data
from fastapi.responses import JSONResponse
import pandas as pd
from utils.user import hash_password, verify_password,check_duplicate_id,create_access_token,verify_token

import jwt
from datetime import datetime, timedelta


app = FastAPI()

# CORS 설정 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 나중에 개인 IP로 수정
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/model_restaurant")
async def model_restaurant(gu: str = "", uptae: str = "", name: str = ""):
    # 음식점 정보 조회
    query = """
        SELECT 
            CGG_CODE,
            ASGN_YMD,
            ASGN_YY,
            upso_nm,
            SITE_ADDR_RD,
            SNT_UPTAE_NM,
            TRDP_AREA,
            ADMDNG_NM, MAIN_EDF
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
    # print(df["score"])
    # 필터 조건 적용
    if gu:
        df = df[df["addr"] == gu]
    if uptae:
        df = df[df["SNT_UPTAE_NM"] == uptae]
    if name:
        df = df[df["upso_nm"].str.contains(name, case=False, na=False)]
    
    # 응답 형식 정리   
    response = df[[
        "upso_nm",
        "SITE_ADDR_RD",
        "SNT_UPTAE_NM",
        "TRDP_AREA",
        "ADMDNG_NM",
        "ASGN_YMD",
        "img_url",
        "addr",
        "MAIN_EDF",
        "score"
    ]].fillna("").to_dict(orient="records")
    return JSONResponse(content=response)


@app.get("/api/filter_options")
async def filter_options():
    query = """
        SELECT 
            SITE_ADDR_RD,
            SNT_UPTAE_NM
        FROM model_restaurant_apply
        WHERE ASGN_YMD != '' AND ASGN_CANCEL_YMD = '';
    """
    df = df_load(query)
    df["addr"] = df["SITE_ADDR_RD"].apply(lambda x: x.split(" ")[1] if isinstance(x, str) and len(x.split(" ")) > 1 else "")
    gu_options = sorted(df["addr"].dropna().unique())
    uptae_options = sorted(df["SNT_UPTAE_NM"].dropna().unique())
    return {"guOptions": gu_options, "uptaeOptions": uptae_options}



@app.get("/api/model_restaurant/{upso_nm}")
async def get_restaurant_by_name(upso_nm: str = Path(..., title="업소명")):
    query = f"""
        SELECT 
            CGG_CODE,
            ASGN_YMD,
            ASGN_YY,
            upso_nm,
            SITE_ADDR_RD,
            SNT_UPTAE_NM,
            TRDP_AREA,
            ADMDNG_NM
        FROM model_restaurant_apply
        WHERE upso_nm = '{upso_nm}'
        AND ASGN_YMD != '' AND ASGN_CANCEL_YMD = ''
        LIMIT 1;
    """
    df = df_load(query)
    if df.empty:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return df.iloc[0].to_dict()


@app.get("/api/get_gocode")
async def get_gocode(address: str):
    SITE_ADDR_RD = address.split(",")[0].strip()
    query = f"SELECT * FROM tb_map WHERE SITE_ADDR_RD = '{SITE_ADDR_RD}'"
    df = df_load(query)
    if df.empty:
        raise HTTPException(status_code=404, detail="해당 주소에 대한 좌표 정보가 없습니다.")

    result = df.iloc[0].to_dict()
    return {
        "LAT": result.get("latitude"),
        "LNG": result.get("longitude")
    }


@app.get("/api/main_map")
async def model_restaurant(gu: str = ""):
    query1 = f"""SELECT 
            A.latitude, 
            A.longitude, 
            A.SITE_ADDR_RD, 
            B.upso_nm
        FROM 
            tb_map A 
        JOIN (
            SELECT DISTINCT 
                SUBSTRING_INDEX(SITE_ADDR_RD, ',', 1) AS clean_addr, 
                upso_nm
            FROM 
                model_restaurant_apply
            where ASGN_YMD != '' AND ASGN_CANCEL_YMD = ''
        ) B
        ON 
            A.SITE_ADDR_RD = B.clean_addr;"""
    map_df = df_load(query1)

    # 필터링된 주소에서 '구' 정보를 추출하여 addr_gu 컬럼으로 추가합니다.
    map_df["addr_gu"] = map_df["SITE_ADDR_RD"].apply(
        lambda x: x.split(" ")[1] if isinstance(x, str) and len(x.split(" ")) > 1 else ""
    )
    
    if gu:
        map_df = map_df[map_df["addr_gu"] == gu]


    return JSONResponse(content=map_df.to_dict(orient="records"))


@app.get("/api/restaurant_photo")
async def restaurant_photo(upso: str = ""):
    query = """SELECT DISTINCT A.upso_nm, A.img_urls, B.score, B.url, B.addr
            FROM (
                SELECT upso_nm, MAX(img_urls) AS img_urls
                FROM restaurant_images
                GROUP BY upso_nm
            ) A
            JOIN (
                SELECT upso_nm, MAX(url) AS url, MAX(addr) AS addr, MAX(score) AS score
                FROM kakao
                GROUP BY upso_nm
            ) B ON A.upso_nm = B.upso_nm;"""
    
    df = df_load(query)

    # 개선된 비교 방식 (유사 일치 허용)
    matched_df = df[df["upso_nm"].str.replace(" ", "").str.lower() == upso.replace(" ", "").lower()]
    
    if matched_df.empty:
        return JSONResponse(status_code=404, content={"message": "No matching restaurant found."})

    matched_df = matched_df.copy()
    matched_df["img_url_list"] = matched_df["img_urls"].apply(
        lambda x: [url.strip() for url in x.split(";") if url.strip()]
    )

    exploded_df = matched_df.explode("img_url_list").reset_index(drop=True)
    result = exploded_df[["score", "img_url_list"]].rename(columns={"img_url_list": "img_url"}).to_dict(orient="records")

    return {"data": result}



@app.get("/api/tb_restaurant_hygiene")
async def model_restaurant():

    query = """
            WITH ranked AS (
            SELECT CGG_CODE, ADM_DISPO_YMD, GNT_NO, SNT_COB_NM, SNT_UPTAE_NM, upso_nm, SITE_ADDR_RD, DRT_INSP_YMD, ADMM_STATE, DISPO_CTN, BAS_LAW, VIOR_YMD, VIOL_CN, DISPO_CTN_DT, TRDP_AREA,
                    ROW_NUMBER() OVER (PARTITION BY upso_nm ORDER BY ADM_DISPO_YMD DESC) AS rn
            FROM tb_restaurant_hygiene
            )
            SELECT CGG_CODE, ADM_DISPO_YMD, GNT_NO, SNT_COB_NM, SNT_UPTAE_NM, upso_nm, SITE_ADDR_RD, DRT_INSP_YMD, ADMM_STATE, DISPO_CTN, BAS_LAW, VIOR_YMD, VIOL_CN, DISPO_CTN_DT, TRDP_AREA
            FROM ranked
            WHERE rn = 1
            order by ADM_DISPO_YMD desc
            limit 3000
            ;
            """
    df = df_load(query)

    df = df.astype(object)

    return df.to_dict(orient="records")





@app.get("/api/tb_restaurant_hygiene/{upso_nm}")
async def model_restaurant(upso_nm: str = Path(..., title="업소명")):
    query = f"""
        SELECT *
        FROM restaurant_hygiene.tb_restaurant_hygiene
        WHERE upso_nm = '{upso_nm}'
    """
    df = df_load(query)
    
    if df.empty:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # DataFrame을 딕셔너리 리스트 형식으로 변환
    return df.to_dict(orient='records')



@app.post("/api/join")
async def join(
    id: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    address: str = Form(...),
):
    if password != confirm_password:
        return {"error": "Passwords do not match."}

    if check_duplicate_id(id) == 1:
        return {"error": "The ID already exists. Please use a different ID."}

    hashed_password = hash_password(password)
    
    query = """
            INSERT INTO user (id, password, name, email, address)
            VALUES (:id, :password, :name, :email, :address)
            """
    data = {
        "id": id,
        "password": hashed_password,
        "name": name,
        "email": email,
        "address": address
    }
    row_insert(query,data)

    return {"message": "회원가입이 완료되었습니다."}



# 로그인 API 수정
@app.post("/api/login")
async def login_api(
    id: str = Form(...),
    password: str = Form(...),
):

    query = "select * from user"
    login_info = df_load(query)
    matched_user = login_info[login_info["id"] == id]
    
    if matched_user.empty:
        return JSONResponse(
            {"error": "없는 아이디입니다."},
            status_code=400,
        )

    hashed_password = matched_user["password"].iloc[0]

    if not verify_password(password, hashed_password):
        return JSONResponse(
            status_code=400,
            content={"error": "비밀번호가 일치하지 않습니다."}
        )

    # 토큰 생성
    access_token_expires = timedelta(minutes=600)
    access_token = create_access_token(data={"sub": id}, expires_delta=access_token_expires)

    # 로그인 성공 시 토큰과 함께 사용자 ID 전달
    return {"message": "로그인 성공", "access_token": access_token, "token_type": "bearer"}


# 보호된 API 예시
@app.get("/api/protected")
async def protected_route(current_user: str = Depends(verify_token)):

    query = f"select id, name, address from user where id = '{current_user}'"
    df = df_load(query)
    user_data = df.iloc[0].to_dict()
    return {"user" : user_data}



@app.post("/api/favorites")
async def add_favorite(upso_nm: dict, id: str = Depends(verify_token)):
    df = pd.DataFrame({
        "upso_nm": [upso_nm["upso_nm"]],  # 리스트로 감싸야 1개의 행 생성
        "id"     : [id]
    })
    # print(df)
    df_save(df, "favorites")  # 테이블 이름 명확히!
    return {"message": "즐겨찾기 추가 완료"}

@app.delete("/api/favorites/{upso_nm}")
async def delete_favorite(upso_nm: str, id: str = Depends(verify_token)):
    query = f"DELETE FROM favorites WHERE id = '{id}' AND upso_nm = '{upso_nm}'"
    delete_data(query)
    return {"message": "즐겨찾기 삭제 완료"}





@app.get("/api/favorites_search")
async def get_favorites(
    current_user: str = Depends(verify_token)
):
    # current_user가 id라고 가정
    query = f'''SELECT A.id, A.upso_nm, B.SNT_UPTAE_NM ,B.MAIN_EDF ,B.SITE_ADDR_RD
                FROM favorites A join model_restaurant_apply B on A.upso_nm = B.upso_nm
                WHERE id  = "{current_user}"'''
    df = df_load(query)

    # 이미지 정보 조회
    query2 = "SELECT * FROM restaurant_hygiene.restaurant_images;"
    df_photo = df_load(query2)

    # 이미지 이름 정제 및 추출
    df_photo["img_url"] = df_photo["img_urls"].apply(lambda x: x.split(";")[0].strip())

    # 음식점 이름 정제 후 조인 기준 열 생성
    df["normalized_upso"] = df["upso_nm"].str.replace(" ", "").str.lower()
    df_photo["normalized_upso"] = df_photo["upso_nm"].str.replace(" ", "").str.lower()

    # 이미지 URL 병합
    df = df.merge(df_photo[["normalized_upso", "img_url"]], how="left", on="normalized_upso")

    # 주소 필터용 행정동 추출
    df["addr"] = df["SITE_ADDR_RD"].apply(lambda x: x.split(" ")[1] if isinstance(x, str) and len(x.split(" ")) > 1 else "")
    
    return JSONResponse(content=df.to_dict(orient="records"))






@app.get("/api/recommend_score")
async def model_restaurant_recommend_score():
    # 음식점 정보 조회
    query = """
        SELECT 
            ASGN_YMD,
            upso_nm,
            SITE_ADDR_RD,
            SNT_UPTAE_NM,
            MAIN_EDF
        FROM model_restaurant_apply
        WHERE ASGN_YMD != '' AND ASGN_CANCEL_YMD = ''
        ORDER BY ASGN_YMD DESC;
    """
    df = df_load(query)

    # 이미지 정보 조회
    query2 = "SELECT A.upso_nm, A.img_urls, B.score, A.addr FROM restaurant_hygiene.restaurant_images A join kakao B on A.id = B.id where (score >= 4.0);"
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

    
    df = df[df["score"].notna()]
    # 응답 형식 정리   
    response = df[[
        "upso_nm",
        "SITE_ADDR_RD",
        "SNT_UPTAE_NM",
        "ASGN_YMD",
        "img_url",
        "addr",
        "MAIN_EDF",
        "score"
    ]].fillna("").to_dict(orient="records")
    return JSONResponse(content=response)






@app.get("/api/analysis_gu")
async def analysis_gu():
    # 1) 모범음식점 집계
    query1 = """
    SELECT
      SUBSTRING_INDEX(SUBSTRING_INDEX(SITE_ADDR_RD, ' ', 2), ' ',-1) AS gu,
      COUNT(*) AS cnt
    FROM model_restaurant_apply
    WHERE SITE_ADDR_RD LIKE '%%구%%'
      AND ASGN_YMD != '' AND ASGN_CANCEL_YMD = ''
    GROUP BY gu;
    """
    df_model = df_load(query1)

    # 2) 행정처분 업소 집계
    query2 = """
    SELECT
      SUBSTRING_INDEX(SUBSTRING_INDEX(SITE_ADDR_RD, ' ', 2), ' ',-1) AS gu,
      COUNT(*) AS cnt
    FROM tb_restaurant_hygiene
    WHERE SITE_ADDR_RD LIKE '%%구%%'
    GROUP BY gu;
    """
    df_dispo = df_load(query2)

    return JSONResponse({
      "model_count": df_model.to_dict(orient="records"),
      "disposition_count": df_dispo.to_dict(orient="records"),
    })


@app.get("/api/analysis_viol_cn")
async def analysis_viol_cn():
    # 1) 모범음식점 집계
    query1 = """
            SELECT 
                CASE
                    WHEN (VIOL_CN LIKE '%%위생%%' OR VIOL_CN LIKE '%%혼입%%' OR VIOL_CN LIKE '%%소비기한%%' OR VIOL_CN LIKE '%%불결%%' OR VIOL_CN LIKE '%%이물%%' OR VIOL_CN LIKE '%%청소%%' OR VIOL_CN LIKE '%%불량%%' OR VIOL_CN LIKE '%%마스크%%' OR VIOL_CN LIKE '%%유통기한%%') 
                        AND VIOL_CN NOT LIKE '%%위생교육%%' THEN '위생 처분'
                    WHEN VIOL_CN LIKE '%%교육%%' THEN '교육미이수'
                    WHEN VIOL_CN LIKE '%%확장%%' OR VIOL_CN LIKE '%%면적%%' THEN '무허가 확장'
                    WHEN VIOL_CN LIKE '%%유흥%%' OR VIOL_CN LIKE '%%성매매%%' THEN '유흥/성매매'
                    WHEN VIOL_CN LIKE '%%건강%%' OR VIOL_CN LIKE '%%보험%%' THEN '건강, 보험 미등록'
                    WHEN VIOL_CN LIKE '%%외 영업%%' OR VIOL_CN LIKE '%%외부%%'  OR VIOL_CN LIKE '%%장소 외%%'  OR VIOL_CN LIKE '%%장소가 아닌곳%%' THEN '허가장소 외 외부영업'
                    WHEN VIOL_CN LIKE '%%청소년%%' THEN '청소년 주류판매'
                    WHEN VIOL_CN LIKE '%%폐업%%' OR VIOL_CN LIKE '%%철거%%' OR VIOL_CN LIKE '%%폐업 신고안함%%' THEN '폐업신고 안함'
                    WHEN VIOL_CN LIKE '%%폐기물%%' THEN '폐기물'
                    WHEN VIOL_CN LIKE '%%원산지%%' THEN '원산지 미표시'
                    WHEN VIOL_CN LIKE '%%말소%%' or VIOL_CN like '%%사업자등록%%' THEN '사업자등록말소'
                    WHEN VIOL_CN LIKE '%%노래%%' or VIOL_CN like '%%춤%%' or VIOL_CN like '%%음향%%' or VIOL_CN like '%%반주%%' THEN '노래, 춤 추도록함, 음향기기 설치'
                    WHEN VIOL_CN like '%%미설치%%' THEN '필수 제품 미설치'
                    ELSE '기타'
                END AS violation_category,
                COUNT(*) AS count
            FROM restaurant_hygiene.tb_restaurant_hygiene
            GROUP BY violation_category
            ORDER BY count DESC;
    """
    df = df_load(query1)

    return df.to_dict(orient="records")


