from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from services.ollama_service import ollama_service
from services.tax_engine import tax_engine
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_id: str

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    message_type: str = "text"
    metadata: Optional[Dict] = None

# In-memory conversation storage (replace with Supabase in production)
conversations = {}

@router.post("/", response_model=ChatResponse)
async def send_message(chat_message: ChatMessage):
    """Send a message to the tax assistant and get a response"""
    try:
        logger.info(f"Received message from user {chat_message.user_id}: {chat_message.message[:50]}...")
        
        # Get or create conversation
        conv_id = chat_message.conversation_id or f"conv_{chat_message.user_id}_{len(conversations)}"
        
        if conv_id not in conversations:
            conversations[conv_id] = {
                "messages": [],
                "user_context": {
                    "income_sources": [],
                    "total_income": None,
                    "deductions": {},
                    "is_director": False,
                    "has_foreign_assets": False,
                }
            }
        
        conversation = conversations[conv_id]
        
        # Add user message to history
        conversation["messages"].append({
            "role": "user",
            "content": chat_message.message
        })
        
        try:
            # Load ITR selection prompt
            logger.info("Loading prompt template...")
            system_prompt = ollama_service.load_prompt_template("itr_selection")
            user_context_str = f"""
Income sources identified: {', '.join(conversation['user_context']['income_sources']) if conversation['user_context']['income_sources'] else 'None yet'}
Total income: {conversation['user_context']['total_income'] or 'Not specified'}
            """
            
            system_prompt = system_prompt.format(user_context=user_context_str)
            logger.info("Prompt template loaded successfully")
        except Exception as e:
            logger.error(f"Error loading prompt: {str(e)}")
            # Use default prompt if template fails
            system_prompt = "You are a helpful tax assistant for Indian citizens. Help them with ITR selection and tax queries."
        
        try:
            # Get AI response
            logger.info("Calling Gemini API...")
            ai_response = await ollama_service.chat(
                user_message=chat_message.message,
                conversation_history=conversation["messages"][-10:],
                system_prompt=system_prompt
            )
            logger.info(f"Got response from Gemini: {ai_response[:100]}...")
        except Exception as e:
            logger.error(f"Error calling Gemini: {str(e)}")
            # Fallback response if LLM fails
            ai_response = f"Hello! I'm your tax assistant. I understand you said: '{chat_message.message}'. How can I help you with your tax filing today?"
        
        # Add assistant response to history
        conversation["messages"].append({
            "role": "assistant",
            "content": ai_response
        })
        
        # Extract context from user message (simple keyword matching)
        message_lower = chat_message.message.lower()
        if "salary" in message_lower or "salaried" in message_lower:
            if "salary" not in conversation["user_context"]["income_sources"]:
                conversation["user_context"]["income_sources"].append("salary")
        if "business" in message_lower:
            if "business" not in conversation["user_context"]["income_sources"]:
                conversation["user_context"]["income_sources"].append("business")
        if "freelance" in message_lower or "consultant" in message_lower:
            if "freelance" not in conversation["user_context"]["income_sources"]:
                conversation["user_context"]["income_sources"].append("freelance")
        if "rental" in message_lower or "rent" in message_lower:
            if "rental" not in conversation["user_context"]["income_sources"]:
                conversation["user_context"]["income_sources"].append("rental")
        
        return ChatResponse(
            response=ai_response,
            conversation_id=conv_id,
            message_type="text"
        )
    
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@router.get("/history/{conversation_id}")
async def get_conversation_history(conversation_id: str):
    """Get conversation history"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {
        "conversation_id": conversation_id,
        "messages": conversations[conversation_id]["messages"],
        "context": conversations[conversation_id]["user_context"]
    }

@router.post("/reset/{conversation_id}")
async def reset_conversation(conversation_id: str):
    """Reset a conversation"""
    if conversation_id in conversations:
        del conversations[conversation_id]
    
    return {"status": "success", "message": "Conversation reset"}
