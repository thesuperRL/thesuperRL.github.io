import json


def read_json_file():
    try:
        with open("songs/songs_URL.json", 'r', encoding='utf-8') as file:
            data1 = json.load(file)
        with open("songs/songs.json", 'r', encoding='utf-8') as file:
            data2 = json.load(file)
        return data1, data2
    except FileNotFoundError:
        raise
    except json.JSONDecodeError as e:
        raise


try:
    songs_url, songs = read_json_file()
    print("Successfully read JSON file:")
    concat = []
    for i in range(0, len(songs_url)):
        row = songs_url[i]
        row["Unit"] = songs[i]["Unit"]
        row["Singers"] = songs[i]["Singers"]
        if (row['URL'] == "" and row["Unit"] != "VIRTUAL SINGER"):
            row["URL"] = input(row["Song title"] + " " + str(row["Singers"]) + " " + row["Producer"] + ">> ")
        concat.append(row)

    # Save in JSON file format
    with open("songs/concat_songs.json", 'w', encoding='utf-8') as file:
        json.dump(concat, file, indent=4, ensure_ascii=False)
except Exception as e:
    print(f"Failed to read JSON file: {e}")