from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str


class CreateUserRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "user"