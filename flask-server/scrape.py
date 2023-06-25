from playwright.sync_api import Playwright, sync_playwright
from typing import Union
import time
from json import loads
import os, json
from bs4 import BeautifulSoup

COOKIES_JSON = "cookies.json"
STORY = "stories"


def __get_cookies() -> str:
    with open(COOKIES_JSON, 'r') as cookiestxt:
        cookies = json.loads(cookiestxt.read())
    return cookies

def __save_cookies(cookies: str) -> None:
    with open(COOKIES_JSON, 'w') as cookiestxt:
        cookiestxt.write(json.dumps(cookies))

def __is_cookie_present() -> bool:
    return os.path.exists(COOKIES_JSON)


def __scrape_post(playwright: Playwright, url: str, credentials: dict) -> dict:
    browser = playwright.chromium.launch(headless=True)
    page, context = None, None

    if(__is_cookie_present()):
        cookies = __get_cookies()

        context = browser.new_context()
        context.add_cookies(cookies)

        page = context.new_page()

    else:
        # login
        context = browser.new_context()
        page = context.new_page()

        page.goto("https://www.instagram.com/accounts/login/")
        page.locator("[aria-label='Phone number\, username\, or email']").click()
        page.locator("[aria-label='Phone number\, username\, or email']").fill(credentials["username"])
        page.locator("[aria-label='Password']").click()
        page.locator("[aria-label='Password']").fill(credentials["password"])
        page.locator("button:has-text('Log In')").first.click()

        time.sleep(7)
        
        cookies = context.cookies('https://www.instagram.com')
        __save_cookies(cookies)

    page.goto(url)  # url = .../?__a=1&__d=dis
    page.screenshot(path='media/after_url_append.png')
    json_to_return = {}

    content: str = page.inner_text('pre')
    json_to_return = loads(content)

    if json_to_return.get("status") == "fail":
        os.remove(COOKIES_JSON)
        json_to_return = {}

    browser.close()
    return json_to_return


def __is_story(url: str):
    if(url.split('/')[3].lower() == STORY):
        return True
    else:
        return False



def __scrape_story(playwright: Playwright, url: str, credentials: dict) -> str:
    browser = playwright.chromium.launch(headless=True)
    page, context = None, None
    story_html, source = "", ""

    if(__is_cookie_present()):
        cookies = __get_cookies()

        context = browser.new_context()
        context.add_cookies(cookies)

        page = context.new_page()

    else:
        # login
        context = browser.new_context()
        page = context.new_page()

        page.goto("https://www.instagram.com/accounts/login/")
        page.locator("[aria-label='Phone number\, username\, or email']").click()
        page.locator("[aria-label='Phone number\, username\, or email']").fill(credentials["username"])
        page.locator("[aria-label='Password']").click()
        page.locator("[aria-label='Password']").fill(credentials["password"])
        page.locator("button:has-text('Log In')").first.click()

        time.sleep(7)
        
        cookies = context.cookies('https://www.instagram.com')
        __save_cookies(cookies)

    page.goto(url)  # normal stories url, without __a=1&__d=dis
    # time.sleep(3)

    try:
        # press on 'view story'
        page.locator('text=View story').click()
        time.sleep(2)
        page.screenshot(path='media/screenshot_story.png')

        story_html = page.inner_html('._aa64')
        browser.close()

        soup: BeautifulSoup = BeautifulSoup(story_html, 'html.parser')
        source = soup.video.source['src']

    except AttributeError:
        # video source absent
        source = soup.img['src']
        
    except Exception as e:
        # cookies might got expired (assumed)
        os.remove(COOKIES_JSON)
        print("e = ", e)
        source = ""
    
    finally:
        return str(source)


    # story_html = page.inner_html('._aa64')
    # print(f"{story_html=}")
    # browser.close()

#................................................................................................................

    # soup: BeautifulSoup = BeautifulSoup(story_html, 'html.parser')
    # source: str = ""

    # try:
    #     source = soup.video.source['src']
    # except AttributeError:
    #     # video source absent
    #     source = soup.img['src']

    # return str(source)



def login_and_scrape(url: str, credentials: dict) -> Union[dict, str]:

    with sync_playwright() as playwright:

        if(__is_story(url)):
            json_dict: str = __scrape_story(playwright, url, credentials)
        else:
            url: list = "/".join(url.split('/')[:-1]) + "/?__a=1&__d=dis"
            json_dict: json = __scrape_post(playwright, url, credentials)

        return json_dict