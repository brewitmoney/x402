# ./adk_agent_samples/mcp_agent/agent.py
import os # Required for path operations
from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters
from google.adk.models.lite_llm import LiteLlm


# It's good practice to define paths dynamically if possible,
# or ensure the user understands the need for an ABSOLUTE path.
# For this example, we'll construct a path relative to this file,
# assuming '/path/to/your/folder' is in the same directory as agent.py.
# REPLACE THIS with an actual absolute path if needed for your setup.
TARGET_FOLDER_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "/home/koshik/Documents/repos/brewit")
# Ensure TARGET_FOLDER_PATH is an absolute path for the MCP server.
# If you created ./adk_agent_samples/mcp_agent/your_folder,

root_agent = LlmAgent(
    model='gemini-2.0-flash',
    # model=LiteLlm(model="openai/gpt-4o"), # LiteLLM model string format

    name='filesystem_assistant_agent',
    instruction='Help the user manage their files. You can list files, read files, etc.',
    tools=[
        MCPToolset(
            connection_params=StdioConnectionParams(
                server_params = StdioServerParameters(
                    command='pnpm',
                    args=["--silent", "-C", "/home/koshik/Documents/repos/coinbase/x402/examples/typescript/mcp", "dev"],
                    env={"PRIVATE_KEY": "0xd5a81383d70d27010be19ce52b31edb9471da4fada184345af07ecbb7fc6e60a",
                         "DELEGATION_KEY": "ak_v1_5RKK9YENK9VT.SKSRMEX2V3GXEJ1HS61K1GZ47AQZ1XJGGP25HCV3PY75J7AX5Z30.6RYRT",
                    "RESOURCE_SERVER_URL": "http://localhost:4021", "ENDPOINT_PATH": "/weather"}


                ),
            ),
            # Optional: Filter which tools from the MCP server are exposed
            # tool_filter=['list_directory', 'read_file']
        )
    ],
)