from fastapi import FastAPI,Query
from fastapi.middleware.cors import CORSMiddleware
from DataBase.DB import df_load


app = FastAPI()

# CORS 설정 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 나중에 개인 IP로 수정
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/ping")
async def ping():
    print("완")
    return {"message": "pong"}

@app.get("/api/model_restaurant")
async def model_restaurant():
    
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
        order by ASGN_YMD desc;
    """


    df = df_load(query)
    df["addr"] = df["SITE_ADDR_RD"].apply(lambda x: x.split(" ")[1] if isinstance(x, str) and len(x.split(" ")) > 1 else "")
    
    return df.to_dict(orient="records")

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
