import os
import json
import google.generativeai as genai
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        self.model = genai.GenerativeModel(self.model_name)
        
        # Generation config
        self.generation_config = {
            "temperature": float(os.getenv("LLM_TEMPERATURE", "0.3")),
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": int(os.getenv("LLM_MAX_TOKENS", "2000")),
        }
        
        logger.info(f"Initialized Gemini service with model: {self.model_name}")
    
    async def chat(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Send a chat message to Gemini and get response
        
        Args:
            user_message: The user's message
            conversation_history: List of previous messages [{"role": "user/assistant", "content": "..."}]
            system_prompt: Optional system prompt to set context
        
        Returns:
            The assistant's response
        """
        try:
            # Build conversation context
            chat = self.model.start_chat(history=[])
            
            # Add system prompt if provided
            if system_prompt:
                chat.send_message(f"SYSTEM: {system_prompt}")
            
            # Add conversation history
            if conversation_history:
                for msg in conversation_history[-10:]:  # Last 10 messages for context
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    
                    if role == "user":
                        chat.send_message(content)
            
            # Send current message
            response = chat.send_message(
                user_message,
                generation_config=self.generation_config
            )
            
            return response.text
        
        except Exception as e:
            logger.error(f"Error in Gemini chat: {str(e)}")
            raise
    
    async def generate_with_prompt(
        self,
        prompt_template: str,
        variables: Dict[str, any] = None
    ) -> str:
        """
        Generate content using a prompt template
        
        Args:
            prompt_template: Template string with {variable} placeholders
            variables: Dictionary of variables to replace in template
        
        Returns:
            Generated text response
        """
        try:
            # Replace variables in template
            if variables:
                prompt = prompt_template.format(**variables)
            else:
                prompt = prompt_template
            
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config
            )
            
            return response.text
        
        except Exception as e:
            logger.error(f"Error generating content: {str(e)}")
            raise
    
    async def stream_chat(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        system_prompt: Optional[str] = None
    ):
        """
        Stream chat response for real-time display
        
        Args:
            user_message: The user's message
            conversation_history: List of previous messages
            system_prompt: Optional system prompt
        
        Yields:
            Chunks of the response as they're generated
        """
        try:
            chat = self.model.start_chat(history=[])
            
            if system_prompt:
                chat.send_message(f"SYSTEM: {system_prompt}")
            
            if conversation_history:
                for msg in conversation_history[-10:]:
                    if msg.get("role") == "user":
                        chat.send_message(msg.get("content", ""))
            
            response = chat.send_message(
                user_message,
                generation_config=self.generation_config,
                stream=True
            )
            
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        
        except Exception as e:
            logger.error(f"Error in streaming chat: {str(e)}")
            raise
    
    def load_prompt_template(self, template_name: str) -> str:
        """Load a prompt template from the knowledge/prompts directory"""
        template_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "knowledge",
            "prompts",
            f"{template_name}.txt"
        )
        
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            logger.warning(f"Prompt template not found: {template_name}")
            return ""

# Singleton instance
gemini_service = GeminiService()
