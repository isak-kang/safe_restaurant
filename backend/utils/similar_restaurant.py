from DataBase.DB import df_load



def rank_upso(row, base_main_edf, base_admdng, base_snt_uptae, base_cgg_code):
    if row["MAIN_EDF"] == base_main_edf:
        if row["ADMDNG_NM"] == base_admdng:
            return 1
        elif row["CGG_CODE"] == base_cgg_code:
            return 2
        else:
            return 5

    if row["SNT_UPTAE_NM"] == base_snt_uptae:
        if row["ADMDNG_NM"] == base_admdng:
            return 3
        elif row["CGG_CODE"] == base_cgg_code:
            return 4
        else:
            return 6

    return 7
