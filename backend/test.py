
import requests

from DataBase.DB import df_load

def test():
    # 음식점 정보 조회
    query = """
        SELECT 
            SITE_ADDR_RD,
            SNT_UPTAE_NM
        FROM model_restaurant_apply
        WHERE ASGN_YMD != '' AND ASGN_CANCEL_YMD = '';

            """

    df = df_load(query)


test()