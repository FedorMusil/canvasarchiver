import httpx


def flatten_dict(indict: dict) -> dict:
    res = dict()
    for key, value in indict.items():
        if isinstance(value, dict):
            value: dict
            value = flatten_dict(value)
            for k, v in value.items():
                res[f"{key}[{k}]"] = v
        elif isinstance(value, list) or isinstance(value, tuple):
            res[f"{key}[]"] = value
        else:
            res[key] = value
    return res


def parse_link_header(response: httpx.Response):
    # https://www.w3.org/Protocols/9707-link-header.html
    if "Link" not in response.headers:
        return
    header_value = response.headers["Link"]
    links = header_value.split(",")
    for link in links:
        url, *labels = link.split(";")

        def param_it():
            for label in labels:
                if label[0] == " ":
                    label = label[1:]
                paramname, value = label.split("=")
                if paramname != "rel":
                    continue
                value = value[1:-1]
                value = value.split(" ")
                for rel in value:
                    yield rel

        url = url[1:-1]
        yield url, param_it


def get_link_rel(response: httpx.Response, target: str):
    for url, rel_it in parse_link_header(response):
        for rel in rel_it():
            if rel == target:
                return url
    return None
