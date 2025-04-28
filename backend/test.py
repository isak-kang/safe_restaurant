

from DataBase.DB import df_load
import requests
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
    df["addr"] = df["SITE_ADDR_RD"].apply(lambda x: x.split(" ")[1] if isinstance(x, str) and len(x.split(" ")) > 1 else "")
    gu_options = sorted(df["addr"].dropna().unique())
    uptae_options = sorted(df["SNT_UPTAE_NM"].dropna().unique())
    print(gu_options)

test()