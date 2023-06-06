from mapumap.cluster import *

import pandas as pd 

def test_readdata():
    df_pop = read_data_population()
    df_loc = read_data_location()
    print(df_loc)
    assert df_pop.shape[0] == 150528

def test_cluster():
    df = read_data()
    long = long_to_wide(df) 
    assert long.shape[0] == 3584
