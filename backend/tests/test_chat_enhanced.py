"""
Tests for Task 2: Refactor POST /chat/enhanced from Form to JSON body.

- New Pydantic model ChatEnhancedRequest in models.py
- Endpoint accepts JSON body instead of Form params
- chat_history is included in the prompt
- Existing POST /chat (SSE) remains unchanged
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from models import EnhancedChatResponse


# ── Model validation ──────────────────────────────────────────────────────


def test_chat_enhanced_request_model_exists():
    """ChatEnhancedRequest must be defined in models.py."""
    from models import ChatEnhancedRequest

    req = ChatEnhancedRequest(query="What is AI?")
    assert req.query == "What is AI?"
    assert req.model_provider == "gemini"
    assert req.include_references is True
    assert req.chat_history == []


def test_chat_enhanced_request_with_history():
    """ChatEnhancedRequest should accept chat_history."""
    from models import ChatEnhancedRequest

    history = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"},
    ]
    req = ChatEnhancedRequest(query="Follow up", chat_history=history)
    assert len(req.chat_history) == 2
    assert req.chat_history[0]["role"] == "user"


def test_chat_enhanced_request_validation_provider():
    """model_provider must be 'gemini' or 'claude'."""
    from pydantic import ValidationError

    from models import ChatEnhancedRequest

    with pytest.raises(ValidationError):
        ChatEnhancedRequest(query="test", model_provider="openai")


# ── Endpoint accepts JSON ────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_chat_enhanced_accepts_json(client, patch_services):
    """POST /chat/enhanced must accept JSON body, not Form."""
    import main

    fake_response = EnhancedChatResponse(
        response="AI is amazing",
        references=[],
        confidence_score=0.85,
        model_used="gemini",
    )

    with patch.object(
        main, "generate_enhanced_response", new_callable=AsyncMock, return_value=fake_response
    ):
        # Send JSON body (not Form data)
        response = await client.post(
            "/chat/enhanced",
            json={
                "query": "What is AI?",
                "model_provider": "gemini",
                "include_references": True,
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "references" in data
    assert "confidence_score" in data
    assert "model_used" in data


@pytest.mark.asyncio
async def test_chat_enhanced_with_history_json(client, patch_services):
    """POST /chat/enhanced with chat_history in JSON body."""
    import main

    fake_response = EnhancedChatResponse(
        response="Follow up answer",
        references=[],
        confidence_score=0.85,
        model_used="gemini",
    )

    with patch.object(
        main, "generate_enhanced_response", new_callable=AsyncMock, return_value=fake_response
    ) as mock_fn:
        response = await client.post(
            "/chat/enhanced",
            json={
                "query": "Tell me more",
                "chat_history": [
                    {"role": "user", "content": "What is AI?"},
                    {"role": "assistant", "content": "AI is..."},
                ],
            },
        )

    assert response.status_code == 200
    # Verify chat_history was forwarded to the function
    call_kwargs = mock_fn.call_args.kwargs
    assert call_kwargs["chat_history"] == [
        {"role": "user", "content": "What is AI?"},
        {"role": "assistant", "content": "AI is..."},
    ]


# ── Existing /chat SSE endpoint unchanged ────────────────────────────────


@pytest.mark.asyncio
async def test_chat_sse_still_accepts_form(client, patch_services):
    """POST /chat must still accept Form params (SSE streaming)."""
    import main

    async def fake_stream(query, provider):
        yield "chunk1"
        yield "chunk2"

    with patch.object(main, "generate_response_stream", side_effect=fake_stream):
        response = await client.post(
            "/chat",
            data={"query": "test", "model_provider": "gemini"},
        )

    assert response.status_code == 200
    assert response.headers.get("content-type", "").startswith("text/event-stream")


@pytest.mark.asyncio
async def test_chat_enhanced_form_rejected(client, patch_services):
    """POST /chat/enhanced with Form data should return 422 (expects JSON)."""
    response = await client.post(
        "/chat/enhanced",
        data={"query": "test", "model_provider": "gemini"},
    )
    # Should fail because the endpoint expects JSON body, not form
    assert response.status_code == 422
