from flask import Flask, render_template, jsonify, request
import pandas as pd

app = Flask(__name__)

# ============================
# LOAD DATASET
# ============================

FILE_PATH = "data/tourism_with_id.csv"

df = pd.read_csv(FILE_PATH)

# hanya data Kota Bandung
df = df[df["City"].str.contains("Bandung", case=False, na=False)]

# hapus data kosong
df = df.fillna("")

df["Price"] = pd.to_numeric(df["Price"], errors="coerce").fillna(0)
df["Rating"] = pd.to_numeric(df["Rating"], errors="coerce").fillna(0)
df["Time_Minutes"] = pd.to_numeric(df["Time_Minutes"], errors="coerce").fillna(0)
df["Lat"] = pd.to_numeric(df["Lat"], errors="coerce")
df["Long"] = pd.to_numeric(df["Long"], errors="coerce")

# Hapus data yang tidak punya koordinat
df = df.dropna(subset=["Lat", "Long"])

# reset index
df.reset_index(drop=True, inplace=True)


# ============================
# HOME
# ============================

@app.route("/")
def home():

    categories = sorted(df["Category"].unique())

    return render_template(
        "index.html",
        categories=categories
    )


# ============================
# API SEMUA WISATA
# ============================

@app.route("/api/wisata")
def wisata():

    keyword = request.args.get("search", "").lower()

    category = request.args.get("category", "")

    filtered = df.copy()

    # SEARCH
    if keyword != "":

        filtered = filtered[
            filtered["Place_Name"]
            .str.lower()
            .str.contains(keyword)
        ]

    # FILTER KATEGORI
    if category != "" and category != "Semua":

        filtered = filtered[
            filtered["Category"] == category
        ]

    result = []

    for _, row in filtered.iterrows():

        result.append({

            "id": int(row["Place_Id"]),

            "name": row["Place_Name"],

            "description": row["Description"],

            "category": row["Category"],

            "city": row["City"],

            "price": int(row["Price"]),

            "rating": float(row["Rating"]),

            "time": int(row["Time_Minutes"]),

            "lat": float(row["Lat"]),

            "lng": float(row["Long"])

        })

    return jsonify(result)


# ============================
# API KATEGORI
# ============================

@app.route("/api/category")
def category():

    category = sorted(df["Category"].unique())

    return jsonify(category)


# ============================
# API STATISTIK
# ============================

@app.route("/api/statistik")
def statistik():

    data = {

        "total": len(df),

        "kategori": len(df["Category"].unique()),

        "rating":

            round(df["Rating"].mean(), 2)

    }

    return jsonify(data)


# ============================
# MAIN
# ============================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )