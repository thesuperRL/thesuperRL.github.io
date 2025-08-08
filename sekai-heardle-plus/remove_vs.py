import json


def read_json_file():
    try:
        with open("songs/concat_songs.json", 'r', encoding='utf-8') as file:
            data = json.load(file)
        return data
    except FileNotFoundError:
        raise
    except json.JSONDecodeError as e:
        raise


try:
    songs = read_json_file()
    print("Successfully read JSON file:")
    concat = []
    for row in songs:
        if row["Unit"] in ["N/A", "VIRTUAL SINGER"] and row["URL"] == "":
            pass
        else:
            row["URL"] = row["URL"].split("?in=")[0]
            concat.append(row)

    # Save in JSON file format
    with open("songs/concat_songs_non_VS.json", 'w', encoding='utf-8') as file:
        json.dump(concat, file, indent=4, ensure_ascii=False)
except Exception as e:
    print(f"Failed to read JSON file: {e}")