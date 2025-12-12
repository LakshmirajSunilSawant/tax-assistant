import os
import httpx
from typing import List, Dict, Optional
import logging
import json

logger = logging.getLogger(__name__)

class OllamaService:
    """Service for interacting with local Ollama API"""
    
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model_name = os.getenv("OLLAMA_MODEL", "llama3.2")
        self.temperature = float(os.getenv("LLM_TEMPERATURE", "0.3"))
        self.max_tokens = int(os.getenv("LLM_MAX_TOKENS", "2000"))
        
        logger.info(f"Initialized Ollama service with model: {self.model_name}")
    
    async def chat(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Send a chat message to Ollama and get response
        
        Args:
            user_message: The user's message
            conversation_history: List of previous messages
            system_prompt: Optional system prompt to set context
        
        Returns:
            The assistant's response
        """
        try:
            messages = []
            
            # Add system prompt if provided
            if system_prompt:
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })
            
            # Add conversation history
            if conversation_history:
                for msg in conversation_history[-10:]:
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    if role in ["user", "assistant"]:
                        messages.append({
                            "role": role,
                            "content": content
                        })
            
            # Add current user message
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            # Make request to Ollama API
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": self.model_name,
                        "messages": messages,
                        "stream": False,
                        "options": {
                            "temperature": self.temperature,
                            "num_predict": self.max_tokens
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("message", {}).get("content", "I couldn't generate a response.")
                else:
                    logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                    raise Exception(f"Ollama API returned status {response.status_code}")
        
        except httpx.ConnectError:
            logger.error("Cannot connect to Ollama. Make sure Ollama is running (ollama serve)")
            raise Exception("Ollama is not running. Please start it with 'ollama serve'")
        except Exception as e:
            logger.error(f"Error in Ollama chat: {str(e)}")
            raise
    
    async def generate_with_prompt(
        self,
        prompt_template: str,
        variables: Dict[str, any] = None
    ) -> str:
        """Generate content using a prompt template"""
        try:
            if variables:
                prompt = prompt_template.format(**variables)
            else:
                prompt = prompt_template
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": self.temperature,
                            "num_predict": self.max_tokens
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "")
                else:
                    raise Exception(f"Ollama API returned status {response.status_code}")
        
        except Exception as e:
            logger.error(f"Error generating content: {str(e)}")
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

# Create singleton instance
ollama_service = OllamaService()
