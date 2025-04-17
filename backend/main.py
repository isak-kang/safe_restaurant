from fastapi import FastAPI,Query,HTTPException, Path
from typing import List

from fastapi.middleware.cors import CORSMiddleware
from DataBase.DB import df_load
from fastapi.responses import JSONResponse


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
    query = """
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
        WHERE ASGN_YMD != '' AND ASGN_CANCEL_YMD = ''
        ORDER BY ASGN_YMD DESC;
    """
    df = df_load(query)
    df["addr"] = df["SITE_ADDR_RD"].apply(lambda x: x.split(" ")[1] if isinstance(x, str) and len(x.split(" ")) > 1 else "")

    if gu:
        df = df[df["addr"] == gu]
    if uptae:
        df = df[df["SNT_UPTAE_NM"] == uptae]
    if name:
        df = df[df["UPSO_NM"].str.contains(name, case=False, na=False)]

    return JSONResponse(content=df.to_dict(orient="records"))


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
        print(filtered_df)
    return JSONResponse(content=filtered_df.to_dict(orient="records"))





















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
    ) ;
            """
    df = df_load(query)
    
    return df
