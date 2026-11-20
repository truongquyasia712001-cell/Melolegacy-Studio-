# MeloLegacy internal OMR worker

This service is an internal worker adapter, not a public upload API. It accepts PDF only when called by Melobot's private gateway with a shared secret and a UUID task ID. The browser must call the same-origin Melobot endpoint; specialist workers never receive direct external access.

## Engine
Uses the Apache-2.0 `score-reader` package and its published model weights. Upstream documents Python 3.10/3.11, Java 17+, PDF/image input, and MusicXML export. Review upstream license and NOTICE files before distribution:
https://github.com/Luckolite/Sheet-Music-Recognition

## Run
```bash
docker build -t melo-omr .
docker run --rm -p 127.0.0.1:8000:8000 -e MELOBOT_OMR_TOKEN='set-a-long-random-secret' melo-omr
```

## Internal contract
`POST /v1/convert` multipart field `file`, headers:
- `X-Melobot-Token`: secret held only by Melobot gateway
- `X-Melobot-Task-Id`: UUID issued by Melobot

Returns MusicXML with `X-OMR-Review-Required: true`. 25 MB upload cap, 10-minute processing timeout, strict PDF signature check, XML root validation. Do not publish this worker to the public internet. Put it on a private network and route through Melobot only.

## Deployment status
Source adapter only. It has not been built, dependency-installed, model-downloaded, or deployed in this session. The Composer Room's `/api/melobot/composer/omr` same-origin route still needs to be implemented in Melobot and connected to this private worker. A real PDF must then be used for end-to-end validation before enabling the button for general use.
