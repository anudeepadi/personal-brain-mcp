import asyncio
import importlib.metadata

from personal_brain_mcp.server import mcp


def test_registered_tools():
    names={t.name for t in asyncio.run(mcp.list_tools())}
    assert names=={'search_documents','search_chat_history','get_document_details',
        'list_all_documents','ask_with_citations','save_chat','retrieve_saved_chats',
        'list_saved_chats','import_chat_export','process_chat_command'}


def test_resources_and_templates():
    resources=asyncio.run(mcp.list_resources())
    templates=asyncio.run(mcp.list_resource_templates())
    assert len(resources)+len(templates)==5


def test_api_schema_contains_upload_and_chat_routes():
    from main import app
    paths=app.openapi()['paths']
    assert 'post' in paths['/upsert']
    assert 'get' in paths['/search/documents']
    assert 'post' in paths['/chats/save']
    assert 'get' in paths['/api/health']


def test_package_version_and_command():
    import personal_brain_mcp
    dist=importlib.metadata.distribution('personal-brain-mcp')
    assert dist.version==personal_brain_mcp.__version__
    assert any(e.name=='personal-brain-mcp' and e.value=='personal_brain_mcp.server:main' for e in dist.entry_points)


def test_import_does_not_initialize_remote_services():
    from personal_brain_mcp import services
    assert services.embeddings is None
    assert services.vectorstore is None


def test_stdio_client_can_initialize_and_list_tools():
    import os
    import sys
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client

    async def session():
        parameters=StdioServerParameters(command=sys.executable,
            args=['-m','personal_brain_mcp.server'], env=dict(os.environ))
        async with stdio_client(parameters) as (read,write):
            async with ClientSession(read,write) as client:
                info=await client.initialize()
                assert info.serverInfo.name=='personal-brain'
                tools=await client.list_tools()
                assert len(tools.tools)==10
    asyncio.run(asyncio.wait_for(session(),timeout=30))
