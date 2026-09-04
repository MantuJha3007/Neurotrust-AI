from app.mcp.server import mcp
from app.core.config import get_settings

if __name__ == "__main__":
    mcp.run(transport=get_settings().mcp_transport)
