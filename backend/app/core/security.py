from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader

# Placeholder auth: accepts any request with optional X-API-Key; real JWT/RBAC to be added.
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_current_user(api_key: str | None = Depends(api_key_header)) -> dict:
    if api_key is None:
        # In real impl, enforce authentication; here we allow anonymous for dev.
        return {"sub": "dev-user"}
    # TODO: validate api_key/JWT and attach roles/scopes
    return {"sub": api_key}
