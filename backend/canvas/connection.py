#!/usr/bin/python3
import asyncio
import httpx
import sys
import json
import canvas.canvas as canvas


class ManualCanvasConnection(canvas.CanvasConnection):
    def __init__(self, domain, token) -> None:
        self.token = token
        self.client = httpx.AsyncClient()
        self.domain = domain

    async def __aenter__(self) -> "ManualCanvasConnection":
        return self

    async def request(self, method, url):
        return await self.client.request(
            method,
            self.domain + url,
            headers={"Authorization": f"Bearer {self.token}"},
        )

    async def __aexit__(self, *_):
        await self.client.aclose()


TOKEN = "YOUR API TOKEN"
DOMAIN = "https://uvadlo-dev.test.instructure.com"


async def main(arg):
    async with ManualCanvasConnection(DOMAIN, TOKEN) as conn:
        response = await conn.request("get", arg)
        j = json.loads(response.text)
        print(json.dumps(j, indent=2))


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1]))
