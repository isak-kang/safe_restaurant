from fastapi import FastAPI,Query,HTTPException, Path,Form
from typing import List

from fastapi.middleware.cors import CORSMiddleware
from DataBase.DB import df_load,df_save,row_insert
from fastapi.responses import JSONResponse

from utils.user import hash_password, verify_password


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
            UPSO_NM,
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
    query2 = "SELECT * FROM restaurant_hygiene.restaurant_images;"
    df_photo = df_load(query2)

    # 이미지 이름 정제 및 추출
    df_photo["img_url"] = df_photo["img_urls"].apply(lambda x: x.split(";")[0].strip())

    # 음식점 이름 정제 후 조인 기준 열 생성
    df["normalized_upso"] = df["UPSO_NM"].str.replace(" ", "").str.lower()
    df_photo["normalized_upso"] = df_photo["upso_name"].str.replace(" ", "").str.lower()

    # 이미지 URL 병합
    df = df.merge(df_photo[["normalized_upso", "img_url"]], how="left", on="normalized_upso")

    # 주소 필터용 행정동 추출
    df["addr"] = df["SITE_ADDR_RD"].apply(lambda x: x.split(" ")[1] if isinstance(x, str) and len(x.split(" ")) > 1 else "")

    # 필터 조건 적용
    if gu:
        df = df[df["addr"] == gu]
    if uptae:
        df = df[df["SNT_UPTAE_NM"] == uptae]
    if name:
        df = df[df["UPSO_NM"].str.contains(name, case=False, na=False)]

    # 응답 형식 정리
    response = df[[
        "UPSO_NM",
        "SITE_ADDR_RD",
        "SNT_UPTAE_NM",
        "TRDP_AREA",
        "ADMDNG_NM",
        "ASGN_YMD",
        "img_url",
        "addr",
        "MAIN_EDF"
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
            UPSO_NM,
            SITE_ADDR_RD,
            SNT_UPTAE_NM,
            TRDP_AREA,
            ADMDNG_NM
        FROM model_restaurant_apply
        WHERE UPSO_NM = '{upso_nm}'
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
    print(SITE_ADDR_RD)
    query = f"SELECT * FROM tb_map WHERE SITE_ADDR_RD = '{SITE_ADDR_RD}'"
    df = df_load(query)
    if df.empty:
        raise HTTPException(status_code=404, detail="해당 주소에 대한 좌표 정보가 없습니다.")

    result = df.iloc[0].to_dict()
    print(result)
    return {
        "LAT": result.get("latitude"),
        "LNG": result.get("longitude")
    }


@app.get("/api/main_map")
async def model_restaurant(gu: str = ""):
    query1 = f"SELECT * FROM tb_map"
    query2 = f"SELECT SITE_ADDR_RD FROM restaurant_hygiene.model_restaurant_apply;"
    map_df = df_load(query1)
    model_addr_df = df_load(query2)

    model_addr_df["addr"] = model_addr_df["SITE_ADDR_RD"].apply(lambda x: x.split(",")[0])

    # model_addr_df에서 'addr' 값에 해당하는 주소만 필터링한 후 복사본으로 만듭니다.
    filtered_df = map_df[map_df['SITE_ADDR_RD'].isin(model_addr_df['addr'])].copy()

    # 필터링된 주소에서 '구' 정보를 추출하여 addr_gu 컬럼으로 추가합니다.
    filtered_df["addr_gu"] = filtered_df["SITE_ADDR_RD"].apply(
        lambda x: x.split(" ")[1] if isinstance(x, str) and len(x.split(" ")) > 1 else ""
    )
  

    if gu:
        filtered_df = filtered_df[filtered_df["addr_gu"] == gu]
    return JSONResponse(content=filtered_df.to_dict(orient="records"))


@app.get("/api/restaurant_photo")
async def restaurant_photo(upso: str = ""):
    query = """SELECT DISTINCT A.upso_name, A.img_urls, B.score, B.url, B.addr
            FROM (
                SELECT upso_name, MAX(img_urls) AS img_urls
                FROM restaurant_images
                GROUP BY upso_name
            ) A
            JOIN (
                SELECT upso_name, MAX(url) AS url, MAX(addr) AS addr, MAX(score) AS score
                FROM kakao
                GROUP BY upso_name
            ) B ON A.upso_name = B.upso_name;"""
    
    df = df_load(query)

    # 개선된 비교 방식 (유사 일치 허용)
    matched_df = df[df["upso_name"].str.replace(" ", "").str.lower() == upso.replace(" ", "").lower()]
    
    if matched_df.empty:
        return JSONResponse(status_code=404, content={"message": "No matching restaurant found."})

    matched_df["img_url_list"] = matched_df["img_urls"].apply(
        lambda x: [url.strip() for url in x.split(";") if url.strip()]
    )

    exploded_df = matched_df.explode("img_url_list").reset_index(drop=True)
    result = exploded_df[["score", "img_url_list"]].rename(columns={"img_url_list": "img_url"}).to_dict(orient="records")

    return {"data": result}




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

    if check_duplicate_id(id):
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










@app.get("/api/tb_restaurant_hygiene")
async def model_restaurant():
     
    query = """
            SELECT *
            FROM restaurant_hygiene.tb_restaurant_hygiene
            WHERE SNT_UPTAE_NM IN (
                '한식',
                '김밥(도시락)',
                '탕류(보신용)',
                '경양식',
                '호프/통닭',
                '분식',
                '단란주점',
                '일식',
                '기타 휴게음식점',
                '간이주점',
                '커피숍',
                '일반조리판매',
                '중국식',
                '식육(숯불구이)',
                '식품소분업',
                '외국음식전문점(인도,태국등)',
                '제과점영업',
                '정종/대포집/소주방',
                '감성주점',
                '패밀리레스트랑',
                '라이브카페',
                '편의점',
                '키즈카페',
                '냉면집',
                '떡카페',
                '뷔페식',
                '공동탕업',
                '통닭(치킨)',
                '까페',
                '백화점',
                '패스트푸드',
                '아이스크림',
                '스텐드바',
                '비어(바)살롱',
                '전통찻집',
                '과자점',
                '도시락제조업',
                '푸드트럭',
                '복어취급',
                '숙박업(생활)',
                '집단급식소',
                '기타 집단급식소',
                '식품냉동.냉장업'
                
            )
            limit 1000 ;  
            """
    df = df_load(query)

    df = df.astype(object)

    return df.to_dict(orient="records")


