ogr2ogr -f GeoJSON ./webapp/public/data/umap.geojson \
  ./sample/df_all.tsv \
  -oo X_POSSIBLE_NAMES=ux -oo Y_POSSIBLE_NAMES=uy \
  -oo AUTODETECT_TYPE=YES \
  -oo KEEP_GEOM_COLUMNS=NO \
  -s_srs "EPSG:3857" -t_srs "EPSG:4326"



