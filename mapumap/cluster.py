import gzip
from pathlib import Path
import pandas as pd 
import numpy as np
import umap
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import NMF
from sklearn.preprocessing import StandardScaler

def main():
    run() 


def run():
    data_root = Path('./sample')
    df_pop = read_data_population(data_root)
    df_loc = read_data_location(data_root)
    df_emb = run_umap(df_pop)
    df_w, df_h = run_nmf(df_pop, num_topic=12) 

    df_merged = df_emb.merge(df_loc, on='ADMCD', how='left')
    df_merged['id'] = df_merged.index
    df_merged['ux'] = df_merged['ux'] * 1000  # scale up for convenience
    df_merged['uy'] = df_merged['uy'] * 1000  # scale up for convenience
    df_merged = pd.concat([df_merged, df_w], axis=1)

    df_merged.to_csv("sample/df_all.tsv", sep='\t', index=False )
    df_h.to_json('webapp/public/data/h.json', orient = 'records')

    return df_merged 


def run_umap(df_pop):
    data = long_to_wide(df_pop)
    data_for_emb = data.drop('ADMCD', axis=1)
    reducer = umap.UMAP(min_dist=0.01, n_neighbors=5, random_state=15)
    scaled_data = StandardScaler().fit_transform(data)
    embedding = reducer.fit_transform(scaled_data)
    df_emb = pd.DataFrame(embedding, columns=['ux', 'uy'])
    df_concat = pd.concat([data,  df_emb], axis=1)
    return df_concat

def run_nmf(df_pop, num_topic = 12):
    data_raw = long_to_wide(df_pop).drop(columns=['ADMCD'])

    row_sums = np.sum(data_raw.to_numpy(), axis=1)  
    row_sums = row_sums.reshape(-1, 1)  
    data = (data_raw / row_sums).fillna(0)
    nmf = NMF(
        n_components=num_topic,
        random_state=1,
        max_iter=3000,
        init="nndsvda",
        beta_loss="frobenius",
        alpha_W=0.000005,
        alpha_H=0.000005,
        l1_ratio=0.01,
    ).fit(data)
    W = nmf.fit_transform(data)
    H = nmf.components_
    most_salient_factors = np.argmax(W, axis=1)
    df_w = pd.DataFrame(
        W, columns = [f"topic_{n}" for n in range(0, num_topic)])
    df_w['topK'] = most_salient_factors

    df_h = df_factor = pd.DataFrame(np.transpose(H), columns = [f"topic_{n}" for n in range(0, num_topic)])
    df_h['pop_group'] = data.columns
    df_h = df_h.set_index(['pop_group']).reset_index()
    df_json = pd.wide_to_long(
        df_h, stubnames='topic_',  
        i=['pop_group'], 
        j='topic'
    ).rename(columns={'topic_':'value'}).reset_index()
    df_json[['_', 'age', 'sex']] = df_json['pop_group'].str.split('_', expand=True)
    df_json = df_json.drop(columns=['_'])
    df_json['age'] = df_json['age'].astype(int)

    return df_w, df_json



def read_data_location(data_root):
    # data_root = Path('./sample') 
    csv_path = data_root / 'location.tsv.gz' 

    with gzip.open(csv_path, "rt") as f:
        df = pd.read_csv( f, sep='\t' )
    return df


def read_data_population(data_root):
    # data_root = Path('./sample') 
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
        age = f"{idx[1]:0>3}"
        name = f"{idx[0]}_{age}_{idx[2]}"
        col_names.append(name)
    data.columns = col_names
    data = data.rename(columns={"ADMCD_000_": "ADMCD"})
    return data


if __name__=='__main__':
    main()
