from passlib.context import CryptContext
import sys
import os
import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt import PyJWTError


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from DataBase.DB import df_load





### 비밀번호 암호화
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 해쉬 암호화
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# 암호화 검증
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)





# id 중복 검증
def check_duplicate_id(id):
    query = f"""
            select id
            from user
            where id = '{id}'
            """
    df = df_load(query)
    
    if not df.empty:
        return 1
    return 0
# print(check_duplicate_id("id"))
    






# 비밀 키와 만료 시간 설정
SECRET_KEY = "your_secret_key"  # 실제 비밀 키는 환경 변수로 관리하는 것이 좋습니다.
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 토큰 만료 시간 (분 단위)

# JWT 토큰 생성 함수
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt




oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# JWT 토큰 검증 함수
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=403, detail="Could not validate credentials")
        return username
    except PyJWTError:
        raise HTTPException(status_code=403, detail="Could not validate credentials")