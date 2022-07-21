import urllib.request
import random
import os
from discord import send_to_discord
from video_compressor import compress_video


get_random_name = lambda: ''.join(random.choices([chr(i) for i in range(65, 90+1)], k=10))
TARGET_SIZE = 7.9


def __download_media(url: str):
    f = None
    filepath: str = f"{os.getcwd()}/media/{get_random_name()}"
    extension: str = ""

    extension = ".mp4" if ".mp4" in url else ".jpg"

    f = open(f'{filepath + extension}','wb')
    f.write(urllib.request.urlopen(url).read())
    f.close()

    return filepath + extension

def corresponding_webhook_url(senderid: str) -> str:
    return os.getenv(senderid)


def download_send_remove(url: str, senderid: str):
    filepath: str = __download_media(url)
    filesize: int = os.path.getsize(filepath)
    filesize_in_mbs: float = filesize / 10**6

    if filesize_in_mbs > TARGET_SIZE:
        # compress.
        extension = ".mp4" if ".mp4" in url else ".jpg"
        new_filepath: str = f"{os.getcwd()}/media/{get_random_name()}" + extension
        compress_video(filepath, new_filepath, 7.9 * 1000)
        os.remove(filepath)  # remove old file
        filepath = new_filepath

    send_to_discord(file=filepath, url=corresponding_webhook_url(senderid))

    os.remove(filepath)