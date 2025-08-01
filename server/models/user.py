from pydantic import BaseModel

class UserCredentials(BaseModel):
    email: str
    password: str  # plaintext for now (but hash in real apps)
