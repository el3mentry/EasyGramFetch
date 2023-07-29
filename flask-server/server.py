# 'server.py' receives the shortcode from 'index.js' file running the IG Messenger Webhook.

from dotenv import load_dotenv
from flask import Flask, request
from file import download_send_remove
from typing import Union

from scrape import login_and_scrape
import os
from parse import parse_urls_in_json


load_dotenv()
APP = Flask(__name__)
USERNAME = "IGUSERNAME"
PASSWORD = "IGPASSWORD"


@APP.route("/scrape", methods=["GET", "POST"])
def scrape() -> str:

    # url: https://www.instagram.com/stories/username/51651321653213535
    # or
    # url: https://www.instagram.com/p/shortcode

    url: str = request.json['url']
    print('url received: ', url)

    credentials = {
        "username": os.getenv(USERNAME),
        "password": os.getenv(PASSWORD)
    }

    scraped_data: Union[dict, str] = login_and_scrape(url, credentials)
    parsed_urls = ""

    
    if isinstance(scraped_data, str):
        # story url
        if scraped_data != "":
            download_send_remove(scraped_data)
        else:
            print('cookies expired.')

    else:
        # post urls
        if scraped_data != {}:
            parsed_urls: list = parse_urls_in_json(scraped_data)
            for url in parsed_urls:
                download_send_remove(url)
        else:
            print('cookies expired.')

    return ""


if __name__ == "__main__":
    APP.run(debug=True)  # comment this when running python server on different VM
    # APP.run(host='0.0.0.0', debug=True) # uncomment this when running python server on different VM
