from typing import List


class Settings:
    PROJECT_NAME: str = "ParseViz"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]


settings = Settings()
