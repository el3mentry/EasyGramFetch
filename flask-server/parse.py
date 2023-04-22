from typing import Union
import json
from typing import Dict, List


VIDEO = "video_versions"
IMAGE = "image_versions2"
CAROUSEL = "carousel_media"
ITEMS = 'items'


def __detect_post_type(parent: Union[Dict, List]) -> str:
    type_ = ""

    if parent.get(VIDEO):
        type_ = 'video'
    elif parent.get(IMAGE):
        type_ = 'image'
    elif parent.get(CAROUSEL):
        type_ = 'carousel'

    return type_


def __get_parent(json_dict: json) -> Union[Dict, List]:
    return json_dict.get(ITEMS)[0]


def __get_parsed_image_items(parent: Union[Dict, List]) -> list:
    parsed_items = list()

    # image not working, throwing empty list

    if parent.get(IMAGE):
        candidates: list = parent.get(IMAGE).get('candidates')
        first_item: dict = candidates[0]
        url: str = first_item.get('url')
        parsed_items.append(url)

    return parsed_items


def __get_parsed_video_items(parent: Union[Dict, List]) -> list:
    parsed_items = list()

    if parent.get(VIDEO):
        versions: list = parent.get(VIDEO)
        first_item: dict = versions[0]
        url = first_item.get("url")

        parsed_items.append(url)
    
    return parsed_items


def __get_parsed_carousel_items(parent: Union[Dict, List]) -> list:
    parsed_urls = list()

    for child in parent:
        child: dict

        # if child.get(VIDEO)[0].get('url'):

        if child.get(VIDEO):
            first_element: dict = child.get(VIDEO)[0]
            url: str = first_element.get('url')

        elif child.get(IMAGE):
            candidates: list = child.get(IMAGE).get('candidates')
            first_element: dict = candidates[0]
            url: str = first_element.get('url')
        
        parsed_urls.append(url)

    return parsed_urls


def parse_urls_in_json(json_dict: json) -> list:
    parent = __get_parent(json_dict)
    post_type = __detect_post_type(parent)

    parsed_items = list()
    if post_type == 'image':
        parsed_items: list = __get_parsed_image_items(parent)
    elif post_type == 'video':
        parsed_items: list = __get_parsed_video_items(parent)
    elif post_type == 'carousel':
        parsed_items: list = __get_parsed_carousel_items(parent.get(CAROUSEL))
    else:
        print("can't determine post type")
    
    return parsed_items