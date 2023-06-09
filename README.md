# mapumap

mapumap display geographic map and umap plot side-by-side with NMF factors.

demo: https://yonghah.github.io/mapumap

NMF는 [지역 X 연령성별 그룹] 행렬을 [지역 X 토픽] X [토픽 X 연령성별그룹] 으로 분해합니다. [토픽 X 연령성별그룹]  (의 전치행렬)이 화면 가운데에 표시되어있고요. [지역 X 토픽]이 화면 좌우에 표시되어있습니다. 

지역이 
- 실제의 물리적 공간의 인접성에 따라 표시된 것이 좌측 지도이고, 
- 지역이 변수 공간 (여기서는 연령성별 그룹)의 인접성에 따라 표시된 것이 우측 지도 (UMAP)
입니다.

 * 지도 위의 점을 클릭하면 각 지역의 토픽 구성을 나타내는 팝업이 등장합니다.
 * 지도 위의 점을 더블클릭하면 반대편 지도에서 해당 지역을 찾아 줍니다.
 * 가운데 차트의 X축 위에 표시된 토픽 번호를 클릭하면 해당 토픽의 확률을 지도에 표시합니다.
 * 토픽 번호를 한번더 클릭하면 top topic을 표시합니다.

## Setup 
After installation, go to project root

```
$ python mapumap/cluster.py
```
This will generate df_all.tsv under sample foler .
Then run the two scripts create geojson for the two maps.

```
$ ./create_location_geojson.sh
$ ./create_umap_geojson.sh
```

It will create location.geojson and umap.geojson under webapp/public/data (already included in the repository).
Then go to webapp directory 


```
$ npm install
$ npm start 
```
