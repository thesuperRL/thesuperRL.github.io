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
        if (row['URL'] == ""):
            row["URL"] = input(row["Song title"] + " " + str(row["Singers"]) + " " + row["Producer"] + ">> ")
        concat.append(row)

    # Save in JSON file format
    with open("songs/concat_songs.json", 'w', encoding='utf-8') as file:
        json.dump(concat, file, indent=4, ensure_ascii=False)
except Exception as e:
    print(f"Failed to read JSON file: {e}")

# *Hello, Planet. ['Hatsune Miku']>> https://soundcloud.com/dany-rimache-auqui/hatsune-miku-hello-planet
# World's End Dancehall ['Hatsune Miku', 'Megurine Luka']>> https://soundcloud.com/shadstrike/worlds-end-dancehall
# Romeo and Cinderella ['Hatsune Miku', 'Momoi Airi', 'Hinomori Shizuku']>> https://soundcloud.com/loveclubs/romeo-and-cinderella-shizuku-airi-more-more-jump-from-project-sekai
# Miku Miku ni Shite Ageru ♪ 【Shiteyanyo】 ['Hatsune Miku']>> https://soundcloud.com/bloggermicro/miku-miku-ni-shite-ageru
# Brand New Day ['Hatsune Miku']>> https://soundcloud.com/irucaice/brandnewday
# Hatsune Miku no Gekishou ['Hatsune Miku']>>