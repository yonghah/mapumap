ogr2ogr -f GeoJSON ../sample/location.geojson \
  ../sample/df_merged.tsv \
  -oo X_POSSIBLE_NAMES=X -oo Y_POSSIBLE_NAMES=Y \
  -oo AUTODETECT_TYPE=YES \
  -oo KEEP_GEOM_COLUMNS=NO \
  -s_srs "EPSG:5178" -t_srs "EPSG:4326"



