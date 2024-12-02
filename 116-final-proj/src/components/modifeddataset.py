import pandas as pd
import json

with open('usa_zip_codes_geo_26mn.json', 'r') as file:
    data = json.load(file)

df = pd.json_normalize(data)
grouped_df = df.groupby()[].mean()
df.to_json('', orient='records', lines=True)