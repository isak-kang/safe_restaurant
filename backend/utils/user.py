from passlib.context import CryptContext
import sys
import os

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
print(check_duplicate_id("id"))
    