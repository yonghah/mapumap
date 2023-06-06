import gzip
from pathlib import Path
import pandas as pd 
import numpy as np
import umap
from sklearn.preprocessing import StandardScaler


def main():
    run_umap() 


def run_umap():
    df_pop = read_data_population()
    df_loc = read_data_location()
    data = long_to_wide(df_pop)
    reducer = umap.UMAP()
    scaled_data = StandardScaler().fit_transform(data)
    embedding = reducer.fit_transform(scaled_data)
    df_emb = pd.DataFrame(embedding, columns=['ux', 'uy'])
    df_concat = pd.concat([data,  df_emb], axis=1)
    df_merged = df_concat.merge(df_loc, on='ADMCD', how='left')
    df_merged['id'] = df_merged.index
    df_merged['ux'] = df_merged['ux'] * 1000  # scale up for convenience
    df_merged['uy'] = df_merged['uy'] * 1000  # scale up for convenience
    df_merged.to_csv("sample/df_merged.tsv", sep='\t', index=False )
    return df_merged 


def read_data_location():
    data_root = Path('./sample') 
    csv_path = data_root / 'location.tsv.gz' 

    with gzip.open(csv_path, "rt") as f:
        df = pd.read_csv( f, sep='\t' )
    return df


def read_data_population():
    data_root = Path('./sample') 
    csv_path = data_root / 'population.csv.gz' 

    with gzip.open(csv_path, "rt") as f:
        df = pd.read_csv(
            f, sep=',', 
            skiprows=1,
            names= [
                'ADMCD', 'ADMNM', 
                'AGE_GROUP', 'AGE_GROUP_DESCR',
                'SEX', 'SEX_DESCR', 
                'UNIT', 'POP', 'DUMMY'
            ])
        df['SEX'] = np.where(df['SEX']=="T3[14STD04553]", 'M', 'F') 
        df.drop(columns=['DUMMY'], inplace=True)
    return df


def long_to_wide(df):
    data = pd.pivot(
        df, index='ADMCD', 
        columns=["AGE_GROUP", "SEX"], 
        values=['POP']).reset_index() 
    col_names = []
    for idx in data.columns.to_flat_index():
        name = f"{idx[0]}{idx[1]}{idx[2]}"
        col_names.append(name)
    data.columns = col_names
    return data

if __name__=='__main__':
    main()
