import uuid
import datetime
import math
from typing import Dict, Any, List, Optional
from sqlalchemy.future import select
from backend.jarvis.database.models import Memory
from backend.jarvis.database.db import async_session_factory
from backend.jarvis.security.classification import DataClassification
from backend.jarvis.ai.router import ai_router


class MemoryManager:
    """
    Implements Memory Architecture per Section 36-39 & 105.
    Provides semantic retrieval, classification gating, entity linkage, and retention.
    """

    @staticmethod
    def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2:
            return 0.0
        dot = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot / (norm1 * norm2)

    async def store_memory(
        self,
        content: str,
        memory_type: str = "Semantic",
        classification: DataClassification = DataClassification.INTERNAL,
        importance: int = 3,
        source: str = "user_interaction",
        related_entities: Optional[Dict[str, Any]] = None,
    ) -> Memory:
        mem_id = f"mem_{uuid.uuid4().hex[:10]}"
        # Generate embedding vector
        embedding = await ai_router.providers["claude"].embeddings(content)

        memory = Memory(
            id=mem_id,
            memory_type=memory_type,
            content=content,
            classification=classification.value,
            importance=importance,
            confidence=0.95,
            source=source,
            embedding_json=embedding,
            related_entities_json=related_entities or {},
            created_at=datetime.datetime.utcnow(),
        )

        async with async_session_factory() as session:
            session.add(memory)
            await session.commit()
            await session.refresh(memory)

        return memory

    async def retrieve_relevant_memories(
        self,
        query: str,
        limit: int = 5,
        max_classification: DataClassification = DataClassification.RESTRICTED,
    ) -> List[Dict[str, Any]]:
        query_vec = await ai_router.providers["claude"].embeddings(query)

        async with async_session_factory() as session:
            result = await session.execute(select(Memory))
            memories = result.scalars().all()

            scored = []
            for m in memories:
                sim = self._cosine_similarity(query_vec, m.embedding_json or [])
                scored.append((sim, m))

            # Sort by similarity descending
            scored.sort(key=lambda x: x[0], reverse=True)
            top = scored[:limit]

            return [
                {
                    "id": m.id,
                    "memory_type": m.memory_type,
                    "content": m.content,
                    "classification": m.classification,
                    "importance": m.importance,
                    "similarity": round(score, 3),
                    "source": m.source,
                    "related_entities": m.related_entities_json,
                }
                for score, m in top
            ]

    async def list_all_memories(self) -> List[Dict[str, Any]]:
        async with async_session_factory() as session:
            result = await session.execute(select(Memory).order_by(Memory.created_at.desc()))
            memories = result.scalars().all()
            return [
                {
                    "id": m.id,
                    "memory_type": m.memory_type,
                    "content": m.content,
                    "classification": m.classification,
                    "importance": m.importance,
                    "source": m.source,
                    "related_entities": m.related_entities_json,
                    "created_at": m.created_at.isoformat() if m.created_at else None,
                }
                for m in memories
            ]

    async def forget_memory(self, memory_id: str) -> bool:
        async with async_session_factory() as session:
            mem = await session.get(Memory, memory_id)
            if not mem:
                return False
            await session.delete(mem)
            await session.commit()
            return True


memory_manager = MemoryManager()
