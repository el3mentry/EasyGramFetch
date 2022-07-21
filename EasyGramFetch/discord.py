from discord_webhook import DiscordWebhook
from dotenv import load_dotenv


load_dotenv()


def send_to_discord(file: str, url: str) -> bool:
    webhook = DiscordWebhook(url=url)
    
    with open(file, "rb") as f:
        webhook.add_file(file=f.read(), filename=file.split("/")[-1])

    webhook.execute()