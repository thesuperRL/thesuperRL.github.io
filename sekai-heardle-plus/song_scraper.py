import requests
from bs4 import BeautifulSoup
import pandas as pd
import random
import time
from fake_useragent import UserAgent

def extract_client_id(html):
    """Extract client_id from SoundCloud's JavaScript"""
    import re
    match = re.search(r'client_id:"([a-zA-Z0-9]+)"', html)
    return match.group(1) if match else None

def get_top_soundcloud_result(search_query):
    max_retries = 3

    # Print query for checking progress
    print(search_query)

    session = requests.Session()
    ua = UserAgent()
    session.headers.update({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
        'Upgrade-Insecure-Requests': '1'
    })

    url = f"https://soundcloud.com/search?q={requests.utils.quote((search_query + " Project Sekai"))}"

    for attempt in range(max_retries):
        try:
            # Rotate user agent and add delay
            session.headers['User-Agent'] = ua.random
            time.sleep(random.uniform(1.5, 4))

            # Get client_id from SoundCloud's JavaScript (this is crucial)
            homepage = session.get("https://soundcloud.com", timeout=10)
            client_id = extract_client_id(homepage.text)  # See helper function below

            # Now make the search request with client_id
            response = session.get(url, timeout=10, cookies={'client_id': client_id})

            if response.status_code == 403:
                raise requests.HTTPError("403 Forbidden")

            soup = BeautifulSoup(response.text, 'html.parser')
            if result := soup.find('h2', {'class': 'searchItem__title'}):
                return f"https://soundcloud.com{result.a['href']}"
            return None

        except requests.RequestException as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt == max_retries - 1:
                print(f"Error occurred while searching SoundCloud: {e}")
                return "ERROR"
            time.sleep(random.uniform(2, 5))  # Longer delay between retries

    return None

def replace_singers(singers):
    bands = {
        "Leo/need" : "Leo/need (Hoshino Ichika, Tenma Saki, Mochizuki Honami, Hinomori Shiho)",
        "Vivid BAD SQUAD" : "Vivid BAD SQUAD (Azusawa Kohane, Shiraishi An, Shinonome Akito, Aoyagi Toya)",
        "Wonderlands×Showtime" : "Wonderlands×Showtime(Tenma Tsukasa, Otori Emu, Kusanagi Nene, Kamishiro Rui)",
        "MORE MORE JUMP!" : "MORE MORE JUMP! (Hanasato Minori, Kiritani Haruka, Momoi Airi, Hinomori Shizuku)",
        "25-ji, Nightcord de." : "25-ji, Nightcord de. (Yoisaki Kanade, Asahina Mafuyu, Shinonome Ena, Akiyama Mizuki)",
    }

    singers_list = singers.split(",")
    # Replace bands with key
    # singers_list = [bands.get(item, item) for item in singers_list]
    # Remove prefix/suffix whitespaces
    singers_list = [item.strip() for item in singers_list]

    # Remove N/A from either versions lists
    if "N/A" in singers_list:
        singers_list.remove("N/A")
    if "25-ji" in singers_list:
        singers_list.remove("25-ji")
        singers_list.remove("Nightcord de.")
        singers_list.append("25-ji, Nightcord de.")

    # Remove dupes
    singers_list = list(dict.fromkeys(singers_list))

    return singers_list

def scrape_sekaipedia_songs():
    # URL of the page to scrape
    url = "https://www.sekaipedia.org/wiki/List_of_songs"

    # Set a user-agent header to mimic a browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        # Send HTTP request to the website
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an error for bad status codes

        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find all tables on the page (Sekaipedia uses wikitable class)
        tables = soup.find_all('table', {'class': 'wikitable'})

        if not tables:
            print("No tables found on the page.")
            return

        # Initialize a list to store all songs
        all_songs = []

        # Process each table
        for i, table in enumerate(tables):
            print(f"\nProcessing Table {i + 1}...")

            # Extract table headers
            headers = []
            header_row = table.find('tr')
            for th in header_row.find_all('th'):
                headers.append(th.get_text(strip=True))

            # Extract table rows
            rows = []
            for row in table.find_all('tr')[1:]:  # Skip header row
                cells = row.find_all(['td', 'th'])
                row_data = [cell.get_text(strip=True) for cell in cells]
                rows.append(row_data)

            # Create a DataFrame for the current table
            df = pd.DataFrame(rows, columns=headers)

            # Add a column to indicate which table the data came from
            df['Table'] = f"Table {i + 1}"

            # Add to the master list
            all_songs.append(df)

            # Print sample from this table
            print(f"Found {len(rows)} songs in this table")
            print(df.head())

        # Combine all tables into one DataFrame
        if all_songs:
            combined_df = pd.concat(all_songs, ignore_index=True)
            print("\nSuccessfully scraped all tables!")
            print(f"Total songs scraped: {len(combined_df)}")

            # Save to CSV
            combined_df.to_csv('songs/sekaipedia_songs.csv', index=False)
            print("Data saved to 'sekaipedia_songs.csv'")

            # Create singers column
            combined_df['Singers_Concatenated'] = combined_df["VIRTUAL SINGER ver. singers"] + "," + combined_df["SEKAI ver. singers"]
            combined_df['Singers'] = combined_df['Singers_Concatenated'].apply(replace_singers)

            # Search for the URLs
            combined_df['URL'] = ""
            # Remove rows where URLs error
            # combined_df = combined_df[combined_df['URLs'] != 'ERROR']

            # Remove unneeded columns
            selected_df = combined_df[['Song title', 'Producer', 'Singers', 'Date added', 'Unit', 'URL']]

            # Save in JSON file format
            selected_df.to_json('songs/songs.json', orient='records', indent=2)

            return combined_df
        else:
            print("No song data found in any tables.")
            return None

    except requests.exceptions.RequestException as e:
        print(f"Error fetching the webpage: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")


scrape_sekaipedia_songs()