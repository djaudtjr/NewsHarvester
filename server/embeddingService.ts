import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Generate embedding vector for text using OpenAI's embedding model
 * Uses text-embedding-3-small for cost-effectiveness and good performance
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    // Limit text length to avoid API limits (max 8191 tokens)
    const truncatedText = text.slice(0, 8000);
    
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: truncatedText,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("[EmbeddingService] Error generating embedding:", error);
    return null;
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 * Returns a value between -1 and 1, where 1 means identical, 0 means orthogonal, -1 means opposite
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  
  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

/**
 * Check if two articles are semantically similar based on their embeddings
 * @param embedding1 First article embedding
 * @param embedding2 Second article embedding
 * @param threshold Similarity threshold (default 0.85 for high similarity)
 * @returns true if articles are semantically similar
 */
export function areArticlesSimilar(
  embedding1: number[],
  embedding2: number[],
  threshold: number = 0.85
): boolean {
  const similarity = cosineSimilarity(embedding1, embedding2);
  return similarity >= threshold;
}

/**
 * Generate embedding for an article based on title and description
 * Combines title and description for better semantic representation
 */
export async function generateArticleEmbedding(
  title: string,
  description: string | null
): Promise<number[] | null> {
  // Combine title and description for richer semantic meaning
  const textToEmbed = description
    ? `${title}\n\n${description}`
    : title;

  return generateEmbedding(textToEmbed);
}
