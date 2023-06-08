# mapumap

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

It will createe location.geojson and umap.geojson under webapp/public/data.
Then go to webapp directory 


```
$ npm install
$ npm run
```
